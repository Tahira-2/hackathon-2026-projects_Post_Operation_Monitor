import type { RiskResultSummary } from '@/types/app-data';

const mockRiskResultSummary: RiskResultSummary = {
  title: 'Warning',
  severityLabel: 'Warning',
  message:
    'Your symptoms suggest a slight decline. We recommend contacting your doctor.',
  metrics: [
    {
      id: 'blood-pressure',
      title: 'Blood Pressure',
      icon: 'monitor-heart',
      iconColor: '#F59E0B',
      value: '142/95',
      unit: 'MMHG',
      badgeLabel: 'Elevated',
      badgeColor: '#F59E0B',
      badgeBackground: '#FFF1D8',
    },
    {
      id: 'fatigue',
      title: 'Fatigue',
      icon: 'bolt',
      iconColor: '#0B63B0',
      value: 'High',
      badgeLabel: 'Reported',
      badgeColor: '#4B5563',
      badgeBackground: '#EFF1F4',
    },
  ],
  physicianInsightTitle: "Physician's Insight",
  physicianInsightMessage:
    'Recent values are 12% higher than your 7-day average. This often occurs when hydration levels are low or stress is elevated.',
  primaryActionLabel: 'Chat with Doctor',
  secondaryActionLabel: 'View Emergency Info',
  supportMessage:
    '"Take a deep breath. We\'ve notified your primary caregiver, Dr. Aris, of these results. They will review your dashboard shortly."',
};

export async function getRiskResultSummary(): Promise<RiskResultSummary> {
  return Promise.resolve(mockRiskResultSummary);
}
