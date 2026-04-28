import { AlertTriangle, LogOut, Users } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SupervisorDashboardProps {
  onLogout: () => void;
  supervisorName?: string;
  workerName?: string;
  burnoutScoreResult?: {
    burnout_score?: number;
    risk_tier?: string;
  } | null;
  faceScanResult?: {
    facial_fatigue?: {
      risk_tier?: string;
    };
  } | null;
}

export function SupervisorDashboard({
  onLogout,
  supervisorName = 'Dipan',
  workerName = 'Magdalena',
  burnoutScoreResult,
  faceScanResult,
}: SupervisorDashboardProps) {
  const score = Math.round(burnoutScoreResult?.burnout_score ?? 0);
  const riskTier = burnoutScoreResult?.risk_tier ?? 'pending';
  const hasCheckIn = Boolean(burnoutScoreResult);
  const isHighRisk = riskTier === 'high';
  const faceTier = faceScanResult?.facial_fatigue?.risk_tier;

  return (
    <View style={styles.screen}>
      <TouchableOpacity onPress={onLogout} style={styles.logout}>
        <LogOut size={18} color="#6B7280" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Users size={34} color="#6FAFB5" />
        <Text style={styles.title}>Hi {supervisorName}</Text>
        <Text style={styles.subtitle}>Team burnout alerts</Text>
      </View>

      {isHighRisk ? (
        <View style={styles.alertCard}>
          <AlertTriangle size={22} color="#C2410C" />
          <View style={styles.alertTextBlock}>
            <Text style={styles.alertTitle}>High burnout risk detected</Text>
            <Text style={styles.alertCopy}>
              {workerName} was flagged after the latest check-in and facial analysis.
            </Text>
          </View>
        </View>
      ) : null}

      <View style={[styles.row, isHighRisk && styles.highRiskRow]}>
        <View>
          <Text style={styles.worker}>{workerName}</Text>
          <Text style={styles.detail}>
            {hasCheckIn
              ? `Latest score: ${score}/100${faceTier ? ` - Face scan: ${faceTier}` : ''}`
              : 'No check-in submitted yet'}
          </Text>
          <Text style={styles.time}>{hasCheckIn ? 'Updated just now' : "Awaiting today's check-in"}</Text>
        </View>
        <Text style={[styles.badge, isHighRisk && styles.highBadge]}>
          {hasCheckIn ? riskTier.toUpperCase() : 'PENDING'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  logout: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  logoutText: {
    color: '#6B7280',
    fontSize: 12,
  },
  header: {
    marginTop: 90,
    marginBottom: 28,
    gap: 8,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
  },
  row: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  highRiskRow: {
    borderWidth: 1,
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  alertCard: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    gap: 10,
  },
  alertTextBlock: {
    flex: 1,
  },
  alertTitle: {
    color: '#9A3412',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertCopy: {
    color: '#7C2D12',
    fontSize: 13,
    lineHeight: 18,
  },
  worker: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  detail: {
    color: '#4B5563',
    fontSize: 13,
    marginTop: 4,
  },
  time: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    color: '#1F2937',
    backgroundColor: '#D7EEF1',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  highBadge: {
    backgroundColor: '#FED7AA',
    color: '#9A3412',
    fontWeight: '700',
  },
  lowBadge: {
    backgroundColor: '#BBF7D0',
  },
});
