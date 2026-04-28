# Neuraliosis

☐ Project Name
Neuraliosis

☐ Team Members (names + GitHub handles)

- Anmol Poudyal (Anmol_poudyal)
- Karan Bastola (karanbastola84)
- Manoj Gautam (manjyy)
- Anjal Niraula (anjal-ai)

☐ Exclusive Summary
This project fulfills people's curiosity about googling symptoms when feeling unwell, by engaging them in rapid, targeted questioning to pinpoint the exact illness rather than relying on vague, general inputs.
The AI is trained on real and authentic health, disease, and symptom data, which it uses to ask the user increasingly specific questions until it can predict a cause with the highest possible accuracy.
The responses collected are then used to recommend suitable over-the-counter medications where possible, or direct the user to the right doctor and book an appointment when professional care is required.
The ultimate goal of this project is to save users from falling into the rabbit hole of unreliable online sources, eliminate unnecessary panic, and guide them toward the correct and informed path of treatment.

Neuraliosis is an AI-powered mobile health application taking the US market as the reference. It combines fitness tracking, symptom detection, intelligent health reporting, OTC medicine guidance, doctor recommendations, and appointment booking into one seamless platform.

The US digital health market is large and growing quickly. Recent market analyses estimate US digital health at $81.17 billion in 2023 and about $94.95 billion in 2024, with continued strong growth expected through 2030 [1]. At the same time, telehealth utilization accelerated sharply during COVID-19, with CDC reporting a 50% increase in telehealth visits in early 2020 versus 2019 and a 154% spike in late March 2020 [2]. Neuraliosis positions itself as the bridge between everyday fitness tracking and real medical access, something no single app currently does end-to-end well.

The goal is to launch as a free-to-use B2C app (ad-supported and transaction-driven) while simultaneously building B2B channels through employer wellness programs and health insurance partnerships.

☐ Problem Statement
Most Americans either ignore symptoms until they worsen, or rush to the ER for something manageable. Existing health apps are either too basic (just step counts) or too clinical (telemedicine only). There is no single platform that takes a user from "I feel weird today" all the way to "I have a doctor appointment booked and know what to pick up at CVS." Neuraliosis fills that exact gap.

☐ Solution Description
Neuraliosis provides an AI-driven symptom assistant that asks targeted follow-up questions, estimates risk level, and gives practical next steps. Users can view commonly used OTC options for mild cases, get doctor recommendations for higher-risk symptoms, and book appointments directly from the app. The goal is to replace confusing symptom searches with clear, actionable guidance.

☐ Tech Stack

- Mobile App: React Native
- Backend: Python Django and FastAPI
- Database: PostgreSQL
- AI Layer: LLM-based triage plus retrieval (RAG)
- Integrations: Apple HealthKit, Google Health Connect, telehealth APIs

☐ Setup Instructions

1. Clone the repository.
2. Install dependencies for mobile and backend services.
3. Configure environment variables (API keys, database URL, auth secrets).
4. Start backend server.
5. Start mobile app in emulator or device.
6. Verify core flow: symptom input -> AI response -> OTC guidance or doctor booking.

☐ Demo link or screenshots

- Demo: Provided in Demo folder
- Screenshots:: Provided in Demo folder

---

## Additional Details

## 1. Executive Summary

Neuraliosis is an AI-powered mobile health application taking the US market as the reference. It combines fitness tracking, symptom detection, OTC medicine guidance, doctor recommendations, and appointment booking into one seamless platform.

The US digital health market is large and growing quickly. Recent market analyses estimate US digital health at $81.17 billion in 2023 and about $94.95 billion in 2024, with continued strong growth expected through 2030 [1]. At the same time, telehealth utilization accelerated sharply during COVID-19, with CDC reporting a 50% increase in telehealth visits in early 2020 versus 2019 and a 154% spike in late March 2020 [2].

## 15. AI Layer - Neuraliosis Health Assistant

### Architecture

The AI system is built with LangGraph, a graph-based agent framework, and uses OpenAI GPT-4o as the core LLM. It follows a multi-node pipeline with conditional routing based on symptom confidence scoring.

### Agent Flow

1. `intent_parser` extracts all symptoms and classifies the topic as cardiac, fitness, sleep, stress, nutrition, or general.
2. `confidence_scorer` scores the input from 0.0 to 1.0 using onset, severity, activity context, duration, body location, and history.
3. Conditional routing sends the conversation to greeting responses, the RAG retriever, the question generator, or fitness permission depending on the confidence and severity.
4. `question_generator` asks one fitness-aware multiple-choice question per turn and rotates through sleep, hydration, eating, exercise, stress, and heart rate.
5. `fitness_permission` requests access to user health data for fitness, cardiac, and sleep topics.
6. `fitness_fetcher` pulls real user fitness data such as heart rate, steps, sleep, and workout history.
7. `rag_retriever` searches the ChromaDB vector store using embedded full context.
8. `llm_synthesizer` combines symptoms, Q&A, RAG context, and fitness data to generate the wellness response.
9. `response_formatter` appends the doctor referral message when the case is serious.

### Safety and Outputs

- Critical symptoms such as chest pain, numbness, difficulty breathing, fainting, stroke, or seizure skip the question loop and go straight to specialist guidance.
- The AI never diagnoses or prescribes and always ends responses with a medical disclaimer.
- Serious cases always recommend professional care and return the required specialist when detected.

### Knowledge Base and Models

- Knowledge base: 35+ processed documents from MedlinePlus, CDC, and NIH Magazine, plus 18 curated medical and wellness JSON records.
- Vector store: ChromaDB with OpenAI `text-embedding-3-small` embeddings.
- Chunking: 500 characters with 50 character overlap.
- Models used: GPT-4o-mini for symptom parsing and question generation, GPT-4o for final synthesis, and `text-embedding-3-small` for retrieval.

### API

The AI service exposes a FastAPI layer with endpoints for chat, history, session management, and clearing sessions. The response includes confidence, seriousness flags, doctor need, specialist type, and question count.

## 2. Problem Statement

Most Americans either ignore symptoms until they worsen, or rush to the ER for something manageable. Existing health apps are either too basic (just step counts) or too clinical (telemedicine only). There is no single platform that takes a user from "I feel weird today" all the way to "I have a doctor appointment booked and know what to pick up at CVS." Neuraliosis fills that exact gap.

## 3. Vision and Mission

**Vision:** Make proactive healthcare accessible to every American regardless of income or geography.

**Mission:** Use AI to connect daily health monitoring with real medical support so users can take action before small symptoms become big problems.

## 4. Product and Features

| Feature                              | What It Does                                                       |
| ------------------------------------ | ------------------------------------------------------------------ |
| Fitness Tracking                     | Heart rate, steps, sleep, calories via phone sensors and wearables |
| AI Symptom Checker                   | User inputs symptoms, AI analyzes and flags risk level             |
| Health Report Generator              | Pulls symptom data plus health history into a shareable PDF report |
| Doctor Recommendation + OTC Guidance | Suggests in-network doctors and commonly used OTC medicines        |
| Doctor Appointment Booking           | In-app scheduling with telehealth and in-person options            |

## 5. PESTEL Analysis

### Political

The US government has been pushing hard for telehealth expansion since COVID-19. CMS (Centers for Medicare and Medicaid Services) extended telehealth flexibilities, and Congress has ongoing debates about making them permanent. This is favorable for Neuraliosis. However, each state has different telehealth practice laws, which adds complexity when building the doctor network.

### Economic

The US spends around $5.3 trillion on healthcare annually (2024), the highest in the world [3]. In parallel, Census data show that 92.0% (305.2 million) had insurance in 2023, implying roughly 26.5 million people were uninsured [4]. There is massive demand for affordable, accessible health tools. A free-entry model with ad, consultation, and B2B monetization fits this market because users are price-sensitive but still pay for high-value services.

### Social

Post-pandemic Americans are significantly more comfortable with virtual healthcare [2]. Health awareness is at an all-time high, especially among millennials and Gen Z. The US older population reached 55.8 million (16.8% of the population) in 2020, driven by aging baby boomers, increasing the need for monitoring and preventive tools [5]. Mental health integration is also becoming an expectation, not a bonus.

### Technological

AI in healthcare is advancing rapidly. Large language models, computer vision for symptom analysis, and wearable device APIs (Apple HealthKit, Google Health Connect) make the technical backbone of Neuraliosis very achievable in 2025. 5G rollout also improves real-time data processing. Cloud healthcare platforms like AWS HealthLake offer HIPAA-compliant infrastructure.

### Environmental

Digital health reduces the carbon footprint of unnecessary in-person hospital visits. This is increasingly a marketing angle, especially for environmentally conscious younger users. Investors also look favorably at ESG-friendly startups.

### Legal

This is the most critical dimension for Neuraliosis. Full breakdown is in Section 9.

## 6. Competitor Analysis

| Competitor     | Strengths                                             | Weaknesses                                                     | Neuraliosis Advantage                |
| -------------- | ----------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| Ada Health     | Strong AI symptom checker, medically validated        | No appointment booking, no fitness tracking, not US-focused    | Full end-to-end journey              |
| K Health       | AI diagnosis, subscription model, real doctors        | Limited fitness integration, no OTC guidance                   | Broader feature set                  |
| Zocdoc         | Excellent doctor booking, large network               | Zero health monitoring or AI                                   | Adds intelligence layer              |
| Teladoc        | Established telehealth leader, insurance partnerships | Expensive, no wearable integration, symptom checker is basic   | Affordable, wearable-connected       |
| WebMD          | Trusted brand, huge user base                         | Outdated UI, no appointment booking, generic advice            | Modern AI-driven personalization     |
| Apple Health   | Massive reach, hardware integration                   | No symptom AI, no doctor connection, Apple ecosystem only      | Cross-platform, medically actionable |
| Babylon Health | AI + telehealth combined                              | Struggled financially, poor US expansion, limited OTC guidance | Better financial model, US-first     |

**Key Insight:** No single competitor does all five things Neuraliosis does. The market is fragmented. Neuraliosis's moat is integration.

## 7. Customer Segmentation

### Segment 1: Health-Conscious Young Adults (Ages 18 to 34)

These users already use fitness apps. They want deeper insights. They are app-native, free-app friendly, and share content on social media. They become brand ambassadors if the product is good.

### Segment 2: Working Professionals Managing Chronic Conditions (Ages 35 to 55)

Users dealing with diabetes, hypertension, anxiety, and similar conditions. They need regular monitoring and easy doctor access. High willingness to pay for convenience and fast access to care. This is the highest-revenue individual segment.

### Segment 3: Senior Adults (Ages 55+)

Rapidly growing segment. They need simplified UI, medication reminders, and regular health reports to share with family or doctors. Often covered by Medicare, which creates an insurance partnership opportunity.

### Segment 4: Employers (B2B)

US employers spend over $13,000 per employee annually on healthcare. Corporate wellness programs that reduce claims save money. Neuraliosis sells as a bulk wellness subscription to HR departments.

### Segment 5: Health Insurance Companies (B2B)

Insurers save money when members stay healthy and avoid ER visits. They can subsidize or fully fund Neuraliosis subscriptions for their members as a preventive care tool.

## 8. Business Model Canvas (BMC)

### Key Partners

Licensed physicians and telehealth networks, pharmacy chains like CVS and Walgreens for OTC data, wearable brands like Apple, Fitbit, and Garmin, cloud providers like AWS HealthLake, health insurance companies, and hospital systems.

### Key Activities

AI model development and continuous training, doctor network management, regulatory compliance maintenance, mobile app development, and marketing/user acquisition.

### Key Resources

Proprietary AI symptom model, HIPAA-compliant data infrastructure, doctor partnership agreements, development team, and anonymized/aggregated health data.

### Value Propositions

- For individuals: one app from symptom to solution, no more jumping between apps.
- For employers: reduced healthcare costs and absenteeism.
- For insurers: lower claim rates through preventive care.

### Customer Relationships

Free self-service for individuals, dedicated account management for B2B clients, in-app AI chat support, and push notification engagement.

### Channels

Apple App Store and Google Play Store, employer HR portals, insurance company member portals, social media and influencer marketing, and SEO health content.

### Customer Segments

As described in Section 7.

### Cost Structure

AI development and infrastructure (highest cost), doctor network management, HIPAA compliance and legal, marketing and user acquisition, and customer support.

### Revenue Streams

- Free tier with ads
- Per-consultation fee ($25 to $50)
- B2B employer plans (per-employee-per-month pricing, approximately $8 to $15 PEPM)
- Insurance partnership licensing fees
- Pharmacy/OTC affiliate and referral revenue
- Anonymized aggregate health data insights sold to research institutions

## 9. Legal and Regulatory Framework (US)

This section is non-negotiable. Getting this wrong shuts the company down.

### HIPAA Compliance

The Health Insurance Portability and Accountability Act is the foundation. Neuraliosis handles Protected Health Information (PHI), which means full HIPAA compliance is mandatory before launch. This includes technical safeguards (encryption at rest and in transit), administrative safeguards (staff training, access controls), and physical safeguards (data center security). You must sign Business Associate Agreements (BAAs) with every third-party vendor that touches health data.

### FDA Software as a Medical Device (SaMD) Regulations

This is the major risk many health app founders miss. The FDA regulates software that is intended to diagnose, treat, prevent, or mitigate disease. Neuraliosis's AI symptom checker could fall under this definition. The FDA has a risk-based framework: low-risk apps (wellness only) are exempt, but apps that influence clinical decisions are regulated.

You need an FDA regulatory attorney to define exactly where your product sits and whether you need 510(k) clearance or can operate under Digital Health Center of Excellence guidance. Position the symptom checker as a "triage and awareness tool" rather than a "diagnostic tool" to stay in lower-risk territory.

### FTC Regulations

The Federal Trade Commission monitors health apps for false advertising and deceptive data practices. The FTC has recently increased enforcement actions against health data sharing without consent. Your privacy policy must be crystal clear about what data you collect and how it is used.

### State Telehealth Laws

Each US state has its own rules about who can practice telehealth and from where. Doctors on your platform must be licensed in the state where the patient is located. You need to either build a multi-state licensed doctor network from day one or use an existing telehealth network API (like Wheel or Teladoc APIs) that has this already solved.

### OTC Medicine Suggestions

This is legally sensitive. Never frame this as a prescription or a clinical recommendation. Frame it as "commonly used products for these symptoms" similar to what a pharmacist might say. Include clear disclaimers.

Consult a health law attorney specifically about this feature before launch.

### Corporate Structure and Insurance

Set up as a Delaware C-Corp for investor-friendliness. Get medical malpractice liability insurance and general product liability insurance. Create clear Terms of Service that users must agree to before using any symptom or medicine-related features.

### Minimum Legal Steps Before Launch

1. Hire a healthcare regulatory attorney (budget $15,000 to $30,000 for initial setup)
2. Complete HIPAA security risk assessment
3. Sign BAAs with all vendors
4. Get FDA regulatory opinion letter
5. Implement state-by-state telehealth compliance
6. Draft and have a lawyer review your Privacy Policy and Terms of Service

## 10. Marketing Strategy

### Phase 1 (Pre-Launch): Build Community

Create health content on Instagram, TikTok, and YouTube. Partner with fitness and health micro-influencers (10K to 100K followers). Start a waitlist. Target 10,000 waitlist signups before launch.

### Phase 2 (Launch): Growth Loop

Free tier adoption drives downloads. In-app sharing of health reports creates organic virality. Run targeted Google and Meta ads to health-conscious demographics. Partner with 2 to 3 employer companies for pilot B2B deals.

### Phase 3 (Scale): B2B and Insurance

After proving product-market fit, begin outreach to HR departments and insurance brokers. This shifts the revenue model toward more stable recurring revenue.

**Customer Acquisition Cost (CAC) Targets:**

- Under $15 for B2C users
- Under $500 for employer deals

## 11. Financial Projections

These are projections based on comparable health app benchmarks. Real numbers will vary.

### Year 1

**Revenue target:** $300,000

## 12. Repository Overview

This repository contains three main parts that work together as a single product:

- `src/app`: the mobile client for symptom intake, AI chat, doctor discovery, medicines, carts, and appointments
- `src/backend`: the Django backend that manages users, doctors, appointments, medicines, and orders
- `src/ai`: the Python AI and RAG service used for symptom interpretation, question generation, and response synthesis

### Main Product Flow

1. A user enters symptoms in the mobile app.
2. The AI layer asks follow-up questions and builds a more specific triage view.
3. The backend returns doctor recommendations, medicine guidance, and report data when needed.
4. The user can book an appointment, review order history, and revisit prior conversations or reports.

### Backend Data Model

The backend currently seeds and manages these core records:

- custom users for patients, doctors, and admins
- doctor profiles with specialization, hospital, availability, and contact details
- appointment slots, live appointments, and appointment reports
- medicine catalog items and order history

### Seeded Demo Data

The backend includes a `seed_data` management command for local testing and demos. It creates a realistic sample environment with:

- an admin account
- deterministic patient and doctor accounts for repeatable demos
- upcoming appointment slots
- completed appointment history with reports
- sample medicines and orders

For the featured demo patient, `manjeyy@email.com`, the seed script creates both a live appointment and appointment history so the app can show a realistic timeline.

### Development Notes

- The project is health-related software, so AI outputs should be treated as triage support, not diagnosis.
- Any symptom guidance, OTC suggestions, or doctor recommendations should be presented with clear safety disclaimers.
- The mobile app, backend, and AI service are intentionally separated so they can be developed and deployed independently.

Revenue components:

- Ad revenue from free-tier users: approximately $120,000
- 250 consultations per month at $35 average: $105,000
- 2 employer pilot deals at $8 PEPM, 100 employees each: $19,200
- Pharmacy/OTC affiliate and referral revenue: approximately $35,000
- Anonymized aggregate data insights pilots: approximately $20,000

More realistic accounting for slow ramp: approximately $300,000 total.

**Expenses:** approximately $650,000 (development, legal compliance, marketing, team)

**Net position:** approximately $350,000 loss, funded by seed investment.

### Year 2

**Revenue target:** $1.35 million

Growth assumptions:

- Scaled ad inventory from larger active user base (approximately $350,000)
- Growing consultation volume (approximately $360,000)
- 8 to 10 employer deals (approximately $430,000)
- Insurance pilot licensing (approximately $150,000)
- Affiliate plus anonymized data-insight revenue (approximately $60,000)

**Expenses:** approximately $950,000

**Net position:** approximately $400,000 operating surplus.

### Year 3

**Revenue target:** $4.3 million+

Growth assumptions:

- Strong ad monetization from scaled consumer base (approximately $900,000)
- Consultation volume at national scale (approximately $900,000)
- Employer plans becoming the dominant stream (approximately $1.8 million)
- Insurance partnerships generating licensing revenue (approximately $500,000)
- Affiliate and anonymized insight revenue (approximately $200,000)

**Expenses:** approximately $1.8 million

**Net position:** approximately $2.5 million operating surplus.

**Funding Requirement:** Seed round target: $1 million to $1.25 million to cover 18 months of runway without subscription revenue dependency.

**Use of Funds:**

- 40% product development
- 25% legal and compliance
- 20% marketing
- 15% operations

## 12. Risk Analysis

| Risk                                             | Likelihood | Impact    | Mitigation                                                     |
| ------------------------------------------------ | ---------- | --------- | -------------------------------------------------------------- |
| FDA regulatory action                            | Medium     | Very High | Legal counsel, proper disclaimers, conservative AI positioning |
| Data breach                                      | Medium     | Very High | HIPAA-compliant infrastructure, cyber insurance                |
| Low user retention                               | High       | High      | Gamification, push notifications, health goal tracking         |
| Doctor network scaling                           | Medium     | Medium    | Partner with existing telehealth APIs initially                |
| Competitor with more resources copying the model | High       | Medium    | Build fast, focus on data moat and brand trust                 |
| B2B sales cycle too slow                         | High       | Medium    | Start B2C first, use traction to sell B2B                      |

## 13. Roadmap

- **0 to 6 months:** Legal setup, HIPAA infrastructure, MVP build (fitness tracking + symptom checker)
- **6 to 12 months:** Full feature launch, US App Store and Play Store, 5,000 users
- **12 to 18 months:** Doctor network launch, consultation feature live, first B2B pilots
- **18 to 24 months:** Insurance partnership conversations, Series A fundraising prep

## 14. Data References

1. Grand View Research. _U.S. Digital Health Market (2024-2030) Size, Share & Trends Analysis Report_. Updated April 2024. https://www.grandviewresearch.com/industry-analysis/us-digital-health-market-report
2. Koonin LM, Hoots B, Tsang CA, et al. _Trends in the Use of Telehealth During the Emergence of the COVID-19 Pandemic - United States, January-March 2020_. MMWR Morb Mortal Wkly Rep. 2020;69(43):1595-1599. doi:10.15585/mmwr.mm6943a3
3. Centers for Medicare & Medicaid Services (CMS). _NHE Fact Sheet_. Page modified January 14, 2026. https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data/nhe-fact-sheet
4. Keisler-Starkey K, Bunch LN. _Health Insurance Coverage in the United States: 2023_. U.S. Census Bureau, Report P60-284, September 2024. https://www.census.gov/library/publications/2024/demo/p60-284.html
5. Caplan Z. _2020 Census: 1 in 6 People in the United States Were 65 and Over_. U.S. Census Bureau, May 25, 2023. https://www.census.gov/library/stories/2023/05/2020-census-united-states-older-population-grew.html

## 15. AI Layer - Neuraliosis Health Assistant

### Architecture

The AI system is built with LangGraph, a graph-based agent framework, and uses OpenAI GPT-4o as the core LLM. It follows a multi-node pipeline with conditional routing based on symptom confidence scoring.

### Agent Flow

1. `intent_parser` extracts all symptoms and classifies the topic as cardiac, fitness, sleep, stress, nutrition, or general.
2. `confidence_scorer` scores the input from 0.0 to 1.0 using onset, severity, activity context, duration, body location, and history.
3. Conditional routing sends the conversation to greeting responses, the RAG retriever, the question generator, or fitness permission depending on the confidence and severity.
4. `question_generator` asks one fitness-aware multiple-choice question per turn and rotates through sleep, hydration, eating, exercise, stress, and heart rate.
5. `fitness_permission` requests access to user health data for fitness, cardiac, and sleep topics.
6. `fitness_fetcher` pulls real user fitness data such as heart rate, steps, sleep, and workout history.
7. `rag_retriever` searches the ChromaDB vector store using embedded full context.
8. `llm_synthesizer` combines symptoms, Q&A, RAG context, and fitness data to generate the wellness response.
9. `response_formatter` appends the doctor referral message when the case is serious.

### Safety and Outputs

- Critical symptoms such as chest pain, numbness, difficulty breathing, fainting, stroke, or seizure skip the question loop and go straight to specialist guidance.
- The AI never diagnoses or prescribes and always ends responses with a medical disclaimer.
- Serious cases always recommend professional care and return the required specialist when detected.

### Knowledge Base and Models

- Knowledge base: 35+ processed documents from MedlinePlus, CDC, and NIH Magazine, plus 18 curated medical and wellness JSON records.
- Vector store: ChromaDB with OpenAI `text-embedding-3-small` embeddings.
- Chunking: 500 characters with 50 character overlap.
- Models used: GPT-4o-mini for symptom parsing and question generation, GPT-4o for final synthesis, and `text-embedding-3-small` for retrieval.

### API

The AI service exposes a FastAPI layer with endpoints for chat, history, session management, and clearing sessions. The response includes confidence, seriousness flags, doctor need, specialist type, and question count.
