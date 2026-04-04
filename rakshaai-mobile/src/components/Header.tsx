import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Colors } from '@/theme/colors';

type NavigationProp = DrawerNavigationProp<any, any>;

export const Header: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      {/* Drawer Toggle */}
      <TouchableOpacity
        style={styles.drawerBtn}
        onPress={() => navigation.toggleDrawer()}
        accessibilityLabel="Open navigation drawer"
      >
        <MaterialCommunityIcons name="menu" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.rightSection}>
        {/* Notification Bell */}
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.textSecondary} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity style={styles.profileAvatar}>
          <MaterialCommunityIcons name="alpha-p" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.darkBase,
  },
  drawerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    position: 'relative',
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.darkBase,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.emergency, // Will use gradient Pink/Purple in UI mock
    alignItems: 'center',
    justifyContent: 'center',
  },
});
