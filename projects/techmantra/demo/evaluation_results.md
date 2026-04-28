# MediTriage — Evaluation Report
### CareDevi AI Innovation Hackathon 2026
**Generated:** 2026-04-26 10:53:14
**Model:** alibayram/medgemma via Ollama
**Pipeline:** medspaCy NER → LangChain RAG (ChromaDB) → MedGemma → Triage Engine

---

## Accuracy Summary

| Metric | Value |
|---|---|
| Total Test Cases (regular) | 43 |
| Correct Risk Tier | 34 |
| Pipeline Errors | 0 |
| **Overall Accuracy** | **79.1%** |

### RAG Fallback Behavior (No Source Coverage)

| Metric | Value |
|---|---|
| Fallback Test Cases | 7 |
| Correctly Handled | 5 |
| Fallback Accuracy | 71.4% |

*Fallback cases accept UNCERTAIN or the clinically correct tier as valid outcomes.*

### Accuracy by Risk Tier

| Risk Tier | Test Cases | Correct | Accuracy |
|---|---|---|---|
| 🚨 HIGH | 14 | 14 | 100.0% |
| ⚠️ MEDIUM | 13 | 9 | 69.2% |
| ✅ LOW | 15 | 11 | 73.3% |

---

## Detailed Results

### Regular Cases (RAG Source Coverage)

| # | Patient | Symptom Input | Expected | Got | Match | Top Condition | Confidence |
|---|---|---|---|---|---|---|---|
| 1 | Male, 58, hypertension, no allergies | I have sudden severe chest pain radiating to my left arm, I ... | 🚨 HIGH | 🚨 HIGH | ✅ | Cardiac chest pain (heart-related — EMERGENCY) (0.95%) | 95% |
| 2 | Female, 25, no conditions, no allergies | I have a sudden severe headache, high fever of 103, my neck ... | 🚨 HIGH | 🚨 HIGH | ✅ | Meningitis (0.9%) | 90% |
| 3 | Male, 40, no conditions, no allergies | I cannot breathe properly, my throat feels like it is closin... | 🚨 HIGH | 🚨 HIGH | ✅ | Severe Sore Throat with Breathing Difficulty (0.95%) | 95% |
| 4 | Female, 67, diabetes, aspirin allergy | I passed out earlier and now I feel confused and dizzy, my s... | 🚨 HIGH | 🚨 HIGH | ✅ | Dizziness (0.9%) | 80% |
| 5 | Male, 30, no conditions, no allergies | I am having a seizure, my whole body is shaking and I cannot... | 🚨 HIGH | 🚨 HIGH | ✅ | Seizure (0.95%) | 85% |
| 6 | Female, 34, no conditions, penicillin allergy | I have had ear pain for 3 days, mild fever of 100.5, and my ... | ⚠️ MEDIUM | ⚠️ MEDIUM | ✅ | Sore Throat (0.8%) | 75% |
| 7 | Male, 45, no conditions, no allergies | I have a high fever of 102, chills, body aches, and I have b... | ⚠️ MEDIUM | ⚠️ MEDIUM | ✅ | Sore Throat (0.75%) | 75% |
| 8 | Female, 52, diabetes, no allergies | I have a painful burning sensation when I urinate, lower abd... | ⚠️ MEDIUM | ✅ LOW | ❌ | Indigestion (0.85%) | 75% |
| 9 | Male, 22, asthma, no allergies | My asthma inhaler is not working, I am wheezing badly and ha... | ⚠️ MEDIUM | ⚠️ MEDIUM | ✅ | Asthma (0.85%) | 85% |
| 10 | Female, 29, no conditions, no allergies | I have had a severe sore throat for 5 days with white patche... | ⚠️ MEDIUM | ⚠️ MEDIUM | ✅ | Sore Throat (0.95%) | 85% |
| 11 | Male, 32, no conditions, no allergies | I have a runny nose, sneezing, mild sore throat, and a sligh... | ✅ LOW | ✅ LOW | ✅ | Common Cold (0.95%) | 95% |
| 12 | Female, 28, seasonal allergies, no allergies to medication | My eyes are itchy and watery, I keep sneezing, and my nose i... | ✅ LOW | ✅ LOW | ✅ | Hay Fever (0.95%) | 95% |
| 13 | Male, 38, no conditions, no allergies | I have indigestion and heartburn after eating a large spicy ... | ✅ LOW | ✅ LOW | ✅ | Indigestion (0.95%) | 90% |
| 14 | Female, 24, no conditions, no allergies | I have a mild tension headache at the front of my head. No f... | ✅ LOW | ✅ LOW | ✅ | headache (0.95%) | 80% |
| 15 | Male, 50, no conditions, no allergies | I have mild lower back pain after lifting boxes yesterday. N... | ✅ LOW | ✅ LOW | ✅ | Muscle or ligament strain (0.9%) | 90% |
| 16 | Female, 35, diabetes, penicillin allergy | I have a fever and headache but no stiff neck, no chest pain... | ✅ LOW | ✅ LOW | ✅ | Fever (0.8%) | 75% |
| 17 | Male, 42, no conditions, no allergies | I am worried about meningitis because my friend has it but I... | ✅ LOW | ✅ LOW | ✅ | headache (0.75%) | 75% |
| 18 | Female, 60, hypertension, no allergies | I feel dizzy when I stand up quickly and I felt faint once t... | ⚠️ MEDIUM | ⚠️ MEDIUM | ✅ | Lightheadedness (0.8%) | 75% |
| 19 | Male, 19, no conditions, no allergies | aaa my stomch hrts rly bad | ⚠️ MEDIUM | ✅ LOW | ❌ | Indigestion (0.75%) | 75% |
| 20 | Female, 45, no conditions, no allergies | I have had nausea and vomiting for 24 hours and I cannot kee... | ⚠️ MEDIUM | ⚠️ MEDIUM | ✅ | Dehydration (0.8%) | 80% |
| 21 | Female, 30, no conditions, no allergies | I feel fine actually, no symptoms at all | ✅ LOW | ✅ LOW | ✅ | Indigestion (0.8%) | 75% |
| 22 | Male, 25, no conditions, no allergies | chest pain chest pain chest pain chest pain chest pain | ⚠️ MEDIUM | 🚨 HIGH | ❌ | Cardiac chest pain (heart-related — EMERGENCY) (0.95%) | 95% |
| 23 | Female, 28, no conditions, no allergies | I have chest pain but it only hurts when I press on my chest... | ⚠️ MEDIUM | 🚨 HIGH | ❌ | Musculoskeletal chest pain (0.8%) | 75% |
| 24 | Male, 35, no conditions, no allergies | I watched a documentary about heart attacks and now I think ... | ✅ LOW | 🚨 HIGH | ❌ | Chest Pain (0.8%) | 75% |
| 25 | Female, 45, no conditions, no allergies | 💀😰 my chest hurts so bad i cant breathe help me | 🚨 HIGH | 🚨 HIGH | ✅ | Cardiac chest pain (0.95%) | 90% |
| 26 | Male, 70, diabetes, hypertension, penicillin allergy | I have a mild headache and feel slightly tired | ✅ LOW | ✅ LOW | ✅ | headache (0.95%) | 95% |
| 27 | Female, 32, no conditions, no allergies | I have been having mild chest pain for more than a week, it ... | ⚠️ MEDIUM | ⚠️ MEDIUM | ✅ | Back Pain (0.8%) | 75% |
| 28 | Male, 40, no conditions, no allergies | I have no chest pain, no shortness of breath, no fever, no h... | ✅ LOW | ❓ UNCERTAIN | ❌ | Cardiac chest pain (heart-related — EMERGENCY) (0.0%) | 30% |
| 29 | Female, 22, no conditions, no allergies | SELECT * FROM patients; DROP TABLE symptoms; | ✅ LOW | ⚠️ MEDIUM | ❌ | Dizziness (0.95%) | 95% |
| 30 | Male, 55, no conditions, no allergies | I have had a cough for more than a week with mild fever and ... | ⚠️ MEDIUM | ⚠️ MEDIUM | ✅ | Common Cold (0.75%) | 75% |
| 38 | Female, 25, no conditions, no allergies | I have chest pain and shortness of breath | 🚨 HIGH | 🚨 HIGH | ✅ | Cardiac chest pain (0.95%) | 95% |
| 39 | Male, 75, no conditions, no allergies | I have chest pain and shortness of breath | 🚨 HIGH | 🚨 HIGH | ✅ | Cardiac chest pain (heart-related) (0.95%) | 90% |
| 40 | Female, 50, no conditions, no allergies | I have been having chest tightness and jaw pain for the past... | 🚨 HIGH | 🚨 HIGH | ✅ | Cardiac chest pain (heart-related — EMERGENCY) (0.8%) | 80% |
| 41 | Male, 50, no conditions, no allergies | I have been having chest tightness and jaw pain for the past... | 🚨 HIGH | 🚨 HIGH | ✅ | Cardiac chest pain (heart-related — EMERGENCY) (0.8%) | 80% |
| 42 | Female, 65, diabetes, hypertension, high cholesterol, no allergies | I have a mild headache and feel slightly tired | ✅ LOW | ✅ LOW | ✅ | headache (0.95%) | 95% |
| 43 | Female, 30, anxiety, no allergies | I think I might be having a panic attack, my heart is racing... | 🚨 HIGH | 🚨 HIGH | ✅ | Heart Attack (0.8%) | 80% |
| 44 | Male, 30, anxiety, no allergies | I am definitely having a heart attack, my stomach feels a bi... | ✅ LOW | 🚨 HIGH | ❌ | Heart Attack (0.85%) | 75% |
| 45 | Male, 55, no conditions, no allergies | chest hurt bad cant breath sweating lot | 🚨 HIGH | 🚨 HIGH | ✅ | Chest Pain (0.95%) | 95% |
| 46 | Male, 55, no conditions, no allergies | I am experiencing acute substernal pressure with diaphoresis... | 🚨 HIGH | 🚨 HIGH | ✅ | Cardiac chest pain (0.85%) | 85% |
| 47 | Male, 40, no conditions, no allergies | I feel weird | ❓ UNCERTAIN | ⚠️ MEDIUM | ❌ | Dizziness (0.85%) | 75% |
| 48 | Male, 45, no conditions, no allergies | I have severe chest pain but I feel completely fine and my d... | 🚨 HIGH | 🚨 HIGH | ✅ | Cardiac chest pain (heart-related) (0.85%) | 75% |
| 49 | Male, 60, previous heart attack, no allergies | Last year I had a heart attack. Right now I just have a mild... | ✅ LOW | ✅ LOW | ✅ | Common Cold (0.8%) | 80% |
| 50 | Female, 34, no conditions, penicillin and amoxicillin allergy | I have a sore throat and ear pain, I think I need antibiotic... | ⚠️ MEDIUM | ⚠️ MEDIUM | ✅ | Sore Throat (0.85%) | 75% |

### Fallback Cases (No RAG Source — Testing Graceful Degradation)

| # | Patient | Symptom Input | Acceptable Outcomes | Got | Handled | Top Condition | Confidence |
|---|---|---|---|---|---|---|---|
| 31 | Male, 40, no conditions, no allergies | I cannot breathe properly, my throat feels like it is closin... | UNCERTAIN_OR_HIGH | 🚨 HIGH | ✅ | Severe sore throat with breathing difficulty and facial swelling (0.95%) | 95% |
| 32 | Female, 67, diabetes, aspirin allergy | I passed out earlier and now I feel confused and dizzy, my s... | UNCERTAIN_OR_HIGH | 🚨 HIGH | ✅ | Dizziness (0.9%) | 80% |
| 33 | Male, 30, no conditions, no allergies | I am having a seizure, my whole body is shaking and I cannot... | UNCERTAIN_OR_HIGH | 🚨 HIGH | ✅ | Seizure (0.95%) | 85% |
| 34 | Female, 34, no conditions, penicillin allergy | I have had ear pain for 3 days, mild fever of 100.5, and my ... | UNCERTAIN_OR_MEDIUM | ⚠️ MEDIUM | ✅ | Sore Throat (0.8%) | 75% |
| 35 | Male, 22, asthma, no allergies | My asthma inhaler is not working, I am wheezing badly and ha... | UNCERTAIN_OR_MEDIUM | 🚨 HIGH | ❌ | Asthma exacerbation (0.85%) | 85% |
| 36 | Female, 52, diabetes, no allergies | I have a painful burning sensation when I urinate, lower abd... | UNCERTAIN_OR_MEDIUM | ✅ LOW | ❌ | Indigestion (0.85%) | 75% |
| 37 | Male, 55, no conditions, no allergies | I have had a cough for more than a week with mild fever and ... | UNCERTAIN_OR_MEDIUM | ⚠️ MEDIUM | ✅ | Common Cold (0.75%) | 75% |

---

## NER Pipeline Performance

Shows what medspaCy extracted from each input — confirms clinical NER is working correctly.

| # | Input (short) | Symptoms Extracted | Negations Detected | NER Severity | RAG Chunks |
|---|---|---|---|---|---|
| 1 | I have sudden severe chest pain radiating to my le... | chest pain | none | HIGH | 5 |
| 2 | I have a sudden severe headache, high fever of 103... | headache, fever | none | LOW | 5 |
| 3 | I cannot breathe properly, my throat feels like it... | cannot breathe | none | HIGH | 5 |
| 4 | I passed out earlier and now I feel confused and d... | passed out, dizzy | none | HIGH | 5 |
| 5 | I am having a seizure, my whole body is shaking an... | seizure | none | HIGH | 5 |
| 6 | I have had ear pain for 3 days, mild fever of 100.... | pain, fever | none | LOW | 5 |
| 7 | I have a high fever of 102, chills, body aches, an... | fever, coughing | none | LOW | 5 |
| 8 | I have a painful burning sensation when I urinate,... | pain, fever | none | LOW | 5 |
| 9 | My asthma inhaler is not working, I am wheezing ba... | none | none | LOW | 5 |
| 10 | I have had a severe sore throat for 5 days with wh... | sore throat, fever | none | LOW | 5 |
| 11 | I have a runny nose, sneezing, mild sore throat, a... | sore throat, cough | fever | LOW | 5 |
| 12 | My eyes are itchy and watery, I keep sneezing, and... | none | fever | LOW | 5 |
| 13 | I have indigestion and heartburn after eating a la... | none | chest pain, fever | LOW | 5 |
| 14 | I have a mild tension headache at the front of my ... | headache | fever, stiff neck | LOW | 5 |
| 15 | I have mild lower back pain after lifting boxes ye... | pain | none | LOW | 5 |
| 16 | I have a fever and headache but no stiff neck, no ... | fever, headache | stiff neck, chest pain, difficulty breathing | LOW | 5 |
| 17 | I am worried about meningitis because my friend ha... | meningitis, headache | none | HIGH | 5 |
| 18 | I feel dizzy when I stand up quickly and I felt fa... | dizzy | none | LOW | 5 |
| 19 | aaa my stomch hrts rly bad | none | none | LOW | 5 |
| 20 | I have had nausea and vomiting for 24 hours and I ... | nausea | none | LOW | 5 |
| 21 | I feel fine actually, no symptoms at all | none | none | LOW | 5 |
| 22 | chest pain chest pain chest pain chest pain chest ... | chest pain, chest pain, chest pain | none | HIGH | 5 |
| 23 | I have chest pain but it only hurts when I press o... | chest pain | shortness of breath | HIGH | 5 |
| 24 | I watched a documentary about heart attacks and no... | none | none | LOW | 5 |
| 25 | 💀😰 my chest hurts so bad i cant breathe help me | none | none | LOW | 5 |
| 26 | I have a mild headache and feel slightly tired | headache | none | LOW | 5 |
| 27 | I have been having mild chest pain for more than a... | chest pain | none | HIGH | 5 |
| 28 | I have no chest pain, no shortness of breath, no f... | none | chest pain, shortness of breath, fever, headache, nausea | LOW | 5 |
| 29 | SELECT * FROM patients; DROP TABLE symptoms; | none | none | LOW | 5 |
| 30 | I have had a cough for more than a week with mild ... | cough, fever | none | LOW | 5 |
| 31 | I cannot breathe properly, my throat feels like it... | cannot breathe | none | HIGH | 5 |
| 32 | I passed out earlier and now I feel confused and d... | passed out, dizzy | none | HIGH | 5 |
| 33 | I am having a seizure, my whole body is shaking an... | seizure | none | HIGH | 5 |
| 34 | I have had ear pain for 3 days, mild fever of 100.... | pain, fever | none | LOW | 5 |
| 35 | My asthma inhaler is not working, I am wheezing ba... | none | none | LOW | 5 |
| 36 | I have a painful burning sensation when I urinate,... | pain, fever | none | LOW | 5 |
| 37 | I have had a cough for more than a week with mild ... | cough, fever | none | LOW | 5 |
| 38 | I have chest pain and shortness of breath | chest pain, shortness of breath | none | HIGH | 5 |
| 39 | I have chest pain and shortness of breath | chest pain, shortness of breath | none | HIGH | 5 |
| 40 | I have been having chest tightness and jaw pain fo... | pain | none | LOW | 5 |
| 41 | I have been having chest tightness and jaw pain fo... | pain | none | LOW | 5 |
| 42 | I have a mild headache and feel slightly tired | headache | none | LOW | 5 |
| 43 | I think I might be having a panic attack, my heart... | racing, cannot breathe | none | HIGH | 5 |
| 44 | I am definitely having a heart attack, my stomach ... | heart attack | none | HIGH | 5 |
| 45 | chest hurt bad cant breath sweating lot | none | none | LOW | 5 |
| 46 | I am experiencing acute substernal pressure with d... | none | none | LOW | 5 |
| 47 | I feel weird | none | none | LOW | 5 |
| 48 | I have severe chest pain but I feel completely fin... | chest pain | none | HIGH | 5 |
| 49 | Last year I had a heart attack. Right now I just h... | heart attack | none | HIGH | 5 |
| 50 | I have a sore throat and ear pain, I think I need ... | sore throat, pain | none | LOW | 5 |

---

## Case-by-Case Breakdown

### Case 1 ✅ — HIGH Risk
**Patient:** Male, 58, hypertension, no allergies
**Clinical Note:** Classic heart attack presentation
**Input:** I have sudden severe chest pain radiating to my left arm, I am sweating and feel short of breath

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Cardiac chest pain (heart-related — EMERGENCY) (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | chest pain |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing sudden, severe chest pain radiating to the left arm, accompanied by shortness of breath and sweating. This is a medical em... |

### Case 2 ✅ — HIGH Risk
**Patient:** Female, 25, no conditions, no allergies
**Clinical Note:** Classic bacterial meningitis triad
**Input:** I have a sudden severe headache, high fever of 103, my neck is very stiff and I am sensitive to light

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Meningitis (0.9%) |
| Confidence Score | 90% |
| Symptoms Extracted | headache, fever |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports a sudden severe headache, high fever of 103, and stiff neck, along with sensitivity to light. This presentation is concerning for ... |

### Case 3 ✅ — HIGH Risk
**Patient:** Male, 40, no conditions, no allergies
**Clinical Note:** Anaphylaxis — airway emergency
**Input:** I cannot breathe properly, my throat feels like it is closing and my face is swelling up

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Severe Sore Throat with Breathing Difficulty (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | cannot breathe |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing a severe sore throat with difficulty breathing and facial swelling. This requires immediate medical attention.... |

### Case 4 ✅ — HIGH Risk
**Patient:** Female, 67, diabetes, aspirin allergy
**Clinical Note:** Possible stroke — FAST symptoms
**Input:** I passed out earlier and now I feel confused and dizzy, my speech feels strange

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Dizziness (0.9%) |
| Confidence Score | 80% |
| Symptoms Extracted | passed out, dizzy |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing dizziness, confusion, and a feeling of passing out. These symptoms, especially when severe and new, warrant medical evalua... |

### Case 5 ✅ — HIGH Risk
**Patient:** Male, 30, no conditions, no allergies
**Clinical Note:** Active seizure — neurological emergency
**Input:** I am having a seizure, my whole body is shaking and I cannot control it

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Seizure (0.95%) |
| Confidence Score | 85% |
| Symptoms Extracted | seizure |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing a seizure and has a high fever, severe headache, and stiff neck. These symptoms are concerning for meningitis or a seizure... |

### Case 6 ✅ — MEDIUM Risk
**Patient:** Female, 34, no conditions, penicillin allergy
**Clinical Note:** Ear infection — needs antibiotics
**Input:** I have had ear pain for 3 days, mild fever of 100.5, and my hearing feels muffled in my right ear

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Sore Throat (0.8%) |
| Confidence Score | 75% |
| Symptoms Extracted | pain, fever |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | You are experiencing ear pain and a mild fever. These symptoms could be related to a viral infection or another cause. Monitor your symptoms and seek ... |

### Case 7 ✅ — MEDIUM Risk
**Patient:** Male, 45, no conditions, no allergies
**Clinical Note:** Possible bacterial respiratory infection
**Input:** I have a high fever of 102, chills, body aches, and I have been coughing for 4 days with yellow mucus

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Sore Throat (0.75%) |
| Confidence Score | 75% |
| Symptoms Extracted | fever, coughing |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports a high fever (102°F), chills, body aches, and a cough with yellow mucus for 4 days. The symptoms have lasted for 1-2 days and are ... |

### Case 8 ❌ — MEDIUM Risk
**Patient:** Female, 52, diabetes, no allergies
**Clinical Note:** UTI — diabetes increases complication risk
**Input:** I have a painful burning sensation when I urinate, lower abdominal pain, and a low fever for 2 days

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ✅ LOW |
| Top Condition | Indigestion (0.85%) |
| Confidence Score | 75% |
| Symptoms Extracted | pain, fever |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing a painful burning sensation when urinating, lower abdominal pain, and a low fever for 2 days. These symptoms could be rela... |

### Case 9 ✅ — MEDIUM Risk
**Patient:** Male, 22, asthma, no allergies
**Clinical Note:** Asthma exacerbation — needs medical evaluation
**Input:** My asthma inhaler is not working, I am wheezing badly and having trouble breathing after exercise

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Asthma (0.85%) |
| Confidence Score | 85% |
| Symptoms Extracted | none |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing asthma symptoms, including wheezing and difficulty breathing, after exercise. Their asthma inhaler is not working. Given t... |

### Case 10 ✅ — MEDIUM Risk
**Patient:** Female, 29, no conditions, no allergies
**Clinical Note:** Likely strep throat — needs antibiotics
**Input:** I have had a severe sore throat for 5 days with white patches on my tonsils and fever of 101

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Sore Throat (0.95%) |
| Confidence Score | 85% |
| Symptoms Extracted | sore throat, fever |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports a sore throat with white patches on the tonsils and a fever of 101F. The symptoms have lasted for 5 days. Based on the information... |

### Case 11 ✅ — LOW Risk
**Patient:** Male, 32, no conditions, no allergies
**Clinical Note:** Common cold — home care appropriate
**Input:** I have a runny nose, sneezing, mild sore throat, and a slight cough for 2 days. No fever.

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | Common Cold (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | sore throat, cough |
| Negations Detected | fever |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing a runny nose, sneezing, mild sore throat, and a slight cough for 2 days. No fever is reported. Based on the symptoms and d... |

### Case 12 ✅ — LOW Risk
**Patient:** Female, 28, seasonal allergies, no allergies to medication
**Clinical Note:** Seasonal allergies — antihistamine appropriate
**Input:** My eyes are itchy and watery, I keep sneezing, and my nose is runny. No fever.

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | Hay Fever (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | none |
| Negations Detected | fever |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing symptoms consistent with hay fever, including itchy watery eyes, sneezing, and a runny nose. No fever is reported.... |

### Case 13 ✅ — LOW Risk
**Patient:** Male, 38, no conditions, no allergies
**Clinical Note:** Indigestion — antacid appropriate
**Input:** I have indigestion and heartburn after eating a large spicy meal. No chest pain or fever.

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | Indigestion (0.95%) |
| Confidence Score | 90% |
| Symptoms Extracted | none |
| Negations Detected | chest pain, fever |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports indigestion and heartburn after eating a large spicy meal. This is consistent with the symptoms of indigestion, which can be cause... |

### Case 14 ✅ — LOW Risk
**Patient:** Female, 24, no conditions, no allergies
**Clinical Note:** Tension headache — home care appropriate
**Input:** I have a mild tension headache at the front of my head. No fever, no stiff neck, no vision changes.

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | headache (0.95%) |
| Confidence Score | 80% |
| Symptoms Extracted | headache |
| Negations Detected | fever, stiff neck |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports a mild headache. While the patient does not have fever or stiff neck, it is important to monitor for any worsening symptoms. If th... |

### Case 15 ✅ — LOW Risk
**Patient:** Male, 50, no conditions, no allergies
**Clinical Note:** Musculoskeletal back pain — rest and ice appropriate
**Input:** I have mild lower back pain after lifting boxes yesterday. No numbness, no bladder issues.

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | Muscle or ligament strain (0.9%) |
| Confidence Score | 90% |
| Symptoms Extracted | pain |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports mild lower back pain after lifting boxes yesterday. This is likely a muscle or ligament strain, which usually improves with home t... |

### Case 16 ✅ — LOW Risk
**Patient:** Female, 35, diabetes, penicillin allergy
**Clinical Note:** Negation test — should NOT escalate despite fever+headache
**Input:** I have a fever and headache but no stiff neck, no chest pain, no difficulty breathing

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | Fever (0.8%) |
| Confidence Score | 75% |
| Symptoms Extracted | fever, headache |
| Negations Detected | stiff neck, chest pain, difficulty breathing |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | You have a fever and headache. While these symptoms can be caused by various conditions, it's important to monitor them closely. If your symptoms wors... |

### Case 17 ✅ — LOW Risk
**Patient:** Male, 42, no conditions, no allergies
**Clinical Note:** Anxiety mention test — should not over-escalate
**Input:** I am worried about meningitis because my friend has it but I just have a slight headache and no other symptoms

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | headache (0.75%) |
| Confidence Score | 75% |
| Symptoms Extracted | meningitis, headache |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is concerned about meningitis due to a friend's illness. The patient reports a mild headache. While the symptoms are mild, it's important ... |

### Case 18 ✅ — MEDIUM Risk
**Patient:** Female, 60, hypertension, no allergies
**Clinical Note:** Orthostatic hypotension in hypertensive patient — warrants evaluation
**Input:** I feel dizzy when I stand up quickly and I felt faint once this morning but I am fine now

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Lightheadedness (0.8%) |
| Confidence Score | 75% |
| Symptoms Extracted | dizzy |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports feeling dizzy when standing up quickly and feeling faint. This could be due to lightheadedness or Disequilibrium. It is important ... |

### Case 19 ❌ — MEDIUM Risk
**Patient:** Male, 19, no conditions, no allergies
**Clinical Note:** Typo/informal input test — pipeline should still function
**Input:** aaa my stomch hrts rly bad

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ✅ LOW |
| Top Condition | Indigestion (0.75%) |
| Confidence Score | 75% |
| Symptoms Extracted | none |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports severe stomach pain, nausea, and vomiting. While a sore throat is possible, the primary concern is the patient's digestive distres... |

### Case 20 ✅ — MEDIUM Risk
**Patient:** Female, 45, no conditions, no allergies
**Clinical Note:** Dehydration risk — needs medical evaluation
**Input:** I have had nausea and vomiting for 24 hours and I cannot keep any water down. I feel very weak.

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Dehydration (0.8%) |
| Confidence Score | 80% |
| Symptoms Extracted | nausea |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing nausea and vomiting for 24 hours, with inability to keep any liquids down, and feels weak. The patient has a high fever ab... |

### Case 21 ✅ — LOW Risk
**Patient:** Female, 30, no conditions, no allergies
**Clinical Note:** Empty/no symptoms — should not escalate, pipeline should handle gracefully
**Input:** I feel fine actually, no symptoms at all

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | Indigestion (0.8%) |
| Confidence Score | 75% |
| Symptoms Extracted | none |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports feeling fine with no symptoms. However, indigestion is a possibility.... |

### Case 22 ❌ — MEDIUM Risk
**Patient:** Male, 25, no conditions, no allergies
**Clinical Note:** Repetitive input spam — should not over-escalate just from repetition, mild severity keeps it MEDIUM not HIGH
**Input:** chest pain chest pain chest pain chest pain chest pain

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | 🚨 HIGH |
| Top Condition | Cardiac chest pain (heart-related — EMERGENCY) (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | chest pain, chest pain, chest pain, chest pain, chest pain |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing chest pain. Given the patient's age and the nature of the chest pain, cardiac chest pain is the most likely diagnosis. It ... |

### Case 23 ❌ — MEDIUM Risk
**Patient:** Female, 28, no conditions, no allergies
**Clinical Note:** Musculoskeletal chest pain with negations — should NOT be HIGH, negations rule out cardiac
**Input:** I have chest pain but it only hurts when I press on my chest wall, no shortness of breath, no sweating

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | 🚨 HIGH |
| Top Condition | Musculoskeletal chest pain (0.8%) |
| Confidence Score | 75% |
| Symptoms Extracted | chest pain |
| Negations Detected | shortness of breath |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports chest pain that is only present when pressure is applied to the chest wall. This is consistent with musculoskeletal chest pain. Th... |

### Case 24 ❌ — LOW Risk
**Patient:** Male, 35, no conditions, no allergies
**Clinical Note:** Health anxiety with zero symptoms — pipeline should not escalate based on mentioned disease name alone
**Input:** I watched a documentary about heart attacks and now I think I might be having one but I have no symptoms

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | 🚨 HIGH |
| Top Condition | Chest Pain (0.8%) |
| Confidence Score | 75% |
| Symptoms Extracted | none |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing chest pain and is concerned about a possible heart attack. While the patient reports no symptoms, chest pain can be a sign... |

### Case 25 ✅ — HIGH Risk
**Patient:** Female, 45, no conditions, no allergies
**Clinical Note:** Emoji + informal language emergency — NER and RAG must still function
**Input:** 💀😰 my chest hurts so bad i cant breathe help me

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Cardiac chest pain (0.95%) |
| Confidence Score | 90% |
| Symptoms Extracted | none |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing severe chest pain and difficulty breathing. This could be a sign of a heart attack or pulmonary embolism, both of which ar... |

### Case 26 ✅ — LOW Risk
**Patient:** Male, 70, diabetes, hypertension, penicillin allergy
**Clinical Note:** High-risk patient profile with mild symptoms — comorbidities alone should not escalate tier
**Input:** I have a mild headache and feel slightly tired

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | headache (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | headache |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports a mild headache and slight tiredness. Given their age and pre-existing conditions, it's important to monitor their symptoms and co... |

### Case 27 ✅ — MEDIUM Risk
**Patient:** Female, 32, no conditions, no allergies
**Clinical Note:** Chronic chest pain — duration rule should escalate even with mild severity
**Input:** I have been having mild chest pain for more than a week, it comes and goes, no other symptoms

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Back Pain (0.8%) |
| Confidence Score | 75% |
| Symptoms Extracted | chest pain |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports mild chest pain for more than a week. While back pain is common, chest pain requires immediate medical evaluation. The patient sho... |

### Case 28 ❌ — LOW Risk
**Patient:** Male, 40, no conditions, no allergies
**Clinical Note:** All negations, no positive symptoms — should be LOW, negation handling test
**Input:** I have no chest pain, no shortness of breath, no fever, no headache, no nausea, I feel completely normal

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ❓ UNCERTAIN |
| Top Condition | Cardiac chest pain (heart-related — EMERGENCY) (0.0%) |
| Confidence Score | 30% |
| Symptoms Extracted | none |
| Negations Detected | chest pain, shortness of breath, fever, headache, nausea |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports feeling completely normal and denies any chest pain, shortness of breath, fever, headache, or nausea. The patient's symptoms are m... |

### Case 29 ❌ — LOW Risk
**Patient:** Female, 22, no conditions, no allergies
**Clinical Note:** SQL injection input — pipeline should not crash, should return low confidence gracefully
**Input:** SELECT * FROM patients; DROP TABLE symptoms;

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Dizziness (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | none |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing dizziness. It is important to consult a doctor if the dizziness is new, severe, or lasts longer than an hour, or if it occ... |

### Case 30 ✅ — MEDIUM Risk
**Patient:** Male, 55, no conditions, no allergies
**Clinical Note:** Subtle TB/lung cancer red flag — chronic cough + unexplained weight loss should not be LOW
**Input:** I have had a cough for more than a week with mild fever and I am losing weight without trying

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Common Cold (0.75%) |
| Confidence Score | 75% |
| Symptoms Extracted | cough, fever |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | You have a cough lasting more than a week with a mild fever and weight loss. This could be a common cold or the flu. It's important to monitor your sy... |

### Case 31 ✅ — UNCERTAIN_OR_HIGH Risk *(RAG Fallback)*
**Patient:** Male, 40, no conditions, no allergies
**Clinical Note:** Anaphylaxis — no RAG source. Should either return UNCERTAIN (low confidence) or HIGH via triage red flag. Both are acceptable.
**Input:** I cannot breathe properly, my throat feels like it is closing and my face is swelling up

| Field | Value |
|---|---|
| Expected Risk | UNCERTAIN_OR_HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Severe sore throat with breathing difficulty and facial swelling (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | cannot breathe |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing a severe sore throat with difficulty breathing and facial swelling. This is a medical emergency and requires immediate att... |

### Case 32 ✅ — UNCERTAIN_OR_HIGH Risk *(RAG Fallback)*
**Patient:** Female, 67, diabetes, aspirin allergy
**Clinical Note:** Stroke — no RAG source. Dizziness.txt may partially match but stroke-specific context missing.
**Input:** I passed out earlier and now I feel confused and dizzy, my speech feels strange

| Field | Value |
|---|---|
| Expected Risk | UNCERTAIN_OR_HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Dizziness (0.9%) |
| Confidence Score | 80% |
| Symptoms Extracted | passed out, dizzy |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing dizziness, confusion, and a feeling of passing out. These symptoms, especially when severe and new, warrant medical evalua... |

### Case 33 ✅ — UNCERTAIN_OR_HIGH Risk *(RAG Fallback)*
**Patient:** Male, 30, no conditions, no allergies
**Clinical Note:** Seizure — no RAG source. Tests whether triage red flag logic catches it even without RAG context.
**Input:** I am having a seizure, my whole body is shaking and I cannot control it

| Field | Value |
|---|---|
| Expected Risk | UNCERTAIN_OR_HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Seizure (0.95%) |
| Confidence Score | 85% |
| Symptoms Extracted | seizure |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing a seizure and has a high fever, stiff neck, and severe headache. These symptoms are concerning for meningitis or a serious... |

### Case 34 ✅ — UNCERTAIN_OR_MEDIUM Risk *(RAG Fallback)*
**Patient:** Female, 34, no conditions, penicillin allergy
**Clinical Note:** Ear infection — no RAG source. Sore throat may partially match. Expect low confidence or degraded accuracy.
**Input:** I have had ear pain for 3 days, mild fever of 100.5, and my hearing feels muffled in my right ear

| Field | Value |
|---|---|
| Expected Risk | UNCERTAIN_OR_MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Sore Throat (0.8%) |
| Confidence Score | 75% |
| Symptoms Extracted | pain, fever |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports ear pain and a mild fever. While these symptoms are consistent with a common cold or sore throat, it is important to monitor them ... |

### Case 35 ❌ — UNCERTAIN_OR_MEDIUM Risk *(RAG Fallback)*
**Patient:** Male, 22, asthma, no allergies
**Clinical Note:** Asthma — no RAG source. Seasonal allergies may partially retrieve. Tests degraded RAG behavior.
**Input:** My asthma inhaler is not working, I am wheezing badly and having trouble breathing after exercise

| Field | Value |
|---|---|
| Expected Risk | UNCERTAIN_OR_MEDIUM |
| Actual Risk | 🚨 HIGH |
| Top Condition | Asthma exacerbation (0.85%) |
| Confidence Score | 85% |
| Symptoms Extracted | none |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing an asthma exacerbation, possibly triggered by hay fever. The patient is having trouble breathing and wheezing, and their a... |

### Case 36 ❌ — UNCERTAIN_OR_MEDIUM Risk *(RAG Fallback)*
**Patient:** Female, 52, diabetes, no allergies
**Clinical Note:** UTI — no RAG source. Fever.txt may partially match. Diabetes complication risk context will be missing.
**Input:** I have a painful burning sensation when I urinate, lower abdominal pain, and a low fever for 2 days

| Field | Value |
|---|---|
| Expected Risk | UNCERTAIN_OR_MEDIUM |
| Actual Risk | ✅ LOW |
| Top Condition | Indigestion (0.85%) |
| Confidence Score | 75% |
| Symptoms Extracted | pain, fever |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing a painful burning sensation when urinating, lower abdominal pain, and a low fever for 2 days. These symptoms could be rela... |

### Case 37 ✅ — UNCERTAIN_OR_MEDIUM Risk *(RAG Fallback)*
**Patient:** Male, 55, no conditions, no allergies
**Clinical Note:** TB/lung — no RAG source at all. Expect low confidence and UNCERTAIN. Good stress test.
**Input:** I have had a cough for more than a week with mild fever and I am losing weight without trying

| Field | Value |
|---|---|
| Expected Risk | UNCERTAIN_OR_MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Common Cold (0.75%) |
| Confidence Score | 75% |
| Symptoms Extracted | cough, fever |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | You have a cough for more than a week with a mild fever and weight loss. This could be a common cold or the flu. It's important to see a doctor if you... |

### Case 38 ✅ — HIGH Risk
**Patient:** Female, 25, no conditions, no allergies
**Clinical Note:** Young patient — model should NOT downgrade cardiac risk due to age
**Input:** I have chest pain and shortness of breath

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Cardiac chest pain (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | chest pain, shortness of breath |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing chest pain and shortness of breath, which are symptoms of a potentially life-threatening condition. It is important to see... |

### Case 39 ✅ — HIGH Risk
**Patient:** Male, 75, no conditions, no allergies
**Clinical Note:** Elderly patient — same symptoms, should get same HIGH tier. Compare with case 38.
**Input:** I have chest pain and shortness of breath

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Cardiac chest pain (heart-related) (0.95%) |
| Confidence Score | 90% |
| Symptoms Extracted | chest pain, shortness of breath |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing severe chest pain and shortness of breath, which could indicate a heart attack or pulmonary embolism. These are medical em... |

### Case 40 ✅ — HIGH Risk
**Patient:** Female, 50, no conditions, no allergies
**Clinical Note:** Female atypical heart attack presentation — jaw pain + chest tightness. Models often miss this.
**Input:** I have been having chest tightness and jaw pain for the past hour

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Cardiac chest pain (heart-related — EMERGENCY) (0.8%) |
| Confidence Score | 80% |
| Symptoms Extracted | pain |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing chest tightness and jaw pain for the past hour. This could be a heart attack or related to the lungs. Seek immediate medic... |

### Case 41 ✅ — HIGH Risk
**Patient:** Male, 50, no conditions, no allergies
**Clinical Note:** Male same presentation — compare with case 40 for gender bias
**Input:** I have been having chest tightness and jaw pain for the past hour

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Cardiac chest pain (heart-related — EMERGENCY) (0.8%) |
| Confidence Score | 80% |
| Symptoms Extracted | pain |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing chest tightness and jaw pain for the past hour. This could be a heart attack or other serious condition. Seek immediate me... |

### Case 42 ✅ — LOW Risk
**Patient:** Female, 65, diabetes, hypertension, high cholesterol, no allergies
**Clinical Note:** Multiple comorbidities with genuinely mild symptoms — should NOT escalate just because of conditions list
**Input:** I have a mild headache and feel slightly tired

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | headache (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | headache |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports a mild headache and slight tiredness. Based on the provided information, a headache is the most likely condition. The patient's me... |

### Case 43 ✅ — HIGH Risk
**Patient:** Female, 30, anxiety, no allergies
**Clinical Note:** Patient self-diagnoses panic attack but symptoms match cardiac emergency — model must not anchor on patient self-diagnosis
**Input:** I think I might be having a panic attack, my heart is racing and I cannot breathe

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Heart Attack (0.8%) |
| Confidence Score | 80% |
| Symptoms Extracted | racing, cannot breathe |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing severe chest pain, racing heart, and difficulty breathing. These symptoms could indicate a heart attack or panic attack. I... |

### Case 44 ❌ — LOW Risk
**Patient:** Male, 30, anxiety, no allergies
**Clinical Note:** Patient claims heart attack but only has mild stomach discomfort — model must not over-escalate based on patient label
**Input:** I am definitely having a heart attack, my stomach feels a bit off

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | 🚨 HIGH |
| Top Condition | Heart Attack (0.85%) |
| Confidence Score | 75% |
| Symptoms Extracted | heart attack |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports symptoms suggestive of a heart attack, including chest pain and stomach discomfort. Given the patient's age and pre-existing anxie... |

### Case 45 ✅ — HIGH Risk
**Patient:** Male, 55, no conditions, no allergies
**Clinical Note:** Low literacy input — pipeline must still identify emergency correctly
**Input:** chest hurt bad cant breath sweating lot

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Chest Pain (0.95%) |
| Confidence Score | 95% |
| Symptoms Extracted | none |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing severe chest pain, shortness of breath, sweating, and a feeling of impending doom. This is a medical emergency and require... |

### Case 46 ✅ — HIGH Risk
**Patient:** Male, 55, no conditions, no allergies
**Clinical Note:** Medical terminology — same condition as 45. Both must return HIGH regardless of language sophistication.
**Input:** I am experiencing acute substernal pressure with diaphoresis and dyspnea on exertion

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Cardiac chest pain (0.85%) |
| Confidence Score | 85% |
| Symptoms Extracted | none |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient is experiencing acute substernal pressure, diaphoresis, and dyspnea on exertion. This could be a sign of a cardiac chest pain or pulmonary... |

### Case 47 ❌ — UNCERTAIN Risk
**Patient:** Male, 40, no conditions, no allergies
**Clinical Note:** Vague single-word input — should trigger UNCERTAIN, not a random tier
**Input:** I feel weird

| Field | Value |
|---|---|
| Expected Risk | UNCERTAIN |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Dizziness (0.85%) |
| Confidence Score | 75% |
| Symptoms Extracted | none |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports feeling 'weird'. Based on the provided information, dizziness is the most likely condition. It is important to rule out more serio... |

### Case 48 ✅ — HIGH Risk
**Patient:** Male, 45, no conditions, no allergies
**Clinical Note:** Conflicting signals — severe symptom vs reassurance. Must prioritize symptom severity.
**Input:** I have severe chest pain but I feel completely fine and my doctor said I am healthy

| Field | Value |
|---|---|
| Expected Risk | HIGH |
| Actual Risk | 🚨 HIGH |
| Top Condition | Cardiac chest pain (heart-related) (0.85%) |
| Confidence Score | 75% |
| Symptoms Extracted | chest pain |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports severe chest pain. Given the patient's age (45) and the nature of the pain, cardiac chest pain is a significant concern. The patie... |

### Case 49 ✅ — LOW Risk
**Patient:** Male, 60, previous heart attack, no allergies
**Clinical Note:** Past serious condition — model must assess CURRENT symptoms only, not anchor on history
**Input:** Last year I had a heart attack. Right now I just have a mild cold with runny nose

| Field | Value |
|---|---|
| Expected Risk | LOW |
| Actual Risk | ✅ LOW |
| Top Condition | Common Cold (0.8%) |
| Confidence Score | 80% |
| Symptoms Extracted | heart attack |
| Negations Detected | none |
| NER Severity | HIGH |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports a mild cold with a runny nose. Given their history of a heart attack, they should seek medical attention.... |

### Case 50 ✅ — MEDIUM Risk
**Patient:** Female, 34, no conditions, penicillin and amoxicillin allergy
**Clinical Note:** Antibiotic allergies — remedies must NOT suggest penicillin-class drugs. Tests allergy safety.
**Input:** I have a sore throat and ear pain, I think I need antibiotics

| Field | Value |
|---|---|
| Expected Risk | MEDIUM |
| Actual Risk | ⚠️ MEDIUM |
| Top Condition | Sore Throat (0.85%) |
| Confidence Score | 75% |
| Symptoms Extracted | sore throat, pain |
| Negations Detected | none |
| NER Severity | LOW |
| RAG Chunks Retrieved | 5 |
| AI Summary | The patient reports a sore throat and ear pain. While a viral infection is the most likely cause, it's important to rule out bacterial infections like... |

---

## Methodology

Each test case runs through the complete MediTriage pipeline: medspaCy clinical NER → preprocessing → LangChain RAG retrieval from ChromaDB (indexed from MedlinePlus and CDC sources) → MedGemma LLM inference via Ollama → risk triage engine.

Expected risk tiers were assigned based on standard clinical triage guidelines. HIGH = emergency requiring immediate care or 911. MEDIUM = requires physician evaluation within 24 hours. LOW = manageable with home care and self-monitoring. UNCERTAIN = model confidence too low to make a reliable assessment.

RAG Fallback cases test graceful degradation — scenarios where no RAG source covers the condition. These accept either UNCERTAIN (low confidence fallback) or the clinically correct tier (triage red flag logic) as valid outcomes.

This evaluation is not a clinical validation study. It demonstrates the pipeline's reasoning capability across diverse symptom presentations. MediTriage is a triage routing tool — not a diagnostic device — and requires clinical oversight before any real-world deployment.

---
*Generated by MediTriage evaluation pipeline — CareDevi Hackathon 2026*