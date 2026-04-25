require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static('.'));

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'Qwen/Qwen2.5-72B-Instruct';

const SYSTEM_PROMPT = `You are a clinical triage assistant. A patient will describe their symptoms.
Assess urgency and respond ONLY with valid JSON matching this exact structure
(no extra text, no markdown):
{
"urgency": "EMERGENCY | URGENT | ROUTINE",
"care_setting": "ER | Urgent Care | Telehealth | Primary Care",
"confidence": "High | Medium | Low",
"explanation": "2-3 sentences in plain English explaining the assessment",
"red_flags": ["symptom that would make this worse", "another red flag"],
"disclaimer": "This tool is for informational purposes only and is not a substitute for professional medical advice. If you believe you are experiencing a medical emergency, call 911 immediately."
}
Only use what the patient told you. If unclear, set confidence to Low
and choose the more cautious care setting.`;

// Extracts JSON from model output, stripping markdown fences if present
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  return JSON.parse(match ? match[1].trim() : text.trim());
}

// Calls the Hugging Face Inference API and returns structured triage JSON
async function getTriage(symptoms) {
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: symptoms }
      ],
      max_tokens: 1024,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return extractJSON(data.choices[0].message.content);
}

// Handles POST /api/triage — validates input, calls HF, returns triage result
app.post('/api/triage', async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
    return res.status(400).json({ error: 'symptoms field is required' });
  }
  try {
    const result = await getTriage(symptoms.trim());
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));
