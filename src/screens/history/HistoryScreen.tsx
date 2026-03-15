import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Badge,
  Button,
  EmptyState,
  InputField,
  Page,
  PageHeader,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useDonations } from '../../hooks/useDonations';
import { palette, radius, spacing } from '../../theme/theme';

const TYPES = ['All', 'Zakat', 'Fitra', 'Atiyaat', 'Noori Box'];

const typeTones: Record<string, 'primary' | 'warning' | 'info' | 'success' | 'default'> = {
  Zakat: 'primary',
  Fitra: 'warning',
  Atiyaat: 'info',
  'Noori Box': 'success',
};

const formatCurrency = (value: number) => `₹${Number(value).toLocaleString('en-IN')}`;

export default function HistoryScreen({ navigation }: any) {
  const {
    donations,
    loading,
    loadingMore,
    refreshing,
    page,
    totalPages,
    fetchDonations,
    loadMore,
    removeDonation,
  } = useDonations();
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const buildFilter = useCallback(
    () => ({
      page: 1,
      ...(appliedSearch ? { search: appliedSearch } : {}),
      ...(filter !== 'All' ? { donationType: filter } : {}),
    }),
    [appliedSearch, filter],
  );

  useFocusEffect(
    useCallback(() => {
      fetchDonations(buildFilter(), true);
    }, [fetchDonations, buildFilter]),
  );

  const onSearch = () => {
    const nextSearch = search.trim();
    if (nextSearch !== appliedSearch) {
      setAppliedSearch(nextSearch);
    } else {
      fetchDonations(buildFilter(), true);
    }
  };

  const onRefresh = () => {
    fetchDonations({ ...buildFilter(), page: 1 }, true);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Donation', `Delete ${name}'s record?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeDonation(id);
          } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to delete donation');
          }
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <PageHeader
        eyebrow="History"
        title="Search, filter, and reopen previous donation receipts."
        subtitle="Use keyword search and donation-type filters to reach any record quickly."
        trailing={<Badge label={`${donations.length} results`} tone="primary" />}
      />

      <SurfaceCard style={styles.searchCard}>
        <InputField
          value={search}
          onChangeText={setSearch}
          placeholder="Search donor name or receipt number"
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        <Button label="Search" onPress={onSearch} style={styles.searchButton} />
      </SurfaceCard>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TYPES}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => {
            const active = item === filter;
            return (
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilter(item)}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() =>
        navigation.navigate('ReceiptPreview', {
          donationId: item._id,
          receiptUrl: item.receiptUrl,
          receiptNumber: item.receiptNumber,
          donorName: item.donorName,
          mobileNumber: item.mobileNumber,
        })
      }
      onLongPress={() => handleDelete(item._id, item.donorName)}>
      <View style={styles.cardTop}>
        <Badge label={item.donationType} tone={typeTones[item.donationType] || 'default'} />
        <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
      </View>

      <Text style={styles.donorName}>{item.donorName}</Text>
      <Text style={styles.cardMeta}>
        {item.receiptNumber} • {new Date(item.date).toLocaleDateString('en-GB')}
      </Text>
      <Text style={styles.cardMeta}>
        {item.mode}
        {item.mobileNumber ? ` • ${item.mobileNumber}` : ''}
      </Text>

      <View style={styles.cardBottom}>
        <Text style={styles.openText}>Open receipt</Text>
        <Badge label={item.whatsappSent ? 'WhatsApp sent' : 'Pending'} tone={item.whatsappSent ? 'success' : 'warning'} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Page>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <FlatList
        data={donations}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No donations found"
            subtitle="Try a different search term or switch back to the full donation list."
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={palette.primary} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          loadMore(buildFilter());
        }}
        onEndReachedThreshold={0.35}
        showsVerticalScrollIndicator={false}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: 126,
  },
  headerWrap: {
    marginBottom: spacing.lg,
  },
  searchCard: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  searchButton: {
    minHeight: 48,
  },
  filterRow: {
    marginTop: spacing.md,
  },
  filterContent: {
    paddingRight: spacing.md,
  },
  filterChip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: palette.primaryDark,
    borderColor: palette.primaryDark,
  },
  filterText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  filterTextActive: {
    color: palette.surface,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  amount: {
    color: palette.primaryDark,
    fontSize: 20,
    fontWeight: '800',
  },
  donorName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  cardMeta: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  openText: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});
