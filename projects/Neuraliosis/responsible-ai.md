# Responsible AI for Neuraliosis

Neuraliosis is an AI-assisted health product, so responsible AI handling is part of the core design rather than an optional policy layer.

## Purpose of the AI

The AI in this project is used to:

- collect symptoms through conversational questioning
- narrow down likely concerns using follow-up prompts
- summarize health information into readable reports
- suggest common OTC products when symptoms appear low risk
- route users toward doctors or appointments when escalation is appropriate

The AI should support decision-making, not replace medical professionals.

## Safety Boundaries

The system should avoid presenting itself as a diagnostic authority. It must not claim certainty, and it should not tell users to ignore severe symptoms or avoid professional care.

High-risk or urgent symptoms should trigger a clear escalation path that recommends immediate medical attention or emergency services when appropriate.

## Data Use

The project handles sensitive health-related inputs, so data collection and storage should be minimized to what is needed for the feature being used.

Recommended practices:

- collect only symptom and context details needed for triage
- avoid retaining unnecessary personal data in prompts or logs
- separate user identity data from conversation or health content where possible
- protect stored records with access control and encryption

## Data Sources

The AI and RAG workflow in this project should rely on curated health information sources that are readable, public, and medically oriented.

Current project data sources include:

- MedlinePlus topic pages scraped into the local RAG corpus for fitness, nutrition, sleep, heart disease, anxiety, and pain guidance
- CDC pages for physical activity and healthy eating guidance
- MedlinePlus Magazine articles for broader consumer health education
- `src/ai/data/medical_dataset.json` as the project knowledge base for structured symptom and guidance content
- locally seeded app data in the Django backend for demo appointments, reports, doctors, medicines, and order history

These sources should be treated as supporting context only. They are useful for retrieval, summaries, and user guidance, but they are not a substitute for clinical diagnosis or emergency care.

## AI Layer - Neuraliosis Health Assistant

### Architecture

The AI system uses LangGraph as a graph-based agent framework with OpenAI GPT-4o as the core LLM. It follows a multi-node pipeline with conditional routing driven by symptom confidence scoring.

### Agent Flow

1. `intent_parser` extracts all symptoms and classifies the topic as cardiac, fitness, sleep, stress, nutrition, or general.
2. `confidence_scorer` scores input from 0.0 to 1.0 using onset, severity, activity context, duration, body location, and history.
3. Conditional routing sends the conversation to greeting responses, the RAG retriever, the question generator, or fitness permission depending on confidence and severity.
4. `question_generator` asks one fitness-aware multiple-choice question per turn and rotates through sleep, hydration, eating, exercise, stress, and heart rate.
5. `fitness_permission` requests access to user health data for fitness, cardiac, and sleep topics.
6. `fitness_fetcher` pulls real user fitness data such as heart rate, steps, sleep, and workout history.
7. `rag_retriever` searches the ChromaDB vector store using embedded full context.
8. `llm_synthesizer` combines symptoms, Q&A, RAG context, and fitness data to generate the wellness response.
9. `response_formatter` appends the doctor referral message when the case is serious.

### Critical Symptom Fast-Track

When a user mentions chest pain, numbness, difficulty breathing, fainting, stroke, or seizure, the agent skips the question loop and immediately generates a response with a specialist recommendation.

### Specialist Detection

The LLM identifies the required medical specialization, such as cardiologist, neurologist, pulmonologist, orthopedist, gastroenterologist, endocrinologist, or general physician. This value is returned in the API response and used by the mobile app to filter and recommend nearby doctors.

### Knowledge Base and Models

- 35+ processed documents
- Sources: MedlinePlus, CDC, NIH Magazine
- 18 curated medical and wellness JSON records covering dehydration, overexertion, cardiac symptoms, sleep, breathing, joint pain, anxiety, nutrition, and more
- Vector store: ChromaDB with OpenAI `text-embedding-3-small`
- Chunk size: 500 characters with 50 character overlap
- Models used: GPT-4o-mini for symptom parsing and question generation, GPT-4o for final synthesis, and `text-embedding-3-small` for embeddings

### Model Choice Rationale

- GPT-4o-mini is used for symptom parsing and question generation to keep routine-turn latency and inference cost lower.
- GPT-4o is used for final synthesis because the final response combines symptom context, RAG evidence, and fitness signals where response quality matters most.
- text-embedding-3-small is used for retrieval to maintain good semantic search quality while keeping embedding cost manageable.
- ChromaDB is used for fast local vector retrieval and easier iteration during development and demos.

### API

The FastAPI server exposes the main chat endpoint, session history, session clearing, and a list of active sessions. Responses include the wellness message, confidence score, seriousness flag, doctor need flag, recommended specialization, and the number of questions asked.

### Safety Design

- Never diagnose or prescribe
- End every response with a medical disclaimer
- Critical symptoms bypass the question loop
- Serious cases always recommend professional care
- Frame the system as wellness support, not medical advice

### Tech Stack

- LangGraph for agent graph orchestration
- OpenAI for LLM and embeddings
- ChromaDB for the vector store
- FastAPI for the API layer
- Python 3.11+ for runtime

## Fairness and Reliability

The AI should be tested across different symptom descriptions, ages, and user styles so that the output is not overly biased toward one kind of user input.

The system should also handle uncertainty explicitly. When the model does not have enough confidence, it should ask another question or recommend a human review instead of guessing.

### Bias Considerations

- Language-expression bias: users describe symptoms differently by region, age, and education level. Mitigation is to normalize intent using follow-up questions instead of relying on one-shot wording.
- Demographic bias risk: symptom interpretation may vary across populations. Mitigation is to keep outputs conservative and escalate to professional care for uncertainty or severity.
- Data-source bias: public wellness sources may underrepresent certain groups or conditions. Mitigation is to treat retrieval content as supportive context, not authoritative diagnosis.
- Automation bias: users may over-trust confident phrasing. Mitigation is mandatory disclaimer language and explicit non-diagnostic framing in every response.

## Known Failure Cases and Handling

- Ambiguous symptom input: the model may miss key details. Handling: confidence scoring plus one-question follow-up loop before synthesis.
- Underreported severity: users may omit urgency indicators. Handling: critical keyword fast-track and conservative escalation behavior.
- Retrieval mismatch: vector search can return partially relevant context. Handling: synthesis stage must combine retrieved text with symptom context and avoid hard claims.
- Fitness data unavailable: permission denied or no wearable data. Handling: continue with symptom-only path and avoid assuming missing biometrics.
- Session context drift in long chats: earlier details may become stale. Handling: maintain structured session history and re-ask clarifying questions when confidence drops.
- False reassurance risk: low-confidence outputs could be interpreted as safe. Handling: uncertainty language, no diagnosis, and recommendation to seek professional care when warranted.

## Human Oversight

Neuraliosis should keep a human-in-the-loop path for any output that is:

- clinically sensitive
- legally sensitive
- ambiguous or low confidence
- part of a doctor recommendation or appointment escalation flow

## User Messaging

Any AI-facing screen should include a plain-language disclaimer that the app is providing guidance, not a formal diagnosis.

The language should be calm and direct, especially in health scenarios, so users understand what the app knows, what it does not know, and when they should seek care.

## Project-Specific Notes

- The app combines fitness tracking, symptom triage, medicine guidance, doctor discovery, appointment booking, and reporting.
- The backend seed data is designed to make the demo experience realistic, including a featured patient with live and historical appointments.
- The AI service should be treated as one component in a larger care workflow, not the final medical authority.
