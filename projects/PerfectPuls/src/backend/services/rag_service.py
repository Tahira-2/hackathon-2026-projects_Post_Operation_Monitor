import logging
import json
from typing import Dict, Any
from services.gemini_service import gemini_service
from services.neo4j_service import neo4j_service
from models.api_models import AnalyzeResponse

logger = logging.getLogger(__name__)

class RAGService:
    async def analyze_website(self, basic_info: Dict[str, Any], page_content: str) -> AnalyzeResponse:
        domain = basic_info.get("domain", "the website")
        policy_id = await neo4j_service.get_latest_policy_id()
        
        if not policy_id:
            return self._get_default_response("No insurance policies found in the database. Please upload a PDF first.") # Your Cigna Policy ID
        
        # 1. Extract the Service Intent
        intent = await self._get_intent(page_content)
        
        # 2. Get Graph Context (The "Ground Truth")
        # We find the service and its neighbors (Limits, Copays, Categories)
        graph_data = await self._get_graph_data(intent, policy_id)
        
        # 3. Synthesize the JSON Response
        # We pass the website context and the Graph facts to Gemini
        return await self._generate_structured_response(domain, intent, graph_data)

    async def _get_intent(self, content: str) -> str:
        prompt = f"Identify the healthcare service being offered on this page. Return ONLY the name (e.g. 'Physiotherapy'). Content: {content[:2000]}"
        response = await gemini_service.model.generate_content_async(prompt)
        return response.text.strip()

    async def _get_graph_data(self, intent: str, policy_id: str) -> Dict[str, Any]:
        matches = await neo4j_service.semantic_search(intent, policy_id, limit=1)
        if not matches: return {}
        
        node_id = matches[0]['id']
        cypher = """
        MATCH (n {node_id: $node_id, policy_id: $policy_id})
        OPTIONAL MATCH (n)-[r]-(neighbor)
        RETURN n.name as name, n.description as desc,
               collect({rel: type(r), target: neighbor.name, val: r.value, label: labels(neighbor)[0]}) as info
        """
        async with neo4j_service.driver.session() as session:
            res = await session.run(cypher, {"node_id": node_id, "policy_id": policy_id})
            record = await res.single()
            return dict(record) if record else {}

    async def _generate_structured_response(self, domain: str, intent: str, graph: Dict[str, Any]) -> Dict[str, Any]:
        facts = json.dumps(graph, indent=2)
        
        prompt = f"""
        You are Policy Pilot. Generate a JSON response for a user visiting {domain} for {intent}.
        
        Use these Policy Facts from our Knowledge Graph:
        {facts}

        The JSON MUST follow this structure:
        {{
          "summary": "1-2 sentence overview of coverage for this provider.",
          "match_checklist": [
            {{ "item": "In-network status", "status": "✅ covered/⚠️ partial/📋 required", "details": "..." }},
            {{ "item": "HSA/FSA eligible", "status": "...", "details": "..." }},
            {{ "item": "Prior authorization", "status": "...", "details": "..." }},
            {{ "item": "Copay applies", "status": "...", "details": "..." }}
          ],
          "benefits_services": {{
            "service_name": "{intent}",
            "coverage_type": "e.g. 70% after deductible",
            "copay": "The dollar amount"
          }},
          "recommendations": ["Actionable tip 1", "Actionable tip 2"]
        }}

        Return ONLY the JSON. No conversational filler.
        """
        
        # Using Gemini's 1.5 Flash for speed and structured output
        response = await gemini_service.model.generate_content_async(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        response_data = json.loads(response.text)
        return AnalyzeResponse(**response_data)

rag_service = RAGService()