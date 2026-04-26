from agent.state import HealthState
from rag.vectorstore import VectorStore
from agent.nodes.fitness_fetcher import fitness_fetcher
import logging

logger = logging.getLogger(__name__)

def rag_retriever(state: HealthState) -> dict:
    topic = state.get("topic", "general")
    
    # Get last 3 user messages
    user_messages = [msg["content"] for msg in state["messages"] if msg["role"] == "user"]
    recent_user_messages = user_messages[-3:]
    
    query = f"{topic} " + " ".join(recent_user_messages)
    
    store = VectorStore()
    retrieved_context = store.search(query, n_results=4)
    
    updates = {"retrieved_context": retrieved_context}
    
    # Fetch fitness data if approved and not already present
    if state.get("fitness_approved", False) and not state.get("fitness_data"):
        fitness_res = fitness_fetcher(state)
        if "fitness_data" in fitness_res:
            updates["fitness_data"] = fitness_res["fitness_data"]
            
    return updates
