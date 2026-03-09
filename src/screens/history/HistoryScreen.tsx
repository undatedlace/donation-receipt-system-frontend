import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDonations, deleteDonation } from '../../services/api';

const G = '#1B6B3A';
const GOLD = '#C8963E';
const TYPES = ['All', 'Zakat', 'Fitra', 'Atiyaat', 'Noori Box'];

export default function HistoryScreen({ navigation }: any) {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDonations = async (reset = false) => {
    const currentPage = reset ? 1 : page;
    try {
      const params: any = { page: currentPage, limit: 20 };
      if (search) params.search = search;
      if (filter !== 'All') params.donationType = filter;

      const { data } = await getDonations(params);
      if (reset) {
        setDonations(data.data);
        setPage(1);
      } else {
        setDonations(prev => currentPage === 1 ? data.data : [...prev, ...data.data]);
      }
      setTotalPages(data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDonations(true); }, [filter]));

  const onSearch = () => fetchDonations(true);
  const onRefresh = () => { setRefreshing(true); fetchDonations(true); };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Donation', `Delete ${name}'s record?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteDonation(id);
          setDonations(prev => prev.filter(d => d._id !== id));
        },
      },
    ]);
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = { Zakat: '#1B6B3A', Fitra: '#C8963E', Atiyaat: '#2196F3', 'Noori Box': '#9C27B0' };
    return map[type] || '#666';
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ReceiptPreview', {
        donationId: item._id, receiptUrl: item.receiptUrl,
        receiptNumber: item.receiptNumber, donorName: item.donorName, mobileNumber: item.mobileNumber,
      })}
      onLongPress={() => handleDelete(item._id, item.donorName)}>
      <View style={styles.cardLeft}>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.donationType) }]}>
          <Text style={styles.typeText}>{item.donationType}</Text>
        </View>
        <Text style={styles.donorName}>{item.donorName}</Text>
        <Text style={styles.cardMeta}>{item.receiptNumber} • {new Date(item.date).toLocaleDateString('en-GB')}</Text>
        <Text style={styles.cardMeta}>{item.mode} {item.mobileNumber}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.amount}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
        {item.whatsappSent ? (
          <Text style={styles.sentBadge}>✓ Sent</Text>
        ) : (
          <Text style={styles.pendingBadge}>Pending</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search donor, receipt..."
          placeholderTextColor="#AAA"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
          <Text style={styles.searchBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TYPES}
          keyExtractor={(t) => t}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}>
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={G} /></View>
      ) : (
        <FlatList
          data={donations}
          keyExtractor={(d) => d._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[G]} />}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={<Text style={styles.empty}>No donations found</Text>}
          onEndReached={() => {
            if (page < totalPages) {
              setPage(p => p + 1);
              fetchDonations();
            }
          }}
          onEndReachedThreshold={0.3}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE', gap: 8 },
  searchInput: { flex: 1, borderWidth: 1.5, borderColor: '#D0E8D8', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#333' },
  searchBtn: { backgroundColor: G, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: 'bold' },
  filterRow: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#D0E8D8', marginRight: 8 },
  filterChipActive: { backgroundColor: G, borderColor: G },
  filterText: { fontSize: 13, color: '#666' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cardLeft: { flex: 1 },
  typeBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 },
  typeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  donorName: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  amount: { fontSize: 16, fontWeight: 'bold', color: G },
  sentBadge: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
  pendingBadge: { fontSize: 11, color: '#FF9800' },
  empty: { textAlign: 'center', color: '#AAA', fontSize: 16, marginTop: 60 },
});
