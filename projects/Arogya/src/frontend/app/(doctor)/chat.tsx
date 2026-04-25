import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const BLUE = '#2A7B88';
const LIGHT_BLUE = '#E6F2F4';
const GREEN = '#4CAF50';
const LIGHT_GREEN = '#E8F5E9';
const BG = '#F8F9FB';
const GRAY = '#7A8CA3';
const BORDER = '#E5E7EB';

export default function ChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/find-doctors')} style={{ padding: 8 }}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/44.jpg' }} style={styles.headerAvatar} />
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Dr. Julian Vance</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionIcon}>
            <MaterialIcons name="videocam" size={24} color={BLUE} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <MaterialIcons name="call" size={24} color={BLUE} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Date Separator */}
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>TODAY</Text>
          </View>

          {/* Patient Message 1 */}
          <View style={styles.messageRight}>
            <View style={styles.bubbleRight}>
              <Text style={styles.textRight}>Hello Dr. Vance, I{"'"}ve been feeling a bit of recurring pain in my lower back since the exercises we discussed on Tuesday.</Text>
            </View>
            <Text style={styles.timeRight}>09:12 AM</Text>
          </View>

          {/* Doctor Message 1 */}
          <View style={styles.messageLeft}>
            <View style={styles.bubbleLeft}>
              <Text style={styles.textLeft}>Hello! I{"'"}m sorry to hear that. Could you pinpoint exactly where the pain is? Is it more sharp or a dull ache?</Text>
            </View>
            <Text style={styles.timeLeft}>09:15 AM</Text>
          </View>

          {/* Patient Message 2 with Image */}
          <View style={styles.messageRight}>
            <View style={[styles.bubbleRight, { padding: 0, overflow: 'hidden' }]}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1608265386093-9b240ca8c322?w=500&q=80' }} 
                style={styles.attachedImage} 
              />
              <Text style={[styles.textRight, { padding: 16 }]}>It{"'"}s right around this area marked here. It feels more like a dull ache that intensifies when I sit for too long.</Text>
            </View>
            <View style={styles.timeWithStatus}>
              <MaterialIcons name="done-all" size={16} color={BLUE} style={{ marginRight: 4 }} />
              <Text style={styles.timeRight}>09:18 AM</Text>
            </View>
          </View>

          {/* Doctor Message 2 */}
          <View style={styles.messageLeft}>
            <View style={styles.bubbleLeft}>
              <Text style={styles.textLeft}>Understood. That sounds like it might be postural stress. I{"'"}ve uploaded a modified stretch routine for you to try this morning. Can you review this?</Text>
            </View>
            <Text style={styles.timeLeft}>09:20 AM</Text>
          </View>

          {/* Doctor Message 3 - PDF Attachment */}
          <View style={styles.messageLeft}>
            <View style={styles.pdfAttachment}>
              <View style={styles.pdfIconBg}>
                <MaterialIcons name="picture-as-pdf" size={24} color="#004080" />
              </View>
              <View style={styles.pdfInfo}>
                <Text style={styles.pdfName}>lumbar_relief_v2.pdf</Text>
                <Text style={styles.pdfSize}>1.2 MB • PDF Document</Text>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="file-download" size={24} color="#004080" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {/* Quick Replies */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickReplies}>
            <TouchableOpacity style={[styles.quickReplyChip, { backgroundColor: LIGHT_GREEN }]}>
              <Text style={[styles.quickReplyText, { color: '#1B5E20' }]}>Thank you</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickReplyChip, { backgroundColor: LIGHT_BLUE }]}>
              <Text style={[styles.quickReplyText, { color: BLUE }]}>Yes, I can</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickReplyChip}>
              <Text style={styles.quickReplyText}>No, not yet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickReplyChip}>
              <Text style={styles.quickReplyText}>Schedule call</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.plusBtn}>
              <MaterialIcons name="add" size={24} color={BLUE} />
            </TouchableOpacity>
            
            <View style={styles.textInputWrapper}>
              <TextInput 
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={GRAY}
                value={message}
                onChangeText={setMessage}
              />
              <TouchableOpacity style={styles.emojiBtn}>
                <MaterialIcons name="emoji-emotions" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.sendBtn}>
              <MaterialIcons name="send" size={20} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 8, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: BORDER
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 8 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  headerStatus: { fontSize: 12, color: GREEN, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { padding: 8, marginLeft: 8 },
  
  scrollContent: { padding: 16, paddingBottom: 20, backgroundColor: BG },
  
  dateSeparator: { alignSelf: 'center', backgroundColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, marginVertical: 16 },
  dateText: { fontSize: 10, fontWeight: 'bold', color: '#555', letterSpacing: 1 },
  
  messageRight: { alignSelf: 'flex-end', maxWidth: '80%', marginBottom: 16 },
  bubbleRight: { backgroundColor: '#fff', borderRadius: 20, borderTopRightRadius: 4, padding: 16, borderWidth: 1, borderColor: BORDER },
  textRight: { fontSize: 15, color: '#111', lineHeight: 22 },
  timeRight: { fontSize: 11, color: GRAY, textAlign: 'right', marginTop: 4 },
  timeWithStatus: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  
  messageLeft: { alignSelf: 'flex-start', maxWidth: '80%', marginBottom: 16 },
  bubbleLeft: { backgroundColor: BLUE, borderRadius: 20, borderTopLeftRadius: 4, padding: 16 },
  textLeft: { fontSize: 15, color: '#fff', lineHeight: 22 },
  timeLeft: { fontSize: 11, color: GRAY, marginTop: 4 },
  
  attachedImage: { width: '100%', height: 180, borderTopLeftRadius: 18, borderTopRightRadius: 4 },
  
  pdfAttachment: { backgroundColor: '#3399FF', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', width: 280 },
  pdfIconBg: { backgroundColor: '#fff', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pdfInfo: { flex: 1, marginLeft: 12 },
  pdfName: { fontSize: 14, fontWeight: 'bold', color: '#004080', marginBottom: 2 },
  pdfSize: { fontSize: 11, color: '#004080' },
  
  inputContainer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: BORDER, paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  quickReplies: { paddingHorizontal: 16, paddingVertical: 12 },
  quickReplyChip: { backgroundColor: '#F0F2F5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  quickReplyText: { fontSize: 13, fontWeight: '600', color: '#555' },
  
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 },
  plusBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F2F5', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  textInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 },
  textInput: { flex: 1, height: 40, fontSize: 15, color: '#111' },
  emojiBtn: { padding: 4 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
