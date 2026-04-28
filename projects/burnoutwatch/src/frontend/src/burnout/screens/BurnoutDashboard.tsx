import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Heart, LogOut } from 'lucide-react-native';

const { buildDashboardStatus } = require('../dashboardStatus');

interface BurnoutDashboardProps {
  onStartCheckIn: () => void;
  onLogout: () => void;
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

export function BurnoutDashboard({
  onStartCheckIn,
  onLogout,
  workerName = 'Magdalena',
  burnoutScoreResult,
  faceScanResult,
}: BurnoutDashboardProps) {
  const lastCheckIn = faceScanResult ? 'Just now' : 'Awaiting today';
  const [percentage, setPercentage] = useState(0);

  const status = buildDashboardStatus(burnoutScoreResult, faceScanResult);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 5;
      if (current >= status.percentage) {
        setPercentage(status.percentage);
        clearInterval(interval);
      } else {
        setPercentage(current);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [status.percentage]);

  return (
    <View style={styles.screen}>
      
      {/* Logout */}
      <TouchableOpacity onPress={onLogout} style={styles.logout}>
        <LogOut size={18} color="#9CA3AF" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hey {workerName}, let’s check in</Text>
        <Text style={styles.subtitle}>Here’s how you're doing</Text>
      </View>

      {/* Status Card */}
      <View style={styles.card}>
        
        {/* Status */}
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.currentStatus}
        </Text>

        <Text style={styles.percentage}>{percentage}%</Text>

        <Text style={styles.message}>{status.text}</Text>

        {/* Button */}
        <TouchableOpacity
          onPress={onStartCheckIn}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Check in with yourself</Text>
          <Heart size={18} color="#fff" />
        </TouchableOpacity>

        {/* Recommendation */}
        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationTitle}>
            What you should do:
          </Text>
          <Text style={styles.recommendationText}>
            {status.recommendation}
          </Text>
        </View>

        <Text style={styles.lastCheckIn}>
          Last check-in: {lastCheckIn}
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
    color: '#9CA3AF',
    fontSize: 12,
  },
  header: {
    marginTop: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: '#374151',
    fontWeight: '600',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 32,
    marginVertical: 10,
  },
  message: {
    textAlign: 'center',
    color: '#4B5563',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#6FAFB5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recommendationBox: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    marginBottom: 10,
  },
  recommendationTitle: {
    fontWeight: '600',
    marginBottom: 5,
  },
  recommendationText: {
    color: '#4B5563',
  },
  lastCheckIn: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
