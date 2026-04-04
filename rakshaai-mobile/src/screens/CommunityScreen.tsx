import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import { Header } from '@/components/Header';

const FILTERS = ['All Stories', 'Harassment', 'Stalking', 'Assault', 'Eve-Teasing', 'Online Abuse', 'Workplace Issue', 'Safe Experience ✅', 'Other'];

const CommunityScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.root}>
      <Header />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>
          A safe space to share your story, support others, and heal together.
        </Text>

        {/* Primary Action */}
        <TouchableOpacity style={styles.shareBtn}>
          <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#FFF" />
          <Text style={styles.shareBtnText}>Share Your Story</Text>
        </TouchableOpacity>

        {/* Filter Pills */}
        <View style={styles.pillsContainer}>
          {FILTERS.map((f, idx) => {
            const isActive = idx === 0;
            return (
              <TouchableOpacity key={f} style={[styles.pill, isActive && styles.pillActive]}>
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Stat Cards */}
        <View style={styles.cardContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Stories Shared</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.statValue}>0</Text>
              <MaterialCommunityIcons name="heart" size={22} color={Colors.textPrimary} style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.statLabel}>Total Support</Text>
          </View>

          {/* Mock SOS Events Feed */}
          <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 8 }]}>Recent Events Near You</Text>
          
          <View style={styles.eventCard}>
            <View style={[styles.eventIcon, { backgroundColor: Colors.danger + '22' }]}>
              <MaterialCommunityIcons name="alert" size={24} color={Colors.danger} />
            </View>
            <View style={styles.eventBody}>
              <Text style={styles.eventTitle}>SOS Alert Flagged</Text>
              <Text style={styles.eventMeta}>2 mins ago • Connaught Place (1.2km away)</Text>
            </View>
          </View>

          <View style={styles.eventCard}>
            <View style={[styles.eventIcon, { backgroundColor: Colors.warning + '22' }]}>
              <MaterialCommunityIcons name="shield-alert" size={24} color={Colors.warning} />
            </View>
            <View style={styles.eventBody}>
              <Text style={styles.eventTitle}>Safety Concern Reported</Text>
              <Text style={styles.eventMeta}>15 mins ago • Hauz Khas Village (4.5km away)</Text>
            </View>
          </View>

          <View style={styles.eventCard}>
            <View style={[styles.eventIcon, { backgroundColor: Colors.success + '22' }]}>
              <MaterialCommunityIcons name="check-circle" size={24} color={Colors.success} />
            </View>
            <View style={styles.eventBody}>
              <Text style={styles.eventTitle}>Verified Safe Route</Text>
              <Text style={styles.eventMeta}>1 hour ago • Shared by local community</Text>
            </View>
          </View>
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
  
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.emergency,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  shareBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: '#FFF' },
  
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
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

  cardContainer: { gap: 16 },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontFamily: 'Rajdhani_700Bold', fontSize: 28, color: Colors.textPrimary },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  sectionTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: Colors.textPrimary },
  
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  eventBody: { flex: 1, marginLeft: 16 },
  eventTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  eventMeta: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

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

export default CommunityScreen;
