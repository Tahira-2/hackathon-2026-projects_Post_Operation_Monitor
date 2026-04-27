import google.generativeai as genai
import json
import uuid
import os
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path
from config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiService:
    """
    Revised Gemini Service (2026 Edition)
    Specialized for Graph RAG extraction from Insurance SBCs.
    """
    
    def __init__(self):
        if settings.google_ai_api_key:
            genai.configure(api_key=settings.google_ai_api_key)
            # Use Gemini 2.5 Pro for the complex spatial reasoning of PDF tables
            # generation_config forces the model to output ONLY valid JSON
            self.model = genai.GenerativeModel(
                model_name='gemini-2.5-pro',
                generation_config={"response_mime_type": "application/json"}
            )
            self.embedding_model = "models/gemini-embedding-2"
            logger.info("Gemini 2.5 Pro initialized with Native JSON Mode")
        else:
            self.model = None
            logger.warning("GOOGLE_AI_API_KEY missing. Ensure .env is configured.")

    async def process_policy_to_graph(self, pdf_path: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point: Uploads PDF, Extracts Triples, and Preps for Neo4j.
        """
        if not self.model:
            return {"status": "error", "message": "Model not initialized"}

        try:
            # 1. Upload file using the Files API (handles large PDFs better than raw bytes)
            logger.info(f"Uploading PDF to Gemini Files API: {pdf_path}")
            # upload_file is synchronous, wrapping in thread to keep loop free
            uploaded_file = await asyncio.to_thread(
                genai.upload_file, path=pdf_path, mime_type="application/pdf"
            )

            # 2. Execute the Graph Extraction Prompt
            prompt = self._get_graph_extraction_prompt()
            logger.info(f"Analyzing policy structure for: {metadata.get('policy_name', 'Unknown')}")
            
            response = await self.model.generate_content_async([prompt, uploaded_file])
            
            # Check for empty response (copy-protected PDFs or API issues)
            if not response or not response.text:
                logger.error("❌ Gemini returned an empty response. Check if the PDF is password protected.")
                return {"status": "failed", "error": "Empty response from Gemini"}
                
            # Parse JSON with safe cleaning (sometimes JSON mode still adds markdown)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            graph_data = json.loads(clean_json)
            
            # 4. Wrap with Hackathon-ready metadata
            processing_result = {
                "policy_id": str(uuid.uuid4()),
                "status": "completed",
                "graph_data": graph_data,
                "metadata": metadata,
                "processed_at": datetime.now().isoformat()
            }

            # Save result for local debugging
            try:
                await self._save_locally(processing_result)
            except Exception as save_error:
                logger.error(f"Failed to save locally: {str(save_error)}")
                # Continue processing even if save fails
            
            return processing_result

        except Exception as e:
            logger.error(f"Critical Ingestion Error: {str(e)}")
            return {"status": "failed", "error": str(e)}

    def _get_graph_extraction_prompt(self) -> str:
        """
        The 'Secret Sauce' prompt for Cigna-style Graph RAG.
        Instructs the model to think in terms of Nodes and Edges.
        """
        return """
        Analyze this Insurance Summary of Benefits (SBC) PDF. 
        Your goal is to extract the logical structure of the policy for a Knowledge Graph.
        
        Focus on:
        1. SERVICES (e.g., Physiotherapy, Acupuncture, Gym Membership)
        2. RULES (e.g., Copays, Visit Limits, Deductibles)
        3. PERKS (e.g., Healthy Rewards, Wellness Discounts)
        
        Return a JSON object strictly following this schema:
        {
          "nodes": [
            {"id": "unique_slug", "label": "Service|Category|Benefit|Requirement", "properties": {"name": "string", "description": "string"}}
          ],
          "edges": [
            {"from": "node_id", "to": "node_id", "relationship": "INCLUDES|HAS_LIMIT|SUBJECT_TO|DISCOUNTED_BY", "properties": {"value": "string"}}
          ]
        }
        
        Rules:
        - If a service has a visit limit (e.g., 20 visits), create a HAS_LIMIT edge.
        - If a service is part of Cigna Healthy Rewards, use the DISCOUNTED_BY relationship.
        - Normalize names: use 'Physiotherapy' instead of 'Physical Therapy'.
        """

    async def generate_embedding(self, text: str) -> list[float]:
        """
        Generates a vector using Google's cloud API.
        No local CPU power or DLLs required!
        """
        try:
            result = await asyncio.to_thread(
                genai.embed_content,
                model=self.embedding_model,
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Embedding failed: {e}")
            return []

    async def _save_locally(self, data: Dict[str, Any]):
        """Saves JSON results to sample-pd folder."""
        try:
            # Use specific sample-pd folder path
            save_dir = Path("C:/Users/RBASTAKO/Projects/CareDeviHack/Project/hackathon-2026-projects/projects/PerfectPuls/src/backend/sample-pd")
            save_dir.mkdir(exist_ok=True)
            
            # Create timestamped filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"graph_result_{data['policy_id']}_{timestamp}.json"
            full_path = save_dir / filename
            
            # Write file
            await asyncio.to_thread(self._write_file, str(full_path), data)
            
            if full_path.exists():
                file_size = full_path.stat().st_size
                logger.info(f"📁 Graph result saved to: {full_path} ({file_size} bytes)")
                
        except Exception as e:
            logger.error(f"❌ Save error: {str(e)}")

    def _write_file(self, path, data):
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

# Singleton instance
gemini_service = GeminiService()