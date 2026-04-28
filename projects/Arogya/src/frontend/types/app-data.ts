import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type VitalItem = {
  id: string;
  label: string;
  value: string;
  unit: string;
};

export type HomeSummary = {
  greetingName: string;
  summaryText: string;
  medication: {
    label: string;
    name: string;
    dueText: string;
    actionLabel: string;
  };
  recoveryStatus: {
    title: string;
    value: string;
  };
  checkIn: {
    title: string;
    value: string;
    actionLabel: string;
  };
  vitals: VitalItem[];
  doctorMessage: {
    title: string;
    message: string;
  };
  emergencyLabel: string;
};

export type SymptomOption = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export type CheckInFormData = {
  patientName: string;
  title: string;
  subtitle: string;
  symptomOptions: SymptomOption[];
  selectedSymptoms: string[];
  painLevel: number;
  hasFever: boolean;
  temperature: string;
  hasBreathingIssues: boolean;
  notes: string;
};

export type ProfileStat = {
  title: string;
  value: string;
  valueColor?: string;
  trend?: boolean;
};

export type ProfileSettingsItem = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  iconBackground: string;
  iconColor: string;
  badgeLabel?: string;
  danger?: boolean;
};

export type ProfileSummary = {
  name: string;
  patientId: string;
  stats: ProfileStat[];
  settingsItems: ProfileSettingsItem[];
  footerText: string;
};