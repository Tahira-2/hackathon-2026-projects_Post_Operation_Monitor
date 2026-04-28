import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { getAppointmentReport, createReport } from '../../api/appointments-service';
import type { AppointmentReport } from '../../api/models';
import AppButton from '../../components/AppButton';
import { ProfileSkeleton } from '../../components/SkeletonLoader';
import { getErrorMessage } from '../../api/contracts';

export default function DoctorReportScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { appointmentId } = route.params;

  const [report, setReport] = useState<AppointmentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const data = await getAppointmentReport(appointmentId);
          if (!cancelled) {
            setReport(data);
            setDiagnosis(data.diagnosis);
            setNotes(data.notes);
            setSuggestions(data.suggestions);
            setPrescriptions(data.prescriptions);
          }
        } catch { /* likely 404 meaning no report exists yet */ }
        finally { if (!cancelled) setLoading(false); }
      })();
      return () => { cancelled = true; };
    }, [appointmentId])
  );

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setFileUri(result.assets[0].uri);
        setFileName(result.assets[0].name);
      }
    } catch (err) {
       Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const handleSave = async () => {
    if (!diagnosis.trim()) {
       Alert.alert('Validation Error', 'Diagnosis is required.');
       return;
    }
    
    setSaving(true);
    try {
      const data = await createReport(
        appointmentId, 
        { diagnosis, notes, suggestions, prescriptions },
        fileUri || undefined
      );
      setReport(data);
      Alert.alert('Success', 'Report saved successfully.', [
         { text: 'OK', onPress: () => nav.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-2 border-b border-gray-100">
        <TouchableOpacity onPress={() => nav.goBack()} className="rounded-xl bg-white p-2">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Medical Report</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {loading ? (
           <ProfileSkeleton />
        ) : (
           <>
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Diagnosis *</Text>
              <TextInput 
                 value={diagnosis}
                 onChangeText={setDiagnosis}
                 placeholder="Enter primary diagnosis..."
                 className="bg-white p-4 rounded-2xl mb-5 text-gray-900 border border-gray-100"
                 multiline
              />

              <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Doctor's Notes</Text>
              <TextInput 
                 value={notes}
                 onChangeText={setNotes}
                 placeholder="Clinical observations..."
                 className="bg-white p-4 rounded-2xl mb-5 text-gray-900 border border-gray-100 h-24"
                 multiline
                 textAlignVertical="top"
              />

              <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Suggestions / Lifestyle Changes</Text>
              <TextInput 
                 value={suggestions}
                 onChangeText={setSuggestions}
                 placeholder="Diet, exercise, rest..."
                 className="bg-white p-4 rounded-2xl mb-5 text-gray-900 border border-gray-100 h-24"
                 multiline
                 textAlignVertical="top"
              />

              <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Prescriptions</Text>
              <TextInput 
                 value={prescriptions}
                 onChangeText={setPrescriptions}
                 placeholder="Medicine name, dosage, duration..."
                 className="bg-white p-4 rounded-2xl mb-5 text-gray-900 border border-gray-100 h-24"
                 multiline
                 textAlignVertical="top"
              />

              <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Attachment (PDF/Image)</Text>
              <TouchableOpacity 
                 onPress={handlePickFile}
                 className="bg-white p-4 rounded-2xl mb-8 border border-dashed border-gray-300 flex-row items-center justify-center gap-2 h-20">
                 <Ionicons name="cloud-upload-outline" size={24} color="#6b7280" />
                 <Text className="text-gray-600 font-bold">
                    {fileName ? fileName : (report?.report_file ? 'Replace Existing Attachment' : 'Upload File')}
                 </Text>
              </TouchableOpacity>

              <AppButton 
                 label={saving ? "Saving..." : (report ? "Update Report" : "Save Report")} 
                 onPress={handleSave} 
                 disabled={saving} 
              />
              
              <View className="h-20" />
           </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
