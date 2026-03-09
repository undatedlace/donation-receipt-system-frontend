import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboardStats } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const G = '#1B6B3A';
const GOLD = '#C8963E';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchStats(); };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={G} /></View>
  );

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[G]} />}>
      {/* Welcome */}
      <View style={styles.header}>
        <Text style={styles.arabic}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
        <Text style={styles.welcome}>Assalamu Alaikum, {user?.name} 🌙</Text>
      </View>

      {/* Stat Cards */}
      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: G }]}>
          <Text style={styles.cardNum}>₹{Number(stats?.totalAmount || 0).toLocaleString('en-IN')}</Text>
          <Text style={styles.cardLabel}>Total Raised</Text>
        </View>
        <View style={[styles.card, { backgroundColor: GOLD }]}>
          <Text style={styles.cardNum}>{stats?.totalDonations || 0}</Text>
          <Text style={styles.cardLabel}>Donations</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.cardNum}>{stats?.monthlyDonations || 0}</Text>
          <Text style={styles.cardLabel}>This Month</Text>
        </View>
        <TouchableOpacity style={[styles.card, { backgroundColor: '#4CAF50' }]} onPress={() => navigation.navigate('New Donation')}>
          <Text style={styles.cardNum}>+</Text>
          <Text style={styles.cardLabel}>New Donation</Text>
        </TouchableOpacity>
      </View>

      {/* By Donation Type */}
      {stats?.byType?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Donation Type</Text>
          {stats.byType.map((item: any) => (
            <View key={item._id} style={styles.listRow}>
              <Text style={styles.listLabel}>{item._id}</Text>
              <View style={styles.listRight}>
                <Text style={styles.listCount}>{item.count} donations</Text>
                <Text style={styles.listAmount}>₹{Number(item.total).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Donations */}
      {stats?.recentDonations?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Donations</Text>
          {stats.recentDonations.map((d: any) => (
            <TouchableOpacity key={d._id} style={styles.recentRow} onPress={() => navigation.navigate('ReceiptPreview', { donationId: d._id })}>
              <View>
                <Text style={styles.recentName}>{d.donorName}</Text>
                <Text style={styles.recentType}>{d.donationType} • {d.receiptNumber}</Text>
              </View>
              <View style={styles.recentRight}>
                <Text style={styles.recentAmount}>₹{Number(d.amount).toLocaleString('en-IN')}</Text>
                {d.whatsappSent && <Text style={styles.sentBadge}>✓ Sent</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: G, padding: 20, paddingTop: 16, paddingBottom: 24 },
  arabic: { color: GOLD, fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  welcome: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  cardRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 12 },
  card: { flex: 1, borderRadius: 14, padding: 18, alignItems: 'center', elevation: 3 },
  cardNum: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  cardLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 },
  section: { margin: 16, backgroundColor: '#fff', borderRadius: 14, elevation: 2, overflow: 'hidden' },
  sectionTitle: { padding: 14, fontSize: 15, fontWeight: 'bold', color: G, borderBottomWidth: 1, borderBottomColor: '#E8F5EE' },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  listLabel: { fontSize: 14, color: '#333', fontWeight: '500' },
  listRight: { alignItems: 'flex-end' },
  listCount: { fontSize: 12, color: '#888' },
  listAmount: { fontSize: 14, fontWeight: 'bold', color: G },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  recentName: { fontSize: 14, fontWeight: '600', color: '#333' },
  recentType: { fontSize: 12, color: '#888', marginTop: 2 },
  recentRight: { alignItems: 'flex-end' },
  recentAmount: { fontSize: 15, fontWeight: 'bold', color: G },
  sentBadge: { fontSize: 11, color: '#4CAF50', marginTop: 2 },
});
