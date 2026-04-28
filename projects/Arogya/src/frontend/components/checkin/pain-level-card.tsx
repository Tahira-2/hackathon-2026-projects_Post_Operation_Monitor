import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import { CheckInSection } from '@/components/checkin/check-in-section';

type PainLevelCardProps = {
  value: number;
  onValueChange: (value: number) => void;
};

export function PainLevelCard({ value, onValueChange }: PainLevelCardProps) {
  return (
    <CheckInSection title="Pain Level">
      <View style={styles.headerRow}>
        <View />
        <Text style={styles.value}>{value}</Text>
      </View>

      <View style={styles.trackWrap}>
        <View style={styles.gradientTrack}>
          <View style={[styles.segment, styles.segmentGreen]} />
          <View style={[styles.segment, styles.segmentLime]} />
          <View style={[styles.segment, styles.segmentYellow]} />
          <View style={[styles.segment, styles.segmentOrange]} />
          <View style={[styles.segment, styles.segmentRed]} />
        </View>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#FFF7D6"
        />
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.label}>No Pain</Text>
        <Text style={styles.label}>Moderate</Text>
        <Text style={styles.label}>Severe</Text>
      </View>
    </CheckInSection>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 18,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B63B0',
  },
  trackWrap: {
    height: 32,
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  gradientTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 11,
    height: 10,
    borderRadius: 999,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  slider: {
    width: '100%',
    height: 32,
  },
  segment: {
    flex: 1,
    height: '100%',
  },
  segmentGreen: {
    backgroundColor: '#59D68B',
  },
  segmentLime: {
    backgroundColor: '#9DDA67',
  },
  segmentYellow: {
    backgroundColor: '#F7D54A',
  },
  segmentOrange: {
    backgroundColor: '#F79A4B',
  },
  segmentRed: {
    backgroundColor: '#F56C6C',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    color: '#111827',
  },
});
