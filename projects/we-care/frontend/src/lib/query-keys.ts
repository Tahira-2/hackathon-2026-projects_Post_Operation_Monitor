export const queryKeys = {
  dashboard: (viewType: string) => ['dashboard', viewType] as const,
  doctorProfile: ['doctor-profile'] as const,
  doctorById: (doctorId: string) => ['doctor-profile', doctorId] as const,
  doctorLookups: ['doctor-lookups'] as const,
  referrals: (viewType: string, page: number, pageSize: number) => ['referrals', viewType, page, pageSize] as const,
  specialistsDirectory: ['specialists-directory'] as const,
}
