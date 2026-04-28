from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from agent.graph import graph
from api.sessions import get_session, save_session, delete_session, list_sessions
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    message: str
    fitness_approved: bool = False

class ChatResponse(BaseModel):
    session_id: str
    response: str
    confidence: float
    is_serious: bool
    needs_doctor: bool
    questions_asked: int
    recommended_specialization: str = ""
    options: list[dict] = Field(default_factory=list)

class SessionInfo(BaseModel):
    session_id: str
    message_count: int
    topic: str
    confidence: float
    questions_asked: int
    is_serious: bool

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        # 1. Get or create session state for session_id
        state = get_session(request.session_id)
        previous_questions_asked = int(state.get("questions_asked", 0))
        
        # 2. Append user message to state["messages"]
        state["messages"].append({"role": "user", "content": request.message})
        
        # 3. Update fitness_approved in state
        state["fitness_approved"] = request.fitness_approved
        
        # 4. If fitness_approved and state["fitness_data"] is empty:
        if state["fitness_approved"] and not state.get("fitness_data"):
            from fitness.mock_provider import get_fitness_data
            state["fitness_data"] = get_fitness_data()
            
        # 5. Run graph.invoke(state)
        updated_state = graph.invoke(state)

        # Return options only when the current turn generated a new follow-up question.
        generated_new_question = int(updated_state.get("questions_asked", 0)) > previous_questions_asked
        current_options = updated_state.get("current_options", []) if generated_new_question else []
        if not generated_new_question:
            updated_state["current_options"] = []
        
        # 6. Save updated state back to sessions
        save_session(request.session_id, updated_state)
        
        # 7. Extract response text
        if updated_state.get("final_response"):
            response_text = updated_state["final_response"]
        else:
            # Fallback: last message where role=="assistant"
            assistant_messages = [m for m in updated_state.get("messages", []) if m.get("role") == "assistant"]
            if assistant_messages:
                response_text = assistant_messages[-1]["content"]
            else:
                response_text = "I'm here to help. Could you tell me more?"
                
        # 8. Return ChatResponse
        return ChatResponse(
            session_id=request.session_id,
            response=response_text,
            confidence=updated_state.get("confidence", 0.0),
            is_serious=updated_state.get("is_serious", False),
            needs_doctor=updated_state.get("is_serious", False),
            questions_asked=updated_state.get("questions_asked", 0),
            recommended_specialization=updated_state.get("recommended_specialization", ""),
            options=current_options,
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/history/{session_id}")
def get_history(session_id: str):
    try:
        sessions = list_sessions()
        if session_id not in sessions:
            return {"session_id": session_id, "messages": [], "found": False}
            
        state = get_session(session_id)
        return {
            "session_id": session_id,
            "found": True,
            "messages": state.get("messages", []),
            "topic": state.get("topic", ""),
            "confidence": state.get("confidence", 0.0),
            "is_serious": state.get("is_serious", False),
            "recommended_specialization": state.get("recommended_specialization", "")
        }
    except Exception as e:
        logger.error(f"Error getting history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/chat/session/{session_id}")
def clear_session(session_id: str):
    sessions = list_sessions()
    if session_id in sessions:
        delete_session(session_id)
        return {"message": "Session cleared", "session_id": session_id}
    return {"message": "Session not found", "session_id": session_id}

@router.get("/chat/sessions")
def get_sessions_endpoint():
    sessions = list_sessions()
    return {"active_sessions": sessions, "count": len(sessions)}
