import logging
import asyncio
from typing import Dict, List, Any, Optional
from neo4j import AsyncGraphDatabase
from config.settings import settings
from pyvis.network import Network
from services.gemini_service import gemini_service # Import our cloud-based service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Neo4jService:
    """
    Neo4j Knowledge Graph Service (2026 Cloud-First Edition)
    Uses Gemini for embeddings to stay lightweight on Windows CPU.
    """
    
    def __init__(self):
        self.driver = None
        self._initialize_connection()
    
    def _initialize_connection(self):
        try:
            if settings.neo4j_uri and settings.neo4j_password:
                self.driver = AsyncGraphDatabase.driver(
                    settings.neo4j_uri,
                    auth=(settings.neo4j_username, settings.neo4j_password)
                )
                logger.info("✅ Neo4j connection initialized")
        except Exception as e:
            logger.error(f"❌ Neo4j connection failed: {str(e)}")

    async def ingest_policy_graph(self, policy_id: str, graph_data: Dict[str, Any], metadata: Dict[str, Any]) -> bool:
        if not self.driver:
            return False
        
        try:
            async with self.driver.session() as session:
                # 1. Create root policy
                await self._create_policy_node(session, policy_id, metadata)
                
                # 2. Create nodes (Now with Cloud Embeddings)
                nodes = graph_data.get("nodes", [])
                for node in nodes:
                    await self._process_single_node(session, policy_id, node)
                
                # 3. Create relationships (Using standard Cypher instead of APOC for speed)
                edges = graph_data.get("edges", [])
                for edge in edges:
                    await self._process_single_relationship(session, policy_id, edge)
                
                logger.info(f"✅ Ingestion Complete: {len(nodes)} nodes, {len(edges)} edges")
                return True
        except Exception as e:
            logger.error(f"❌ Ingestion failed: {str(e)}")
            return False

    async def _process_single_node(self, session, policy_id: str, node: Dict[str, Any]):
        """Generates cloud embedding and merges node into Neo4j"""
        node_id = node.get("id")
        label = node.get("label", "Node")
        props = node.get("properties", {})
        name = props.get("name", "")
        
        # Call Gemini Cloud for the embedding (Zero CPU load!)
        embedding = await gemini_service.generate_embedding(f"{name} {props.get('description', '')}")

        query = f"""
        MERGE (n:{label} {{node_id: $node_id, policy_id: $policy_id}})
        SET n += $props,
            n.embedding = $embedding,
            n.updated_at = datetime()
        WITH n
        MATCH (p:Policy {{policy_id: $policy_id}})
        MERGE (p)-[:CONTAINS]->(n)
        """
        await session.run(query, {
            "node_id": node_id,
            "policy_id": policy_id,
            "props": props,
            "embedding": embedding
        })

    async def _process_single_relationship(self, session, policy_id: str, edge: Dict[str, Any]):
        """Creates relationship between nodes using standard MERGE"""
        # Note: Cypher relationship types can't be parameterized easily without APOC, 
        # but for a hackathon, standard string formatting is fine if controlled.
        rel_type = edge.get("relationship", "RELATED_TO")
        query = f"""
        MATCH (a {{node_id: $from_id, policy_id: $policy_id}})
        MATCH (b {{node_id: $to_id, policy_id: $policy_id}})
        MERGE (a)-[r:{rel_type}]->(b)
        SET r += $props
        """
        await session.run(query, {
            "from_id": edge.get("from"),
            "to_id": edge.get("to"),
            "policy_id": policy_id,
            "props": edge.get("properties", {})
        })

    async def semantic_search(self, query_text: str, policy_id: str, limit: int = 3):
        """Uses Native Neo4j Vector Search (2026 standard)"""
        vector = await gemini_service.generate_embedding(query_text)
        
        # Using the Vector Index 'policy_index' (Make sure to create this in Aura!)
        query = """
        CALL db.index.vector.queryNodes('policy_index', $limit, $vector)
        YIELD node, score
        WHERE node.policy_id = $policy_id
        RETURN node.node_id as id, node.name as name, node.description as desc, score
        """
        async with self.driver.session() as session:
            result = await session.run(query, {"vector": vector, "limit": limit, "policy_id": policy_id})
            return [dict(record) async for record in result]

    async def _create_policy_node(self, session, policy_id, metadata):
        query = """
        MERGE (p:Policy {policy_id: $policy_id})
        SET p.name = $name, p.updated_at = datetime()
        """
        await session.run(query, {"policy_id": policy_id, "name": metadata.get("policy_name")})

    async def get_latest_policy_id(self) -> str:
        """
        Finds the UUID of the most recently ingested policy.
        """
        query = """
        MATCH (p:Policy)
        RETURN p.policy_id AS id
        ORDER BY p.processed_at DESC
        LIMIT 1
        """
        async with self.driver.session() as session:
            result = await session.run(query)
            record = await result.single()
            if record:
                return record["id"]
            return None

    # services/neo4j_service.py

    async def generate_interactive_graph(self, policy_id: str) -> str:
        """
        Generates a 'Clean White' interactive HTML graph.
        """
        query = """
        MATCH (s:Service {policy_id: $policy_id})
        OPTIONAL MATCH (s)-[r:SUBJECT_TO|HAS_LIMIT]->(req:Requirement)
        RETURN s, r, req
        """
        
        async with self.driver.session() as session:
            result = await session.run(query, {"policy_id": policy_id})
            records = [dict(record) async for record in result]

        # 1. Initialize with White Background and Dark Text
        # bgcolor="#ffffff", font_color="#333333" (Dark Gray)
        net = Network(height="600px", width="100%", bgcolor="#ffffff", font_color="#333333")
        
        for rec in records:
            s = rec['s']
            req = rec['req']
            rel = rec['r']

            # 2. Service Node: Darker Green for better contrast on white
            net.add_node(s.element_id, label=s['name'], title=s['description'], color="#27ae60")
            
            if req:
                # 3. Requirement Node: Amber/Orange for high visibility
                net.add_node(req.element_id, label=req['name'], title=req['description'], color="#e67e22")
                
                # 4. Edge: Use a dark slate color so the lines are crisp
                edge_label = rel['value'] if rel and 'value' in rel else ""
                net.add_edge(s.element_id, req.element_id, label=edge_label, color="#34495e")

        # Optional: Fine-tune physics for a smoother "float"
        net.set_options("""
        var options = {
        "physics": {
            "forceAtlas2Based": {
            "gravitationalConstant": -50,
            "centralGravity": 0.01,
            "springLength": 100
            },
            "minVelocity": 0.75,
            "solver": "forceAtlas2Based"
        }
        }
        """)
        
        return net.generate_html()

    async def close(self):
        if self.driver:
            await self.driver.close()

neo4j_service = Neo4jService()