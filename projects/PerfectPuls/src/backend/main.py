from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
from datetime import datetime
import logging
import os
import uuid
from pathlib import Path
from fastapi.responses import HTMLResponse

# Local imports
from models.api_models import (
    PDFProcessResponse, AnalyzeRequest, AnalyzeResponse, 
    HealthResponse, ExtractionSummary, GraphPreview
)
from config.settings import settings
from services.gemini_service import gemini_service
from services.neo4j_service import neo4j_service
from services.rag_service import rag_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info("🚀 Policy Pilot Backend starting up...")
    
    # Ensure upload directory exists
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"📁 Upload directory: {upload_dir.absolute()}")
    logger.info(f"🔑 Gemini: {'✅' if settings.google_ai_api_key else '❌'}")
    logger.info(f"🗄️ Neo4j configured: {'✅' if settings.neo4j_uri and settings.neo4j_password else '❌'}")
    
    yield
    
    # Cleanup on shutdown
    logger.info("🔄 Policy Pilot Backend shutting down...")
    await neo4j_service.close()

app = FastAPI(
    title="Policy Pilot API",
    description="AI-powered insurance policy analysis backend",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        message="Policy Pilot API is running",
        timestamp=datetime.now()
    )

@app.post("/api/process-pdf", response_model=PDFProcessResponse)
async def process_pdf(
    file: UploadFile = File(...),
    policy_name: str = Form(...),
    upload_source: str = Form("frontend")
):
    start_time = time.time()
    temp_path = None
    
    try:
        # 1. Validation
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # 2. Save file temporarily (Required for Gemini Files API)
        file_id = str(uuid.uuid4())
        temp_filename = f"{file_id}_{file.filename}"
        temp_path = Path(settings.upload_dir) / temp_filename
        
        # Write the file to disk
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        logger.info(f"📄 Processing PDF: {file.filename} saved to {temp_path}")
        
        # 3. Call the new Graph-ready Service
        metadata = {
            "policy_name": policy_name,
            "upload_source": upload_source,
            "original_filename": file.filename
        }
        
        # Using the rewritten method from the new GeminiService
        processing_result = await gemini_service.process_policy_to_graph(str(temp_path), metadata)
        
        if processing_result.get("status") == "failed":
             raise Exception(processing_result.get("error"))

        # 4. Map Graph Data to the API Response
        # The new service returns { "nodes": [...], "edges": [...] }
        graph_data = processing_result.get("graph_data", {})
        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])

        # 5. Ingest into Neo4j Knowledge Graph
        try:
            neo4j_success = await neo4j_service.ingest_policy_graph(
                policy_id=processing_result["policy_id"],
                graph_data=graph_data,
                metadata=metadata
            )
            if neo4j_success:
                logger.info(f"✅ Policy {processing_result['policy_id']} ingested into Neo4j")
            else:
                logger.warning(f"⚠️ Neo4j ingestion failed for {processing_result['policy_id']}")
        except Exception as neo4j_error:
            logger.error(f"❌ Neo4j ingestion error: {str(neo4j_error)}")
            # Continue processing even if Neo4j fails

        # Filter nodes for preview (e.g., just the Services)
        services = [n.get("properties", {}).get("name") for n in nodes if n.get("label") == "Service"]
        perks = [n.get("properties", {}).get("name") for n in nodes if n.get("label") == "Benefit"]
        networks = [n.get("properties", {}).get("name") for n in nodes if n.get("label") == "Network"]
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return PDFProcessResponse(
            policy_id=processing_result["policy_id"],
            status="completed",
            extraction_summary=ExtractionSummary(
                pages_processed=1, 
                entities_extracted=len(nodes),
                nodes_created=len(nodes),
                relationships_created=len(edges),
                embeddings_generated=len(nodes)
            ),
            graph_preview=GraphPreview(
                coverage_types=services[:5],
                key_entities=perks[:3],
                provider_networks=networks[:3] if networks else ["Provider Network"]
            ),
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"❌ PDF processing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"PDF processing failed: {str(e)}"
        )
    finally:
        # Solo Hack: Clean up the temp file after processing to save disk space
        if temp_path and temp_path.exists():
            os.remove(temp_path)
            logger.info(f"Cleaned up temp file: {temp_path}")

@app.get("/api/visualize-current-policy", response_class=HTMLResponse)
async def visualize_current_policy():
    """
    Automatically serves the interactive graph for the latest policy.
    """
    try:
        # Get the latest ID on the fly
        policy_id = await neo4j_service.get_latest_policy_id()
        
        if not policy_id:
            return HTMLResponse("<h3>No policies found. Upload a PDF to see the graph!</h3>")
            
        html_content = await neo4j_service.generate_interactive_graph(policy_id)
        return HTMLResponse(content=html_content)
    except Exception as e:
        return HTMLResponse(content=f"<h3>Error: {str(e)}</h3>", status_code=500)

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_website(request: AnalyzeRequest):
    """
    Chrome Extension endpoint: Analyzes website content for healthcare services
    Performs Graph RAG against Neo4j policy database
    """
    start_time = time.time()
    
    try:
        logger.info(f"🔍 Analyzing website: {request.basic_info.domain}")
        
        # Perform RAG analysis using the website data
        analysis_result = await rag_service.analyze_website(
            basic_info=request.basic_info.model_dump(),
            page_content=request.page_content
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        logger.info(f"✅ Analysis completed in {processing_time}ms for {request.basic_info.domain}")
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"❌ Website analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Website analysis failed: {str(e)}"
        )

@app.post("/api/upload-policy", response_model=PDFProcessResponse)
async def upload_policy(
    file: UploadFile = File(...),
    policy_name: str = Form(...),
    upload_source: str = Form("frontend")
):
    """
    Frontend-friendly alias for process-pdf endpoint
    """
    return await process_pdf(file, policy_name, upload_source)

@app.get("/api/dashboard-data")
async def get_dashboard_data():
    """
    Get dashboard data for the frontend
    """
    try:
        # Get the latest policy data from Neo4j
        policy_id = await neo4j_service.get_latest_policy_id()
        
        if not policy_id:
            return {
                "status": "no_policies",
                "message": "No policies found",
                "data": None
            }
        
        # You can extend this to return actual user data from your database
        # For now, return a success status so frontend knows backend is connected
        return {
            "status": "success", 
            "message": "Backend connected",
            "policy_id": policy_id,
            "data": {
                "total_policies": 1,
                "last_updated": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Dashboard data error: {str(e)}")
        return {
            "status": "error",
            "message": f"Dashboard data error: {str(e)}",
            "data": None
        }
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=settings.debug)