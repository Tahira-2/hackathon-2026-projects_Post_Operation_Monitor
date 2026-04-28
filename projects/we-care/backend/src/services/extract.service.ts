import { geminiModel } from '../lib/gemini';

export interface ExtractedReferral {
  patient_name: string;
  date_of_birth: string;
  email: string;
  diagnosis: string;
  urgency: 'low' | 'medium' | 'high';
  required_specialty: string;
}

export async function extractReferralFromNotes(notes: string): Promise<ExtractedReferral> {
  const prompt = `
You are a medical assistant. Extract the following fields from the clinical note below and return ONLY a valid JSON object with no extra text.

Fields to extract:
- patient_name: full name of the patient
- date_of_birth: date of birth in YYYY-MM-DD format, or empty string if not found
- email: patient email address, or empty string if not found
- diagnosis: the medical condition or symptom
- urgency: one of "low", "medium", or "high"
- required_specialty: the medical specialty needed (e.g. Cardiology, Neurology)

Clinical note:
"${notes}"

Return only this JSON format:
{
  "patient_name": "",
  "date_of_birth": "",
  "email": "",
  "diagnosis": "",
  "urgency": "",
  "required_specialty": ""
}
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to extract structured data from notes');

  return JSON.parse(jsonMatch[0]) as ExtractedReferral;
}
