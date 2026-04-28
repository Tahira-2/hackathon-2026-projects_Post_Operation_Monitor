export const ROLE_VALUES = ['ADMIN', 'DOCTOR', 'PATIENT'] as const;

export type Role = (typeof ROLE_VALUES)[number];
