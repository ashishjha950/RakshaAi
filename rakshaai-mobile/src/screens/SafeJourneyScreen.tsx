import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import { Header } from '@/components/Header';
import { OSM_TILE_URL, DEFAULT_MAP_REGION } from '@/utils/constants';
import { useSafety } from '@/context/SafetyContext';

const SafeJourneyScreen: React.FC = () => {
  const { currentLocation, isJourneyActive, startJourney, stopJourney } = useSafety();

  const mapRegion = currentLocation
    ? {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : DEFAULT_MAP_REGION;

  return (
    <SafeAreaView style={styles.root}>
      <Header />

      <View style={styles.mapContainer}>
        {/* Map */}
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
          showsUserLocation={false}
        >
          {/* Use light tiles */}
          <UrlTile urlTemplate={OSM_TILE_URL} maximumZ={19} />
          
          {currentLocation && (
            <Marker coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}>
              <View style={styles.myMarker}>
                <View style={styles.myMarkerInner} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Floating Search Bar */}
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={24} color={Colors.textSecondary} />
          <TextInput
            placeholder="Search destination"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <MaterialCommunityIcons name="tune" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Floating Voice Input Button */}
        <View style={styles.fabContainer}>
          <View style={styles.fabLabel}>
            <Text style={styles.fabLabelText}>Voice Input</Text>
          </View>
          <TouchableOpacity style={styles.fabBtn}>
            <MaterialCommunityIcons name="microphone" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet UI Mock */}
        <View style={styles.bottomSheet}>
          <View style={styles.pill} />
          <Text style={styles.sheetTitle}>{isJourneyActive ? 'Journey Active' : 'Start Safe Journey'}</Text>
          <Text style={styles.sheetSub}>
            {isJourneyActive 
              ? 'Monitoring your route for anomalies...' 
              : 'Your location will be shared with trusted contacts'}
          </Text>

          <View style={styles.sheetActionRow}>
            {isJourneyActive ? (
              <TouchableOpacity style={styles.dangerBtn} onPress={stopJourney}>
                <MaterialCommunityIcons name="stop-circle-outline" size={20} color="#FFF" />
                <Text style={styles.primaryBtnText}>End Journey</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.outlineBtn}>
                  <MaterialCommunityIcons name="share-variant-outline" size={20} color={Colors.textPrimary} />
                  <Text style={styles.outlineBtnText}>Share Tracker</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.primaryBtn} onPress={startJourney}>
                  <MaterialCommunityIcons name="navigation-variant" size={20} color="#FFF" />
                  <Text style={styles.primaryBtnText}>Start Journey</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.darkBase },
  mapContainer: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  
  myMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.info + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.info,
    borderWidth: 2,
    borderColor: '#FFF',
  },

  searchBox: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  searchInput: { flex: 1, marginLeft: 12, fontFamily: 'Nunito_400Regular', fontSize: 15, color: Colors.textPrimary },
  filterBtn: { padding: 6, backgroundColor: Colors.darkBase, borderRadius: 8 },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  pill: { width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.border, marginBottom: 20 },
  sheetTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 24, color: Colors.textPrimary, marginBottom: 4 },
  sheetSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.textSecondary, marginBottom: 24 },

  sheetActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 14,
  },
  outlineBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.emergency,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.emergencyLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: '#FFF' },

  fabContainer: {
    position: 'absolute',
    bottom: 210, // above the sheet
    right: 20,
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

export default SafeJourneyScreen;
