import { Activity, CalendarDays, MapPinned, Users } from 'lucide-react';

export const navigationItems = [
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'programs', label: 'Programs', icon: CalendarDays },
  { id: 'citizens', label: 'Citizens', icon: Users },
  { id: 'map', label: 'Map', icon: MapPinned },
];

export const initialPrograms = [
  {
    name: 'Booster Drive - Ward 12',
    date: '28 Apr 2026',
    location: 'Community Health Center, Ward 12',
    targetGroup: 'Children 6 months - 5 years',
    status: 'Scheduled',
  },
  {
    name: 'School Vaccination Week',
    date: '03 May 2026',
    location: 'Shivam Public School Campus',
    targetGroup: 'School-age children',
    status: 'Planned',
  },
];

export const analyticsCards = [
  {
    label: 'Total Citizens',
    value: '1,284',
    description: 'Registered children in your service area',
    tone: 'from-blue-500/20 to-cyan-500/10',
    accent: 'text-blue-200',
  },
  {
    label: 'Upcoming Programs',
    value: '14',
    description: 'Scheduled vaccination drives and camps',
    tone: 'from-emerald-500/20 to-teal-500/10',
    accent: 'text-emerald-200',
  },
  {
    label: 'Coverage Rate',
    value: '91%',
    description: 'Average completion across active wards',
    tone: 'from-violet-500/20 to-indigo-500/10',
    accent: 'text-violet-200',
  },
  {
    label: 'Pending Follow-ups',
    value: '38',
    description: 'Children needing reminders or rescheduling',
    tone: 'from-amber-500/20 to-orange-500/10',
    accent: 'text-amber-200',
  },
];