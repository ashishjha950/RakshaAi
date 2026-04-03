/**
 * InnerCircleScreen.tsx — Trusted contacts management.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { api } from '@/services/api';
import { Colors } from '@/theme/colors';

const STORAGE_KEY = 'raksha_inner_circle';
export type TrustLevel = 'high' | 'medium' | 'low';
export interface Contact { id: string; name: string; phone: string; relation: string; trustLevel: TrustLevel; shareLocation: boolean; }

const TRUST_COLORS: Record<TrustLevel, string> = { high: Colors.success, medium: Colors.sahayak, low: Colors.danger };
const TRUST_LABELS: Record<TrustLevel, string> = { high: 'Trusted', medium: 'Close', low: 'Watchful' };
const BLANK: Omit<Contact, 'id'> = { name: '', phone: '', relation: '', trustLevel: 'high', shareLocation: true };

const InnerCircleScreen: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<Omit<Contact, 'id'>>(BLANK);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => { if (raw) setContacts(JSON.parse(raw)); });
  }, []);

  const persist = useCallback(async (updated: Contact[]) => {
    setContacts(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const openAdd = useCallback(() => { setEditingContact(null); setForm(BLANK); setModalVisible(true); }, []);
  const openEdit = useCallback((c: Contact) => { setEditingContact(c); setForm({ name: c.name, phone: c.phone, relation: c.relation, trustLevel: c.trustLevel, shareLocation: c.shareLocation }); setModalVisible(true); }, []);

  const saveContact = useCallback(async () => {
    if (!form.name.trim() || !form.phone.trim()) { Alert.alert('Required', 'Name and phone are required.'); return; }
    const updated = editingContact
      ? contacts.map((c) => c.id === editingContact.id ? { ...editingContact, ...form } : c)
      : [...contacts, { id: Date.now().toString(), ...form }];
    await persist(updated);
    setModalVisible(false);
  }, [form, editingContact, contacts, persist]);

  const deleteContact = useCallback((id: string) => {
    Alert.alert('Remove Contact', 'Remove from Inner Circle?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => persist(contacts.filter((c) => c.id !== id)) },
    ]);
  }, [contacts, persist]);

  const testSOS = useCallback(async (contact: Contact) => {
    try {
      await api.post('/contacts/sos-test', { contactPhone: contact.phone, contactName: contact.name });
      Alert.alert('Test SOS Sent', `Alert sent to ${contact.name}.`);
    } catch { Alert.alert('Failed', 'Could not send test alert.'); }
  }, []);

  const toggleLocationShare = useCallback(async (contact: Contact) => {
    const updated = contacts.map((c) => c.id === contact.id ? { ...c, shareLocation: !c.shareLocation } : c);
    await persist(updated);
  }, [contacts, persist]);

  const renderRightActions = useCallback((contact: Contact) => (
    <TouchableOpacity style={styles.swipeDelete} onPress={() => deleteContact(contact.id)} accessibilityLabel={`Delete ${contact.name}`}>
      <MaterialCommunityIcons name="trash-can-outline" size={24} color={Colors.textPrimary} />
      <Text style={styles.swipeDeleteText}>Remove</Text>
    </TouchableOpacity>
  ), [deleteContact]);

  const renderContact = ({ item }: { item: Contact }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)} friction={2} rightThreshold={60}>
      <TouchableOpacity style={styles.card} onPress={() => openEdit(item)} activeOpacity={0.8} accessibilityLabel={`Edit ${item.name}`}>
        <View style={[styles.trustBar, { backgroundColor: TRUST_COLORS[item.trustLevel] }]} />
        <View style={[styles.avatar, { backgroundColor: TRUST_COLORS[item.trustLevel] + '22' }]}>
          <Text style={[styles.avatarLetter, { color: TRUST_COLORS[item.trustLevel] }]}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactRelation}>{item.relation} · {item.phone}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.trustBadge, { backgroundColor: TRUST_COLORS[item.trustLevel] + '22' }]}>
              <Text style={[styles.trustBadgeText, { color: TRUST_COLORS[item.trustLevel] }]}>{TRUST_LABELS[item.trustLevel]}</Text>
            </View>
            {item.shareLocation && (
              <View style={styles.locBadge}>
                <MaterialCommunityIcons name="map-marker-check" size={12} color={Colors.info} />
                <Text style={styles.locBadgeText}>Location shared</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => testSOS(item)} accessibilityLabel={`Test SOS for ${item.name}`}>
            <MaterialCommunityIcons name="alert-circle-outline" size={18} color={Colors.emergency} />
          </TouchableOpacity>
          <Switch value={item.shareLocation} onValueChange={() => toggleLocationShare(item)} trackColor={{ false: Colors.surface2, true: Colors.info + '88' }} thumbColor={item.shareLocation ? Colors.info : Colors.textMuted} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} accessibilityLabel={`Toggle location for ${item.name}`} />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const TRUST_LEVELS: TrustLevel[] = ['high', 'medium', 'low'];

  return (
    <SafeAreaView style={styles.root} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inner Circle</Text>
          <Text style={styles.subtitle}>{contacts.length} trusted contact{contacts.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} accessibilityLabel="Add contact" accessibilityRole="button">
          <MaterialCommunityIcons name="plus" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="heart-circle-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No contacts yet</Text>
            <Text style={styles.emptySub}>Add people who receive your SOS alerts</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingContact ? 'Edit Contact' : 'Add Contact'}</Text>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={Colors.textMuted} value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} accessibilityLabel="Contact name" />
            <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={Colors.textMuted} value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} keyboardType="phone-pad" accessibilityLabel="Phone number" />
            <TextInput style={styles.input} placeholder="Relation (Mom, Friend…)" placeholderTextColor={Colors.textMuted} value={form.relation} onChangeText={(v) => setForm((f) => ({ ...f, relation: v }))} accessibilityLabel="Relation" />
            <Text style={styles.fieldLabel}>Trust Level</Text>
            <View style={styles.trustRow}>
              {TRUST_LEVELS.map((t) => (
                <TouchableOpacity key={t} style={[styles.trustBtn, form.trustLevel === t && { backgroundColor: TRUST_COLORS[t] + '33', borderColor: TRUST_COLORS[t] }]} onPress={() => setForm((f) => ({ ...f, trustLevel: t }))} accessibilityLabel={`Trust level ${TRUST_LABELS[t]}`}>
                  <Text style={[styles.trustBtnText, { color: form.trustLevel === t ? TRUST_COLORS[t] : Colors.textMuted }]}>{TRUST_LABELS[t]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>Share Live Location</Text>
              <Switch value={form.shareLocation} onValueChange={(v) => setForm((f) => ({ ...f, shareLocation: v }))} trackColor={{ false: Colors.surface2, true: Colors.info + '88' }} thumbColor={form.shareLocation ? Colors.info : Colors.textMuted} accessibilityLabel="Share location" />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} accessibilityLabel="Cancel"><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveContact} accessibilityLabel="Save contact"><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.darkBase },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 72, paddingBottom: 16 },
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 26, color: Colors.textPrimary },
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.textSecondary },
  addBtn: { backgroundColor: Colors.emergency, borderRadius: 14, padding: 10 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  trustBar: { width: 4, alignSelf: 'stretch' },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', margin: 12 },
  avatarLetter: { fontFamily: 'Rajdhani_700Bold', fontSize: 22 },
  cardBody: { flex: 1, paddingVertical: 12, gap: 4 },
  contactName: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  contactRelation: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: Colors.textSecondary },
  badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 },
  trustBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  trustBadgeText: { fontFamily: 'Nunito_600SemiBold', fontSize: 11 },
  locBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locBadgeText: { fontFamily: 'Nunito_400Regular', fontSize: 11, color: Colors.info },
  cardActions: { paddingRight: 12, alignItems: 'center', gap: 10 },
  actionBtn: { backgroundColor: Colors.emergency + '22', borderRadius: 10, padding: 8 },
  swipeDelete: { backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginBottom: 10, borderRadius: 14, gap: 4 },
  swipeDeleteText: { fontFamily: 'Nunito_400Regular', fontSize: 11, color: Colors.textPrimary },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, color: Colors.textSecondary },
  emptySub: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, gap: 14, borderWidth: 1, borderColor: Colors.border },
  modalTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, color: Colors.textPrimary, marginBottom: 4 },
  input: { backgroundColor: Colors.surface2, borderRadius: 12, padding: 14, fontFamily: 'Nunito_400Regular', fontSize: 15, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  fieldLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: Colors.textSecondary },
  trustRow: { flexDirection: 'row', gap: 10 },
  trustBtn: { flex: 1, backgroundColor: Colors.surface2, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  trustBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: Colors.surface2, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, fontSize: 15 },
  saveBtn: { flex: 1, backgroundColor: Colors.emergency, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: 'Nunito_600SemiBold', color: Colors.textPrimary, fontSize: 15 },
});

export default InnerCircleScreen;
