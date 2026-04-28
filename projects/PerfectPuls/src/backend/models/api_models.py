from pydantic import BaseModel
from typing import List, Dict, Literal, Optional
from datetime import datetime

# PDF Processing Models
class PDFUploadMetadata(BaseModel):
    policy_name: str
    upload_source: str = "frontend"

class ExtractionSummary(BaseModel):
    pages_processed: int
    entities_extracted: int
    nodes_created: int
    relationships_created: int
    embeddings_generated: int

class GraphPreview(BaseModel):
    coverage_types: List[str]
    key_entities: List[str]
    provider_networks: List[str]

class PDFProcessResponse(BaseModel):
    policy_id: str
    status: Literal["completed", "processing", "failed"]
    extraction_summary: ExtractionSummary
    graph_preview: GraphPreview
    processing_time_ms: int

# Chrome Extension Models
class BasicInfo(BaseModel):
    url: str
    title: str
    domain: str
    timestamp: str

class FeasibilityScore(BaseModel):
    score: int  # 0-100
    color: Literal["Green", "Yellow", "Red"]
    message: str


class ServiceDetails(BaseModel):
    service_name: str
    coverage_type: str
    copay: str
    renewal_date: str

class AnalyzeRequest(BaseModel):
    basic_info: BasicInfo
    page_content: str

# Health Check Model
class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: datetime

class ChecklistItem(BaseModel):
    item: str
    status: str
    details: str

class BenefitsServices(BaseModel):
    service_name: str
    coverage_type: str
    copay: str

class AnalyzeResponse(BaseModel):
    summary: str
    match_checklist: List[ChecklistItem]
    benefits_services: BenefitsServices
    recommendations: List[str]