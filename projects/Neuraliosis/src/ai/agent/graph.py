from langgraph.graph import StateGraph, START, END
from agent.state import HealthState
from agent.nodes.intent_parser import intent_parser
from agent.nodes.confidence_scorer import confidence_scorer
from agent.nodes.question_generator import question_generator
from agent.nodes.fitness_permission import fitness_permission
from agent.nodes.rag_retriever import rag_retriever
from agent.nodes.llm_synthesizer import llm_synthesizer
from agent.nodes.response_formatter import response_formatter
from agent.nodes.greeting_responder import greeting_responder

CRITICAL_SYMPTOMS = [
    "chest pain", "chest hurt", "arm numb", "arm pain",
    "can't breathe", "cannot breathe", "difficulty breathing",
    "jaw pain", "heart attack", "stroke", "seizure",
    "fainting", "fainted", "unconscious", "severe headache",
    "numbness", "left arm"
]

MIN_DYNAMIC_QUESTIONS = 8
MAX_DYNAMIC_QUESTIONS = 16

def route_after_confidence(state: HealthState) -> str:
    if state.get("is_greeting", False):
        return "greeting_responder"

    if not state.get("keywords") and state.get("questions_asked", 0) == 0:
        return "greeting_responder"

    # Check ALL user messages for critical symptoms
    all_user_text = " ".join([
        m["content"].lower()
        for m in state.get("messages", [])
        if m["role"] == "user"
    ])

    # If ANY critical symptom found → skip questions
    # go straight to rag_retriever for immediate response
    if any(kw in all_user_text for kw in CRITICAL_SYMPTOMS):
        return "rag_retriever"

    questions_asked = state.get("questions_asked", 0)
    confidence = state.get("confidence", 0.0)

    # Enforce deeper follow-up before final synthesis.
    if questions_asked < MIN_DYNAMIC_QUESTIONS:
        return "question_generator"

    if confidence < 0.8 and questions_asked < MAX_DYNAMIC_QUESTIONS:
        return "question_generator"

    return "fitness_permission"

def route_after_permission(state: HealthState):
    if state.get("topic") in ["fitness", "cardiac", "sleep"] and state.get("fitness_approved", False) == False:
        return END
    return "rag_retriever"

builder = StateGraph(HealthState)

builder.add_node("intent_parser", intent_parser)
builder.add_node("confidence_scorer", confidence_scorer)
builder.add_node("question_generator", question_generator)
builder.add_node("fitness_permission", fitness_permission)
builder.add_node("rag_retriever", rag_retriever)
builder.add_node("llm_synthesizer", llm_synthesizer)
builder.add_node("response_formatter", response_formatter)
builder.add_node("greeting_responder", greeting_responder)

builder.add_edge(START, "intent_parser")
builder.add_edge("intent_parser", "confidence_scorer")

builder.add_conditional_edges(
    "confidence_scorer", 
    route_after_confidence,
    {
        "greeting_responder": "greeting_responder",
        "question_generator": "question_generator",
        "fitness_permission": "fitness_permission",
        "rag_retriever": "rag_retriever"
    }
)
builder.add_edge("question_generator", END)
builder.add_edge("greeting_responder", END)

builder.add_conditional_edges(
    "fitness_permission", 
    route_after_permission,
    {
        END: END,
        "rag_retriever": "rag_retriever"
    }
)
builder.add_edge("rag_retriever", "llm_synthesizer")
builder.add_edge("llm_synthesizer", "response_formatter")
builder.add_edge("response_formatter", END)

graph = builder.compile()

# python -c "from agent.graph import graph; print(graph.get_graph().draw_ascii())"
