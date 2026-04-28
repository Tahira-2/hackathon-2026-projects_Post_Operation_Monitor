# Policy Pilot: Agentic Wellness Navigator via Graph RAG

**Track:** Health Data & Interoperability / AI-Powered Care Coordination  
**Duration:** 36-Hour Hackathon Sprint  
**Team:** 4 Members  

---

## 1. The Objective
Most insurance policies are "black boxes"—users rarely know which wellness services are covered until after they've already paid. **Policy Pilot** is an intelligent Chrome Extension that bridges this gap. By converting static insurance PDFs into a **Knowledge Graph**, the agent provides real-time, personalized advice as users navigate health and wellness websites. It helps users understand their coverage limits, co-pays, and hidden benefits *before* they book a service, ensuring they maximize the value of their premiums.

---

## 2. Core Features
* **Knowledge Graph Ingestion:** Automatically parses complex Insurance "Summary of Benefits" (SBC) documents into a relational graph of services, rules, and conditions using multimodal LLMs.
* **Contextual Page Scrutiny:** A Chrome Extension that intelligently scrapes the active tab (e.g., a gym, chiropractor, or nutritionist) to identify specific service offerings.
* **Semantic Advisory Engine:** Uses **Graph RAG** to provide high-context advice, such as: *"Your policy covers 20 sessions of this service per year with a $15 co-pay; you have 14 sessions remaining."*
* **On-Demand Benefit Lookups:** A dedicated side panel where users can ask natural language questions about their policy while browsing (e.g., *"Is this specific provider in-network according to my plan?"*).

---

## 3. The Tech Stack

### **Frontend (The Extension, UX page)**
* **Architecture:** Chrome Extension Manifest V3.
* **UI:** React + Tailwind CSS integrated via the **Chrome Side Panel API**.
* **Context Capture:** Content Scripts for targeted DOM scraping of health-related keywords and service pricing.

### **Backend (The Agentic Logic)**
* **Framework:** FastAPI (Python).
* **Orchestration:** LangGraph / LangChain for managing the complex retrieval and reasoning loops.
* **PDF Intelligence:** Google Document AI + **Gemini 1.5 Pro** for extracting policy "triples" (entities and relationships) from unstructured documents.

### **Database & AI (The Brain)**
* **Graph Database:** **Neo4j Aura** (Stores the relational logic and constraints of the insurance policy).
* **Vector Search:** Vertex AI Vector Search for finding the "entry point" into the graph from scraped web text.
* **Inference:** Gemini 1.5 Pro for synthesizing graph data into conversational, actionable advice.

---

## 4. The Workflow (Graph RAG Retrieval)

1.  **Ingest:** The user uploads their policy PDF. The system populates Neo4j with nodes like `(Service: Physiotherapy)` and edges like `[:HAS_BENEFIT {copay: "$20", limit: "30 sessions"}]`.
2.  **Browse:** The user visits a wellness site. The extension extracts service text like *"Acupuncture - $120 per session."*
3.  **Graph RAG Search:**
    * **Vector Match:** A similarity search matches "Acupuncture" to the policy's `Alternative Medicine` or `Holistic Care` node.
    * **Traversal:** The agent traverses the graph from that node to find all connected `Coverage Rules`, `Annual Limits`, and `Network Requirements`.
4.  **Advice:** The side panel updates with proactive advice: *"This service is covered under your 'Wellness' bucket. You've used $100 of your $500 annual allowance. This session will cost you $20 out of pocket."*

---

## 5. Future Roadmap
* **Automated Dispute Generation:** Automatically drafting appeal letters for incorrectly denied claims based on policy logic.
* **Financial Toxicity Sentinel:** Proactively flagging over-billing by cross-referencing CPT codes on bills with fair market pricing.
* **Family Plan Orchestration:** Managing and advising on shared deductibles and out-of-pocket maximums across multiple family members.
* **On-Device Inference:** Porting the advisory engine to **Gemini Nano** for offline, privacy-first policy lookups.

---

## 6. Installation & Setup
1.  **Backend:** Initialize the FastAPI server and connect to your **Neo4j Aura** instance.
2.  **Data Load:** Run the ingestion script on a sample `Summary of Benefits and Coverage` PDF.
3.  **Extension:** Load the `dist` folder into Chrome via Developer Mode (`chrome://extensions`).
4.  **Navigate:** Visit any wellness or health provider website and trigger the **Policy Pilot** side panel to receive real-time coverage advice.