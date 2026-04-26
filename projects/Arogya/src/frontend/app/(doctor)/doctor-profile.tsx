import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function DoctorProfileDetailScreen() {
  return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6F2F4' }]}>
              <MaterialIcons name="person" size={50} color="#2A7B88" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>Dr. Sarah Jenkins</Text>
              <Text style={styles.verifiedBadge}>✔ Verified</Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              Dr. Sarah Jenkins is a board-certified cardiologist with over 12 years of experience
              in cardiovascular medicine. She specializes in preventative cardiology and diagnostic
              imaging, committed to providing patient-centered care with the latest medical
              advancements.
            </Text>
          </View>

          {/* Specialties Section */}
          <View style={styles.specialtiesSection}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.specialtiesContainer}>
              <Text style={styles.specialtyBadge}>Heart Surgery</Text>
              <Text style={styles.specialtyBadge}>Valve Replacement</Text>
              <Text style={styles.specialtyBadge}>Cardiovascular Imaging</Text>
              <Text style={styles.specialtyBadge}>Angioplasty</Text>
            </View>
          </View>

          {/* Patient Reviews Section */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Patient Reviews</Text>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewAuthor}>Elena Rodriguez</Text>
              <Text style={styles.reviewDate}>2 days ago</Text>
              <Text style={styles.reviewText}>
                {"\""}Dr. Jenkins was extremely thorough and explained my treatment plan in a way that
                was easy to understand. Highly recommend!{"\""}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#2A7B88',
    fontWeight: '600',
    marginTop: 4,
  },
  aboutSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  specialtiesSection: {
    marginBottom: 24,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyBadge: {
    backgroundColor: '#E6F2F4',
    color: '#2A7B88',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewsSection: {
    marginBottom: 24,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});