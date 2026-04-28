# RAG (Retrieval Augmented Generation) System

## Overview
The RAG system analyzes healthcare websites against insurance policy data stored in Neo4j, providing personalized coverage analysis.

## Architecture

```
Website Data → RAG Service → Neo4j Graph → Gemini AI → Analysis Response
```

## Components

### 1. RAG Service (`services/rag_service.py`)
- **Main Pipeline**: `analyze_website(basic_info, page_content)`
- **Storage**: Stores website content with embeddings in Neo4j
- **Retrieval**: Semantic search against policy nodes
- **Generation**: Gemini AI generates structured analysis

### 2. Data Flow

#### Input (from Chrome Extension):
```json
{
  "basic_info": {
    "url": "https://wellness.com/services", 
    "title": "Wellness Center",
    "domain": "wellness.com",
    "timestamp": "2026-04-25T10:30:00Z"
  },
  "page_content": "Services: Acupuncture ($120), Massage ($95)..."
}
```

#### Processing Steps:
1. **Store Website Data**: Create Website node with embeddings
2. **Extract Services**: Parse services/pricing using Gemini AI
3. **Semantic Search**: Find matching policy coverage using vector similarity  
4. **Generate Analysis**: Create structured response with coverage insights

#### Output:
```json
{
  "summary": "Coverage analysis for wellness services",
  "match_checklist": [
    {"item": "Acupuncture", "status": "✅", "details": "Covered with $25 copay"}
  ],
  "feasibility": {"score": 85, "color": "Green"},
  "money_saved": {"session_cost": "$120", "your_cost": "$25"},
  "benefits_services": {"service_name": "Acupuncture", "copay": "$25"},
  "recommendations": ["Verify with provider", "Check authorization"]
}
```

### 3. Neo4j Graph Schema

#### Website Nodes:
```cypher
(:Website {
  website_id: "website_domain_timestamp",
  url: "https://...",
  title: "Page Title", 
  content: "Full page content",
  embedding: [0.1, 0.2, ...],  # 768-dim vector
  timestamp: "2026-04-25T10:30:00Z"
})
```

#### Policy Nodes (from PDF processing):
```cypher  
(:Service {name: "Acupuncture", coverage_amount: "$120", copay: "$25"})
(:Benefit {name: "Alternative Medicine", description: "..."})
(:Network {name: "Provider Network", details: "..."})
```

### 4. Vector Search
- **Embeddings**: Google Gemini `text-embedding-004` model
- **Similarity**: Cosine similarity with 0.7 threshold
- **Search**: `gds.similarity.cosine()` for vector comparison

## API Endpoints

### POST `/api/analyze`
Analyzes website content against policy data.

**Request**: `AnalyzeRequest` model
**Response**: `AnalyzeResponse` model  
**Processing Time**: ~2-5 seconds

## Testing

```bash
# Start server
python main.py

# Test RAG endpoint
python test_rag.py
```

## Example Use Cases

1. **Acupuncture Clinic**: Check if traditional acupuncture is covered
2. **Massage Therapy**: Analyze deep tissue massage coverage  
3. **Wellness Center**: Review multiple service coverage
4. **Medical Spa**: Check cosmetic vs therapeutic service coverage

## Fallback Behavior
- If Neo4j fails: Returns generic recommendations
- If Gemini fails: Uses regex parsing for service extraction
- If no policy matches: Prompts user to verify coverage manually

## Performance 
- **Website Storage**: ~500ms (embedding generation)
- **Semantic Search**: ~200ms (vector similarity)  
- **Analysis Generation**: ~1-3s (Gemini text generation)
- **Total**: ~2-5s end-to-end

## Future Enhancements
- Cache embeddings for faster repeated searches
- Add confidence scores for coverage predictions  
- Support for multi-language content analysis
- Integration with real-time insurance APIs