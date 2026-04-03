import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import { Header } from '@/components/Header';

const FILTERS = ['All Evidence', 'Audio', 'Video', 'Photos', 'Logs'];

const EvidenceScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.root}>
      <Header />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <Text style={styles.title}>Evidence Capture</Text>
        <Text style={styles.subtitle}>
          Securely document incidents with encrypted storage.
        </Text>

        {/* Filter Pills */}
        <View style={styles.pillsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {FILTERS.map((f, idx) => {
              const isActive = idx === 0;
              return (
                <TouchableOpacity key={f} style={[styles.pill, isActive && styles.pillActive]}>
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{f}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Upload Dropzone */}
        <View style={styles.dropzone}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="cloud-upload-outline" size={28} color={Colors.textPrimary} />
          </View>
          <Text style={styles.dropzoneTitle}>Tap or drag to upload evidence</Text>
          <Text style={styles.dropzoneSub}>Supports images, video, and audio recordings</Text>
        </View>

        {/* Capture Action */}
        <TouchableOpacity style={styles.captureBtn}>
          <MaterialCommunityIcons name="line-scan" size={20} color="#FFF" />
          <Text style={styles.captureBtnText}>Capture New Evidence</Text>
        </TouchableOpacity>

        {/* Recent Files */}
        <Text style={styles.sectionTitle}>Recent Files</Text>
        
        <View style={styles.fileCard}>
          <View style={[styles.fileIcon, { backgroundColor: Colors.info + '1A' }]}>
            <MaterialCommunityIcons name="voicemail" size={24} color={Colors.info} />
          </View>
          <View style={styles.fileBody}>
            <Text style={styles.fileName}>incident-audio.m4a</Text>
            <Text style={styles.fileMeta}>Recorded 2h ago</Text>
          </View>
          <TouchableOpacity>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.fileCard}>
          <View style={[styles.fileIcon, { backgroundColor: Colors.success + '1A' }]}>
            <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.success} />
          </View>
          <View style={styles.fileBody}>
            <Text style={styles.fileName}>location-log.csv</Text>
            <Text style={styles.fileMeta}>Recorded 5h ago</Text>
          </View>
          <TouchableOpacity>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Floating Voice Input Button */}
      <View style={styles.fabContainer}>
        <View style={styles.fabLabel}>
          <Text style={styles.fabLabelText}>Voice Input</Text>
        </View>
        <TouchableOpacity style={styles.fabBtn}>
          <MaterialCommunityIcons name="microphone" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.darkBase },
  content: { padding: 20, paddingBottom: 100 },
  
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 32, color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  
  pillsContainer: { marginBottom: 24, marginHorizontal: -20, paddingHorizontal: 20 },
  pill: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
  pillText: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: Colors.textSecondary },
  pillTextActive: { color: Colors.surface },

  dropzone: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.darkBase,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dropzoneTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: Colors.textPrimary, marginBottom: 4 },
  dropzoneSub: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },

  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.emergency,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 32,
    shadowColor: Colors.emergencyLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  captureBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: '#FFF' },

  sectionTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: Colors.textPrimary, marginBottom: 16 },

  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fileBody: { flex: 1, marginLeft: 16 },
  fileName: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  fileMeta: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
    gap: 8,
  },
  fabLabel: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fabLabelText: { fontFamily: 'Nunito_600SemiBold', fontSize: 11, color: '#FFF' },
  fabBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.emergencyLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default EvidenceScreen;
