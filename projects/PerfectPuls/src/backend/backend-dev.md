# Policy Pilot Backend - Technical Specification

## Overview
FastAPI backend with two core functionalities:
1. **PDF Processing Pipeline**: Upload PDF → Gemini analysis → Neo4j knowledge graph + embeddings
2. **Website Analysis Pipeline**: Chrome extension data → recursive chunking → RAG similarity search

## Core API Endpoints

### 1. PDF Processing & Knowledge Graph Creation

**Endpoint:** `POST /api/process-pdf`

**Purpose:** 
- Accept PDF upload from frontend
- Extract and analyze policy data using Gemini 2.5 Pro
- Build Neo4j knowledge graph with embeddings for hybrid RAG
- Return processing status and graph metadata

**Request:**
```json
POST /api/process-pdf
Content-Type: multipart/form-data

Body:
- file: PDF binary data
- metadata: {
    "policy_name": "Health Insurance Policy",
    "upload_source": "frontend"
  }
```

**Response:**
```json
{
  "policy_id": "uuid-generated",
  "status": "completed|processing|failed", 
  "extraction_summary": {
    "pages_processed": 25,
    "entities_extracted": 48,
    "nodes_created": 67,
    "relationships_created": 134,
    "embeddings_generated": 89
  },
  "graph_preview": {
    "coverage_types": ["Emergency", "Preventive", "Specialist"],
    "key_entities": ["Deductible: $1500", "Premium: $450/mo"],
    "provider_networks": ["BlueCross Network", "Local Partners"]
  },
  "processing_time_ms": 12500
}
```

### 2. Website Data Analysis & RAG Search

**Endpoint:** `POST /api/analyze`  

**Purpose:**
- Accept website content from Chrome extension (exact format requirement)
- Perform recursive text chunking for optimal processing
- Execute RAG similarity search against knowledge graph
- Return structured coverage analysis in extension's expected format

**Request:** (Exact format from Chrome extension)
```json
POST /api/analyze
Content-Type: application/json

{
  "basic_info": {
    "url": "https://example-wellness.com/services",
    "title": "Downtown Wellness Center - Acupuncture & Massage",
    "domain": "example-wellness.com", 
    "timestamp": "2026-04-25T10:30:00.000Z"
  },
  "page_content": "Downtown Wellness Center - Acupuncture & Massage\n\nProfessional acupuncture and massage therapy services in downtown area...\n\nServices:\n- Traditional Acupuncture ($120/session)\n- Deep Tissue Massage ($95/session)\n- Cupping Therapy ($80/session)\n\nContact Dr. Sarah Chen, Licensed Acupuncturist with 15 years experience..."
}
```

**Response:** (Exact format expected by Chrome extension)
```json
{
  "summary": "Analysis of Downtown Wellness Center shows potential insurance coverage for various health and wellness services. This provider offers services that may be partially or fully covered under different insurance plans.",
  
  "match_checklist": [
    {
      "item": "Provider is in-network with major insurers",
      "status": "✅ covered", 
      "details": "Verified with Aetna, BCBS, UnitedHealth"
    },
    {
      "item": "Services qualify for HSA/FSA reimbursement", 
      "status": "⚠️ partial",
      "details": "Physical therapy and medical massage covered"
    },
    {
      "item": "Prior authorization required",
      "status": "📋 required", 
      "details": "Submit PA form 48 hours before appointment"
    },
    {
      "item": "Copay applies",
      "status": "✅ covered",
      "details": "$25 copay for in-network services"
    }
  ],
  
  "feasibility": {
    "score": 85,
    "color": "Green",
    "message": "High likelihood of coverage approval. Provider meets network requirements."
  },
  
  "money_saved": {
    "session_cost": "$120",
    "your_cost": "$25", 
    "insurance_pays": "$95",
    "savings_per_visit": "$95",
    "potential_annual_savings": "$1,500"
  },
  
  "benefits_services": {
    "service_name": "Acupuncture & Wellness Services",
    "coverage_type": "80% after deductible",
    "copay": "$25 per visit", 
    "renewal_date": "January 1, 2027"
  },
  
  "recommendations": [
    "Based on the analysis, we recommend scheduling an appointment with this provider for your physical therapy needs. Ensure you submit the prior authorization form at least 48 hours before your visit to maximize insurance coverage.",
    "Consider using your HSA/FSA funds for eligible services to maximize tax benefits."
  ]
}
```

**Response Field Requirements:**
- **`summary`** (string): Brief analysis overview text
- **`match_checklist`** (array): Coverage items with exact status icons:
  - `"✅ covered"` - Fully covered/approved
  - `"⚠️ partial"` - Partially covered/conditional  
  - `"❌ denied"` - Not covered/rejected
  - `"📋 required"` - Action required
  - `"ℹ️ info"` - Informational status
- **`feasibility`** (object): Score (0-100), color (`"Green"/"Yellow"/"Red"`), message
- **`money_saved`** (object): Cost breakdown with formatted currency strings
- **`benefits_services`** (object): Service details and coverage info
- **`recommendations`** (array): Actionable advice strings
```

## Technical Architecture

### Tech Stack

**Core Framework:**
```
FastAPI 0.104+                 # Web API framework
uvicorn[standard]              # ASGI server  
python-multipart               # File upload support
```

**AI & Processing:**
```  
google-generativeai            # Gemini 2.5 Pro API (handles PDF processing natively)
langchain                      # Text processing & chunking
langchain-text-splitters       # Recursive text splitting
sentence-transformers          # Embeddings generation
```

**Database & Knowledge Graph:**
```
neo4j                          # Knowledge graph database with vector search
py2neo                         # Neo4j Python driver
numpy                          # Vector operations
```

### Database Schema

**Neo4j Knowledge Graph with Embeddings:**

```cypher
// Core Policy Entities with built-in embeddings
(:Policy {id, name, type, upload_date, embedding: [0.1, 0.2, ...]})
(:Coverage {name, type, description, limits, embedding: [0.1, 0.2, ...]})  
(:Provider {name, network, specialty, location, embedding: [0.1, 0.2, ...]})
(:Service {name, category, codes, description, embedding: [0.1, 0.2, ...]})
(:Cost {type, amount, frequency, conditions, embedding: [0.1, 0.2, ...]})

// Relationships
(:Policy)-[:HAS_COVERAGE]->(:Coverage)
(:Coverage)-[:INCLUDES_SERVICE]->(:Service)
(:Coverage)-[:REQUIRES_PROVIDER]->(:Provider)  
(:Service)-[:HAS_COST]->(:Cost)
(:Coverage)-[:SIMILAR_TO {similarity_score: 0.85}]->(:Coverage)

// Vector similarity queries in Neo4j
// MATCH (s:Service)
// WITH s, gds.similarity.cosine(s.embedding, $queryEmbedding) AS score
// WHERE score > 0.8
// RETURN s ORDER BY score DESC LIMIT 5
```

**Neo4j Vector Search Examples:**
```cypher
// Find similar services using cosine similarity
MATCH (s:Service)
WITH s, gds.similarity.cosine(s.embedding, $queryEmbedding) AS similarity
WHERE similarity > 0.8
RETURN s.name, s.description, similarity
ORDER BY similarity DESC LIMIT 5

// Find coverage for similar services via graph traversal
MATCH (s:Service)
WITH s, gds.similarity.cosine(s.embedding, $queryEmbedding) AS similarity
WHERE similarity > 0.8
MATCH (s)<-[:INCLUDES_SERVICE]-(c:Coverage)
RETURN c.name, c.description, s.name, similarity
ORDER BY similarity DESC
```

## Implementation Phases

### Phase 1: PDF Processing Pipeline (2 hours)

**File Structure:**
```
backend/
├── main.py                    # FastAPI app entry point
├── requirements.txt           # Dependencies
├── services/
│   ├── __init__.py
│   ├── gemini_service.py      # Gemini PDF processing + analysis
│   ├── graph_builder.py       # Neo4j operations  
│   └── embedding_service.py   # Vector embeddings
├── models/
│   ├── __init__.py
│   └── api_models.py          # Pydantic request/response models
└── config/
    ├── __init__.py
    └── settings.py            # Environment configuration
```

**Key Components:**
1. **PDF Upload Handler** - File validation, temporary storage
2. **Gemini Integration** - Direct PDF processing with structured analysis prompts  
3. **Entity Extraction** - Parse Gemini response into structured data
4. **Graph Builder** - Create Neo4j nodes and relationships
5. **Embedding Generator** - Create vector embeddings for all entities

### Phase 2: Website Analysis Pipeline (1.5 hours)

**Key Components:**
1. **Content Chunker** - Recursive character text splitting
2. **RAG Search Engine** - Vector similarity + graph traversal  
3. **Response Formatter** - Structure results for Chrome extension
4. **Similarity Scorer** - Confidence calculations

## Environment Configuration

**.env Template:**
```bash
# Gemini AI
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Neo4j Database (with vector capabilities)
NEO4J_URI=bolt://localhost:7687  
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
NEO4J_DATABASE=policy_pilot

# API Settings
DEBUG=true
HOST=0.0.0.0  
PORT=8000
CORS_ORIGINS=chrome-extension://*

# File Processing
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10MB
ALLOWED_EXTENSIONS=pdf

# Gemini PDF Processing
GEMINI_MAX_PDF_SIZE=20MB
GEMINI_TIMEOUT_SECONDS=60

# Extension Integration
EXTENSION_ENDPOINT=http://localhost:8000/api/analyze
FALLBACK_RESPONSE=true
```

## Gemini Integration Strategy

**Policy Analysis Prompt Template:**
```python
POLICY_ANALYSIS_PROMPT = """
Analyze this insurance policy PDF document and extract structured information:

Extract the following in JSON format:
1. Policy Overview: type, coverage period, premium, deductible
2. Covered Services: list with descriptions, limitations, codes
3. Provider Networks: names, specialties, geographic coverage  
4. Cost Structure: copays, coinsurance, out-of-pocket limits
5. Authorization Requirements: services needing prior auth
6. Exclusions: what's not covered and why

Return as valid JSON with this exact structure:
{json_schema}
"""

# Usage with Gemini 2.5 Pro
async def process_pdf_with_gemini(pdf_file_data: bytes):
    response = model.generate_content([
        POLICY_ANALYSIS_PROMPT,
        {"mime_type": "application/pdf", "data": pdf_file_data}
    ])
    return response.text
```

**Website Analysis Prompt Template:**
```python
WEBSITE_ANALYSIS_PROMPT = """  
Analyze this healthcare website content against insurance policy knowledge base:

WEBSITE URL: {url}
WEBSITE TITLE: {title}
DOMAIN: {domain}

WEBSITE CONTENT:
{page_content}

RELEVANT POLICY DATA FROM GRAPH RAG:
{rag_context}

Based on the website content and insurance knowledge, provide analysis in this exact format:

1. SUMMARY: Brief analysis overview of coverage potential
2. CHECKLIST ITEMS: Coverage verification points with status:
   - Use "✅ covered" for fully covered items
   - Use "⚠️ partial" for partially covered items  
   - Use "❌ denied" for not covered items
   - Use "📋 required" for action required items
   - Use "ℹ️ info" for informational items
3. FEASIBILITY: Score (0-100), Color (Green/Yellow/Red), Message
4. COST BREAKDOWN: Service cost, your cost, insurance coverage, savings
5. SERVICE DETAILS: Coverage type, copay, renewal information
6. RECOMMENDATIONS: Actionable advice for the user

Focus on practical, actionable insights for insurance coverage decisions.
"""
```

## Error Handling & HTTP Status Codes

**Required Response Codes (per Chrome extension specification):**
- **200 OK**: Successful analysis completed
- **400 Bad Request**: Invalid request format (missing required fields)  
- **500 Internal Server Error**: Server error during analysis

**Error Response Format:**
```json
{
  "error": "Invalid request format",
  "message": "Missing required field: page_content", 
  "status_code": 400,
  "fallback_available": true
}
```

**Fallback Handling:**
When the API is unavailable, the extension falls back to dummy data with the same response structure. The backend should be designed for high availability during demonstrations.


This architecture provides exactly what you need: robust PDF processing with knowledge graphs and intelligent website analysis using hybrid RAG!

