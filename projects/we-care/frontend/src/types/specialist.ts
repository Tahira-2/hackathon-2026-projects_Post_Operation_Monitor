interface BaseSpecialist {
  id: string
  name: string
  initials: string
}

export interface Specialist extends BaseSpecialist {
  subspecialty: string
  hospital: string
  phone: string
  available: boolean
}

export type AvailabilityStatus = 'available-now' | 'available-soon' | 'consulting' | 'in-surgery'

export interface DirectorySpecialist extends BaseSpecialist {
  credentials: string
  specialty: string
  location: string
  availabilityStatus: AvailabilityStatus
  availabilityLabel: string
}
