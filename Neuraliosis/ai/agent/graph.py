from langgraph.graph import StateGraph, START, END
from agent.state import HealthState
from agent.nodes.intent_parser import intent_parser
from agent.nodes.confidence_scorer import confidence_scorer
from agent.nodes.question_generator import question_generator
from agent.nodes.fitness_permission import fitness_permission
from agent.nodes.rag_retriever import rag_retriever
from agent.nodes.llm_synthesizer import llm_synthesizer
from agent.nodes.response_formatter import response_formatter

def route_after_confidence(state: HealthState):
    if state.get("confidence", 0.0) < 0.65 and state.get("questions_asked", 0) < 4:
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

builder.add_edge(START, "intent_parser")
builder.add_edge("intent_parser", "confidence_scorer")

builder.add_conditional_edges(
    "confidence_scorer", 
    route_after_confidence,
    {
        "question_generator": "question_generator",
        "fitness_permission": "fitness_permission"
    }
)
builder.add_edge("question_generator", END)

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
