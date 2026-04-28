export type Urgency = 'HIGH' | 'ELEVATED' | 'ROUTINE'
export type ReferralStatus = 'PENDING' | 'SENT' | 'ACCEPTED' | 'COMPLETED'

export interface Referral {
  id: string
  patient: string
  diagnosis: string
  specialty: string
  specialist: string
  urgency: Urgency
  status: ReferralStatus
  date: string
}

export interface ExtractedData {
  patientName: string
  dob: string
  gender: string
  email: string
  phone: string
  requiredSpecialty: string
  diagnosis: string
  urgency: string
}
