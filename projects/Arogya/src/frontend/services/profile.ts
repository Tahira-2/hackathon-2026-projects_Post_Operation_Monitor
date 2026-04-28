import type { ProfileSummary } from '@/types/app-data';

const mockProfileSummary: ProfileSummary = {
  name: 'Elena Rodriguez',
  patientId: '#CL-882941',
  stats: [
    { title: 'Last Visit', value: 'Oct 12, 2023' },
    { title: 'Health Score', value: '92%', valueColor: '#0A7A25', trend: true },
  ],
  settingsItems: [
    {
      id: 'personal-info',
      icon: 'person',
      title: 'Personal Info',
      iconBackground: '#DDEBFF',
      iconColor: '#0B63B0',
    },
    {
      id: 'medical-history',
      icon: 'medical-information',
      title: 'Medical History',
      iconBackground: '#98F28A',
      iconColor: '#0C6B22',
    },
    {
      id: 'connected-devices',
      icon: 'devices',
      title: 'Connected Devices',
      iconBackground: '#DCEAF7',
      iconColor: '#526372',
      badgeLabel: '2 ACTIVE',
    },
    {
      id: 'notifications',
      icon: 'notifications',
      title: 'Notification Settings',
      iconBackground: '#ECECEC',
      iconColor: '#111827',
    },
    {
      id: 'help',
      icon: 'help',
      title: 'Help & Support',
      iconBackground: '#ECECEC',
      iconColor: '#111827',
    },
    {
      id: 'sign-out',
      icon: 'logout',
      title: 'Sign Out',
      iconBackground: '#FDE0E0',
      iconColor: '#B91C1C',
      danger: true,
    },
  ],
  footerText: 'CareLoop v2.4.1 Build 502',
};

export async function getProfileSummary(): Promise<ProfileSummary> {
  return Promise.resolve(mockProfileSummary);
}
