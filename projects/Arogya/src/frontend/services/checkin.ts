import type { CheckInFormData } from '@/types/app-data';

const mockCheckInForm: CheckInFormData = {
  patientName: 'Alex',
  title: 'Daily Check-in',
  subtitle: 'How are you feeling today, Alex?',
  symptomOptions: [
    { id: 'headache', label: 'Headache', icon: 'mood-bad' },
    { id: 'nausea', label: 'Nausea', icon: 'sick' },
    { id: 'fatigue', label: 'Fatigue', icon: 'dark-mode' },
    { id: 'dizziness', label: 'Dizziness', icon: 'trending-up' },
  ],
  selectedSymptoms: [],
  painLevel: 5,
  hasFever: false,
  temperature: '98.6',
  hasBreathingIssues: false,
  notes: '',
};

export async function getCheckInForm(): Promise<CheckInFormData> {
  return Promise.resolve(mockCheckInForm);
}

export async function submitCheckIn(form: CheckInFormData): Promise<CheckInFormData> {
  return Promise.resolve(form);
}
