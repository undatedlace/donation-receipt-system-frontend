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
import { fs, palette, radius, shadows, spacing } from '../../theme/theme';

const TYPES = ['All', 'Zakat', 'Fitra', 'Atiyaat', 'Noori Box'];

const typeTones: Record<string, 'primary' | 'warning' | 'info' | 'success' | 'default'> = {
  Zakat: 'primary',
  Fitra: 'warning',
  Atiyaat: 'info',
  'Noori Box': 'success',
};

const formatCurrency = (value: number) => `Rs ${Number(value).toLocaleString('en-IN')}`;

type ViewMode = 'list' | 'grid';

export default function HistoryScreen({ navigation }: any) {
  const {
    donations,
    loading,
    loadingMore,
    refreshing,
    fetchDonations,
    loadMore,
    removeDonation,
  } = useDonations();
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

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
      return;
    }

    fetchDonations(buildFilter(), true);
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
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={TYPES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => {
            const active = item === filter;

            return (
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.filterChip, active ? styles.filterChipActive : null]}
                onPress={() => setFilter(item)}>
                <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

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

      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>View</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.viewButton, viewMode === 'list' ? styles.viewButtonActive : null]}
            onPress={() => setViewMode('list')}>
            <Text style={[styles.viewButtonText, viewMode === 'list' ? styles.viewButtonTextActive : null]}>
              Card
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.viewButton, viewMode === 'grid' ? styles.viewButtonActive : null]}
            onPress={() => setViewMode('grid')}>
            <Text style={[styles.viewButtonText, viewMode === 'grid' ? styles.viewButtonTextActive : null]}>
              Grid
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item, index }: any) => {
    const isGrid = viewMode === 'grid';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.card, isGrid ? styles.gridCard : null]}
        onPress={() =>
          navigation.navigate('ReceiptPreview', {
            donationId: item._id,
            receiptUrl: item.receiptUrl,
            receiptNumber: item.receiptNumber,
            donorName: item.donorName,
            mobileNumber: item.mobileNumber,
            qrImageUrl: item.qrImageUrl,
          })
        }
        onLongPress={() => handleDelete(item._id, item.donorName)}>
        <View style={styles.cardTop}>
          <View style={[styles.cardIndex, isGrid ? styles.cardIndexGrid : null]}>
            <Text style={[styles.cardIndexText, isGrid ? styles.cardIndexTextGrid : null]}>{index + 1}</Text>
          </View>

          <View style={styles.cardMain}>
            <Text style={[styles.donorName, isGrid ? styles.donorNameGrid : null]} numberOfLines={2}>
              {item.donorName}
            </Text>
            <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
          </View>
        </View>

        <Text style={styles.cardMeta}>{item.receiptNumber}</Text>
        <Text style={styles.cardMeta}>
          {new Date(item.date).toLocaleDateString('en-GB')} • {item.mode}
        </Text>
        {item.mobileNumber ? <Text style={styles.cardMeta}>{item.mobileNumber}</Text> : null}

        <View style={styles.cardBottom}>
          <Badge label={item.donationType} tone={typeTones[item.donationType] || 'default'} />
          <Badge
            label={item.whatsappSent ? 'Sent' : 'Pending'}
            tone={item.whatsappSent ? 'success' : 'warning'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !donations.length) {
    return (
      <Page header={<PageHeader title="Donation History" subtitle="Loading receipts" compact />}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </Page>
    );
  }

  return (
    <Page
      header={
        <PageHeader
          title="Donation History"
          subtitle="Review, search, and reopen receipts."
          trailing={<Badge label={`${donations.length} shown`} tone="success" />}
        />
      }>
      <FlatList
        key={viewMode}
        data={donations}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
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
        onEndReached={() => loadMore(buildFilter())}
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
    marginBottom: spacing.md,
  },
  filterRow: {
    marginBottom: spacing.md,
  },
  filterContent: {
    paddingRight: spacing.md,
  },
  filterChip: {
    minHeight: 38,
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
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  filterText: {
    color: palette.textMuted,
    fontSize: fs(12),
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  viewLabel: {
    color: palette.text,
    fontSize: fs(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewButton: {
    minWidth: 72,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonActive: {
    backgroundColor: palette.primarySoft,
    borderColor: palette.accentSoft,
  },
  viewButtonText: {
    color: palette.textMuted,
    fontSize: fs(12),
    fontWeight: '700',
  },
  viewButtonTextActive: {
    color: palette.primaryDark,
  },
  searchCard: {
    gap: spacing.sm,
  },
  searchButton: {
    minHeight: 44,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  gridCard: {
    width: '48%',
    minHeight: 176,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardIndex: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIndexGrid: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  cardIndexText: {
    color: palette.primaryDark,
    fontSize: fs(15),
    fontWeight: '700',
  },
  cardIndexTextGrid: {
    fontSize: fs(13),
  },
  cardMain: {
    flex: 1,
    gap: 2,
  },
  donorName: {
    color: palette.text,
    fontSize: fs(15),
    fontWeight: '700',
  },
  donorNameGrid: {
    fontSize: fs(14),
  },
  amount: {
    color: palette.primaryDark,
    fontSize: fs(14),
    fontWeight: '700',
  },
  cardMeta: {
    color: palette.textMuted,
    fontSize: fs(11),
    marginTop: spacing.xs,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});
