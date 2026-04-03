import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Colors } from '@/theme/colors';
import { Header } from '@/components/Header';
import { DrawerParamList } from '@/navigation/DrawerNavigator';

type NavProp = DrawerNavigationProp<DrawerParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  return (
    <SafeAreaView style={styles.root}>
      <Header />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section & Sync Icon */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity style={styles.syncBtn}>
            <MaterialCommunityIcons name="sync" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Welcome back. Your safety systems are active.
        </Text>

        {/* 2x2 Stats Grid */}
        <View style={styles.grid}>
          {/* Card 1 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="navigation-variant-outline" size={24} color={Colors.success} />
              <MaterialCommunityIcons name="pulse" size={20} color={Colors.border} />
            </View>
            <Text style={styles.cardValue}>0</Text>
            <Text style={styles.cardLabel}>Active Journeys</Text>
            <Text style={styles.cardSub}>Start one</Text>
          </View>

          {/* Card 2 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="account-multiple-outline" size={24} color={Colors.danger} />
              <MaterialCommunityIcons name="pulse" size={20} color={Colors.border} />
            </View>
            <Text style={styles.cardValue}>3</Text>
            <Text style={styles.cardLabel}>Inner Circle</Text>
            <Text style={styles.cardSub}>contacts ready</Text>
          </View>

          {/* Card 3 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="alert-outline" size={24} color={Colors.warning} />
              <MaterialCommunityIcons name="pulse" size={20} color={Colors.border} />
            </View>
            <Text style={styles.cardValue}>0</Text>
            <Text style={styles.cardLabel}>Alerts Sent</Text>
            <Text style={styles.cardSub}>All safe</Text>
          </View>

          {/* Card 4 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="camera-outline" size={24} color={Colors.info} />
              <MaterialCommunityIcons name="pulse" size={20} color={Colors.border} />
            </View>
            <Text style={styles.cardValue}>0</Text>
            <Text style={styles.cardLabel}>Evidence Files</Text>
            <Text style={styles.cardSub}>No captures yet</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('SafeJourney')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: Colors.success }]}>
            <MaterialCommunityIcons name="navigation-variant-outline" size={24} color="#FFF" />
          </View>
          <View style={styles.actionBody}>
            <Text style={styles.actionTitle}>Start Safe Journey</Text>
            <Text style={styles.actionDesc}>Track your route in real-time</Text>
            <MaterialCommunityIcons name="arrow-top-right" size={14} color={Colors.textMuted} style={{ marginTop: 6 }} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('SOSTriggers')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: Colors.emergency }]}>
            <MaterialCommunityIcons name="alert-outline" size={24} color="#FFF" />
          </View>
          <View style={styles.actionBody}>
            <Text style={styles.actionTitle}>Configure SOS</Text>
            <Text style={styles.actionDesc}>Set up emergency triggers</Text>
            <MaterialCommunityIcons name="arrow-top-right" size={14} color={Colors.textMuted} style={{ marginTop: 6 }} />
          </View>
        </TouchableOpacity>

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
  
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 32, color: Colors.textPrimary },
  syncBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.textPrimary, alignItems: 'center', justifyContent: 'center' },
  
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  card: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardValue: { fontFamily: 'Rajdhani_700Bold', fontSize: 26, color: Colors.textPrimary },
  cardLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  cardSub: { fontFamily: 'Nunito_400Regular', fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  sectionTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: Colors.textPrimary, marginBottom: 16 },
  
  actionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 16,
  },
  actionIconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionBody: { flex: 1 },
  actionTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  actionDesc: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

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

export default HomeScreen;
