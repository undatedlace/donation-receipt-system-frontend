import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const G = '#1B6B3A';
const GOLD = '#C8963E';

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerArabic}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Profile</Text>
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <Text style={styles.profileRole}>Role: {user?.role}</Text>
      </View>

      {/* WhatsApp Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📲 WhatsApp</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.statusText}>Meta Cloud API — Always Ready</Text>
        </View>
        <Text style={styles.note}>
          WhatsApp receipts are sent automatically via the Meta Cloud API when you submit a donation.
          No setup needed — just ensure your server has valid{' '}
          <Text style={{ fontWeight: 'bold' }}>WHATSAPP_ACCESS_TOKEN</Text> and{' '}
          <Text style={{ fontWeight: 'bold' }}>WHATSAPP_PHONE_NUMBER_ID</Text> in your .env file.
        </Text>
      </View>

      {/* Export */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Export Data</Text>
        <Text style={styles.note}>Download all donation records as CSV from your backend:</Text>
        <Text style={styles.code}>GET /api/donations/export/csv{'\n'}(Authorization: Bearer TOKEN)</Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={[styles.btn, styles.logoutBtn, { margin: 16 }]} onPress={handleLogout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9F5' },
  header: { backgroundColor: G, padding: 20, alignItems: 'center' },
  headerArabic: { color: GOLD, fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card: { margin: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: G, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 8 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  profileEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  profileRole: { fontSize: 13, color: GOLD, marginTop: 4, textTransform: 'capitalize' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: '600', color: '#333' },
  note: { fontSize: 13, color: '#666', lineHeight: 20 },
  code: { fontSize: 12, color: '#333', backgroundColor: '#F5F5F5', padding: 10, borderRadius: 8, marginTop: 10, fontFamily: 'monospace' },
  btn: { backgroundColor: G, borderRadius: 10, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  logoutBtn: { backgroundColor: '#FF5252' },
});
