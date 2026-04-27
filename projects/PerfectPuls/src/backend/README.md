# Policy Pilot Backend

AI-powered insurance policy analysis backend using FastAPI, Gemini 2.5 Pro, and Neo4j.

## Quick Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment setup:**
   ```bash
   copy example.env .env
   # Edit .env with your API keys
   ```

3. **Start Neo4j database:**
   ```bash
   # Install Neo4j Desktop or Docker
   # Default connection: bolt://localhost:7687
   ```

4. **Run the API:**
   ```bash
   python main.py
   ```

## API Endpoints

- `POST /api/process-pdf` - Upload and analyze PDF policy documents
- `POST /api/analyze` - Analyze website content from Chrome extension
- `GET /health` - Health check

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Dependencies
├── example.env            # Environment template
├── services/              # Core business logic
│   ├── gemini_service.py  # Gemini PDF processing
│   ├── graph_builder.py   # Neo4j operations
│   └── embedding_service.py # Vector embeddings
├── models/                # Pydantic API models
│   └── api_models.py      # Request/response schemas
├── config/                # Configuration
│   └── settings.py        # Environment settings
└── uploads/               # Temporary file storage
```

## Development Status

- ✅ Project structure created
- ✅ Dependencies defined
- 🔄 Main API implementation
- 🔄 Gemini integration
- 🔄 Neo4j knowledge graph
- 🔄 Chrome extension endpoints