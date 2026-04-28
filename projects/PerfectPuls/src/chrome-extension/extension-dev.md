# Policy Pilot Chrome Extension - API Specification

## Overview
Policy Pilot is a Chrome extension that analyzes health websites and provides insurance coverage information via a Graph RAG backend API.

## API Integration

### Request Endpoint
```
POST http://localhost:8000/api/analyze
Content-Type: application/json
```

### Request Format (What Extension Sends)

The extension scrapes website data and sends a simplified structure:

```json
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

### Response Format (What Extension Expects)

The API must return this exact structure for the extension to display results correctly:

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

## Field Requirements

### Required Response Fields
- **`summary`** (string): Brief analysis overview text
- **`match_checklist`** (array): Coverage items with status icons
- **`feasibility`** (object): Score, color, and message
- **`money_saved`** (object): Cost breakdown with formatted currency
- **`benefits_services`** (object): Service details and coverage info
- **`recommendations`** (array): Actionable advice strings

### Status Icon Format
Use these exact emoji patterns in `match_checklist[].status`:
- `"✅ covered"` - Fully covered/approved
- `"⚠️ partial"` - Partially covered/conditional  
- `"❌ denied"` - Not covered/rejected
- `"📋 required"` - Action required
- `"ℹ️ info"` - Informational status

### Feasibility Colors
Use these exact color values in `feasibility.color`:
- `"Green"` - High likelihood/recommended
- `"Yellow"` - Medium likelihood/conditional
- `"Red"` - Low likelihood/not recommended

## Data Processing Notes

### What the Extension Scrapes
- **URL and domain** information
- **Page title** from HTML `<title>` tag
- **Meta description** from meta tags
- **Full page text content** (body.innerText)
- **Timestamp** of scraping

### What the API Should Process
The Graph RAG backend should analyze the `page_content` field to extract:
- Service names and types
- Pricing information
- Provider credentials  
- Location and contact details
- Service descriptions

Then match against insurance knowledge base to determine coverage, costs, and recommendations.

## Error Handling

If the API is unavailable, the extension falls back to dummy data with the same response structure. The backend should return proper HTTP status codes:

- **200**: Successful analysis
- **400**: Invalid request format  
- **500**: Server error during analysis

## Development Testing

The extension includes comprehensive dummy data matching this specification for offline development and testing.