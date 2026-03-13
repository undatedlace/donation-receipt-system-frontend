import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';

const G = '#1B6B3A';
const GOLD = '#C8963E';

const ROLES = ['admin', 'user', 'internal-admin'];
const ROLE_COLOR: Record<string, string> = {
  admin: '#C62828',
  user: '#1B6B3A',
  'internal-admin': '#6A1B9A',
};

interface UserItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

const emptyAdd = { firstName: '', lastName: '', email: '', password: '', roles: [] as string[] };

function RoleSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (roles: string[]) => void;
}) {
  const toggle = (r: string) =>
    onChange(selected.includes(r) ? selected.filter(x => x !== r) : [...selected, r]);
  return (
    <View style={s.rolesRow}>
      {ROLES.map(r => (
        <TouchableOpacity
          key={r}
          style={[s.roleChip, selected.includes(r) && { backgroundColor: ROLE_COLOR[r] || G, borderColor: ROLE_COLOR[r] || G }]}
          onPress={() => toggle(r)}>
          <Text style={[s.roleChipText, selected.includes(r) && { color: '#fff' }]}>{r}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function UsersScreen() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Add modal ────────────────────────────────
  const [addVisible, setAddVisible] = useState(false);
  const [addForm, setAddForm] = useState({ ...emptyAdd });
  const [addLoading, setAddLoading] = useState(false);

  // ── Edit modal ───────────────────────────────
  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(Array.isArray(data) ? data : data.data ?? []);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? (e?.message ? `Network: ${e.message}` : 'Failed to load users'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchUsers(); }, []));

  // ── Add ────────────────────────────────────────
  const handleAdd = async () => {
    const { firstName, lastName, email, password, roles } = addForm;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      return Alert.alert('Validation', 'All fields are required.');
    }
    if (roles.length === 0) {
      return Alert.alert('Validation', 'Select at least one role.');
    }
    setAddLoading(true);
    try {
      await createUser({ firstName, lastName, email, password, roles });
      setAddVisible(false);
      setAddForm({ ...emptyAdd });
      fetchUsers();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  // ── Edit ───────────────────────────────────────
  const openEdit = (u: UserItem) => {
    setEditTarget(u);
    setEditFirst(u.firstName);
    setEditLast(u.lastName);
    setEditRoles([...u.roles]);
    setEditVisible(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (editRoles.length === 0) return Alert.alert('Validation', 'Select at least one role.');
    setEditLoading(true);
    try {
      await updateUser(editTarget._id, {
        firstName: editFirst.trim(),
        lastName: editLast.trim(),
        roles: editRoles,
      });
      setEditVisible(false);
      fetchUsers();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────
  const handleDelete = (u: UserItem) => {
    Alert.alert(
      'Delete User',
      `Delete ${u.firstName} ${u.lastName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(u._id);
              setUsers(prev => prev.filter(x => x._id !== u._id));
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'Failed to delete user');
            }
          },
        },
      ],
    );
  };

  // ── Render user card ───────────────────────────
  const renderUser = ({ item }: { item: UserItem }) => (
    <View style={s.card}>
      <View style={s.avatarWrap}>
        <Text style={s.avatarText}>{(item.firstName?.[0] ?? '?').toUpperCase()}</Text>
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName}>{item.firstName} {item.lastName}</Text>
        <Text style={s.cardEmail}>{item.email}</Text>
        <View style={s.badgesRow}>
          {(item.roles ?? []).map(r => (
            <View key={r} style={[s.badge, { backgroundColor: ROLE_COLOR[r] ?? '#888' }]}>
              <Text style={s.badgeText}>{r}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(item)}>
          <Text style={s.iconBtnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.iconBtn, s.iconBtnRed]} onPress={() => handleDelete(item)}>
          <Text style={s.iconBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      {/* Page header */}
      <View style={s.pageHeader}>
        <Text style={s.pageHeaderArabic}>إِدَارَةُ الْمُسْتَخْدِمِينَ</Text>
        <Text style={s.pageHeaderTitle}>User Management</Text>
      </View>

      {/* Toolbar */}
      <View style={s.toolbar}>
        <Text style={s.toolbarCount}>{users.length} user{users.length !== 1 ? 's' : ''}</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setAddVisible(true)}>
          <Text style={s.addBtnText}>＋  Add User</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={G} /></View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={u => u._id}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 14 }}
          ListEmptyComponent={<Text style={s.empty}>No users found</Text>}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchUsers(); }}
        />
      )}

      {/* ─── Add User Modal ─────────────────────── */}
      <Modal visible={addVisible} transparent animationType="slide" onRequestClose={() => setAddVisible(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setAddVisible(false)}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={s.sheetTitle}>Add New User</Text>

              <Text style={s.fieldLabel}>First Name *</Text>
              <TextInput
                style={s.fieldInput}
                value={addForm.firstName}
                onChangeText={v => setAddForm(f => ({ ...f, firstName: v }))}
                placeholder="First name"
                placeholderTextColor="#AAA"
              />

              <Text style={s.fieldLabel}>Last Name *</Text>
              <TextInput
                style={s.fieldInput}
                value={addForm.lastName}
                onChangeText={v => setAddForm(f => ({ ...f, lastName: v }))}
                placeholder="Last name"
                placeholderTextColor="#AAA"
              />

              <Text style={s.fieldLabel}>Email *</Text>
              <TextInput
                style={s.fieldInput}
                value={addForm.email}
                onChangeText={v => setAddForm(f => ({ ...f, email: v }))}
                placeholder="user@example.com"
                placeholderTextColor="#AAA"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={s.fieldLabel}>Password *</Text>
              <TextInput
                style={s.fieldInput}
                value={addForm.password}
                onChangeText={v => setAddForm(f => ({ ...f, password: v }))}
                placeholder="Password"
                placeholderTextColor="#AAA"
                secureTextEntry
              />

              <Text style={s.fieldLabel}>Roles * (tap to select)</Text>
              <RoleSelector
                selected={addForm.roles}
                onChange={roles => setAddForm(f => ({ ...f, roles }))}
              />

              <TouchableOpacity style={s.submitBtn} onPress={handleAdd} disabled={addLoading}>
                {addLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Create User</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.outlineBtn} onPress={() => { setAddVisible(false); setAddForm({ ...emptyAdd }); }}>
                <Text style={s.outlineBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 48 }} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ─── Edit User Modal ─────────────────────── */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setEditVisible(false)}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={s.sheetTitle}>Edit User</Text>

              <Text style={s.fieldLabel}>First Name</Text>
              <TextInput
                style={s.fieldInput}
                value={editFirst}
                onChangeText={setEditFirst}
                placeholder="First name"
                placeholderTextColor="#AAA"
              />

              <Text style={s.fieldLabel}>Last Name</Text>
              <TextInput
                style={s.fieldInput}
                value={editLast}
                onChangeText={setEditLast}
                placeholder="Last name"
                placeholderTextColor="#AAA"
              />

              <Text style={s.fieldLabel}>Roles (tap to toggle)</Text>
              <RoleSelector selected={editRoles} onChange={setEditRoles} />

              <TouchableOpacity style={s.submitBtn} onPress={handleEdit} disabled={editLoading}>
                {editLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Save Changes</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.outlineBtn} onPress={() => setEditVisible(false)}>
                <Text style={s.outlineBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 48 }} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7F4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  pageHeader: { backgroundColor: G, paddingTop: 16, paddingBottom: 20, alignItems: 'center' },
  pageHeaderArabic: { color: GOLD, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  pageHeaderTitle: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 0.4 },

  toolbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E4F0EA',
  },
  toolbarCount: { color: '#888', fontSize: 13 },
  addBtn: { backgroundColor: G, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9, flexDirection: 'row', alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  avatarWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: G, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  cardEmail: { fontSize: 12, color: '#888', marginTop: 2 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  cardActions: { gap: 8 },
  iconBtn: { backgroundColor: '#EDF7EF', borderRadius: 9, padding: 8, alignItems: 'center', justifyContent: 'center' },
  iconBtnRed: { backgroundColor: '#FEECEC' },
  iconBtnText: { fontSize: 16 },
  empty: { textAlign: 'center', color: '#AAA', fontSize: 16, marginTop: 60 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26,
    maxHeight: '88%', paddingHorizontal: 20, paddingTop: 0,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: G, marginBottom: 8 },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginTop: 14, marginBottom: 6 },
  fieldInput: {
    borderWidth: 1.5, borderColor: '#D0E8D8', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#1A1A2E', backgroundColor: '#FAFFF8',
  },

  rolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  roleChip: {
    borderWidth: 1.5, borderColor: '#C8D8C8', borderRadius: 22,
    paddingHorizontal: 18, paddingVertical: 9,
  },
  roleChipText: { fontSize: 13, color: '#555', fontWeight: '600' },

  submitBtn: { backgroundColor: G, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  outlineBtn: { borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 10, borderWidth: 1.5, borderColor: '#C8E0CC' },
  outlineBtnText: { color: G, fontWeight: '600', fontSize: 14 },
});
