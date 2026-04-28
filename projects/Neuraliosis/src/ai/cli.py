import sys
import re
from dotenv import load_dotenv
from agent.graph import graph
from agent.state import HealthState

load_dotenv()

def main():
    print("==================================================")
    print("Health Assistant — type 'quit' or 'exit' to exit")
    print("==================================================")
    
    state: HealthState = {
        "messages": [],
        "topic": "general",
        "keywords": [],
        "confidence": 0.0,
        "questions_asked": 0,
        "fitness_approved": False,
        "fitness_data": {},
        "retrieved_context": [],
        "is_serious": False,
        "is_greeting": False,
        "recommended_specialization": "",
        "final_response": ""
    }
    
    while True:
        try:
            user_input = input("\nYou: ").strip()
            if user_input.lower() in ['quit', 'exit']:
                break
            if not user_input:
                continue
            
            if state["messages"] and state["messages"][-1]["role"] == "assistant":
                last_msg = state["messages"][-1]["content"]
                if "A)" in last_msg and "B)" in last_msg:
                    if user_input.upper() in ["A", "B", "C", "D"]:
                        letter = user_input.upper()
                        pattern = rf"{letter}\)\s*(.*?)(?=\n[A-D]\)|\Z)"
                        match = re.search(pattern, last_msg, re.DOTALL)
                        if match:
                            option_text = match.group(1).strip()
                            user_input = f"{letter}) {option_text}"
                            print(f"You chose: {user_input}")
            
            state["messages"].append({"role": "user", "content": user_input})
            state = graph.invoke(state)
            
            response = state.get("final_response")
            if not response and state["messages"][-1]["role"] == "assistant":
                response = state["messages"][-1]["content"]
                
            print(f"\nAssistant: {response}")
            
            if state.get("is_serious"):
                spec = state.get("recommended_specialization", "")
                if spec:
                    print(f"\n  ⚠️  Serious concern detected.")
                    print(f"  👨⚕️  Recommended specialist: {spec.upper()}")
                    print(f"  📅  Please consider booking an appointment.")
            
            if "A)" in response and "B)" in response:
                print("  → Type A, B, C or D — or describe in your own words")
            
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"\nError: {e}")

if __name__ == "__main__":
    main()
