import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { useDonations } from '../../hooks/useDonations';
import { fs, palette, radius, shadows, spacing } from '../../theme/theme';

const TYPES = ['All', 'Zakat', 'Fitra', 'Atiyaat', 'Noori Box'];

const typeTones: Record<string, 'primary' | 'warning' | 'info' | 'success' | 'default'> = {
  Zakat: 'primary',
  Fitra: 'warning',
  Atiyaat: 'info',
  'Noori Box': 'success',
};

const typeAccents: Record<string, string> = {
  Zakat: '#045E53',
  Fitra: '#B45309',
  Atiyaat: '#1D4ED8',
  'Noori Box': '#16A34A',
};

const formatCurrency = (value: number) => `Rs ${Number(value).toLocaleString('en-IN')}`;

type ViewMode = 'list' | 'grid';

export default function HistoryScreen({ navigation }: any) {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('admin') ?? false;
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
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: '', name: '' });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildFilter = useCallback(
    (overrideSearch?: string) => ({
      page: 1,
      ...(overrideSearch !== undefined ? (overrideSearch ? { search: overrideSearch } : {}) : (appliedSearch ? { search: appliedSearch } : {})),
      ...(filter !== 'All' ? { donationType: filter } : {}),
    }),
    [appliedSearch, filter],
  );

  useFocusEffect(
    useCallback(() => {
      fetchDonations(buildFilter(), true);
    }, [fetchDonations, buildFilter]),
  );

  // Debounced search: fires after 400ms when query >= 2 chars (or empty to reset)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = search.trim();
      if (trimmed.length === 0 || trimmed.length >= 2) {
        setAppliedSearch(trimmed);
        fetchDonations({
          page: 1,
          ...(trimmed ? { search: trimmed } : {}),
          ...(filter !== 'All' ? { donationType: filter } : {}),
        }, true);
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Re-fetch when filter changes
  useEffect(() => {
    fetchDonations({
      page: 1,
      ...(appliedSearch ? { search: appliedSearch } : {}),
      ...(filter !== 'All' ? { donationType: filter } : {}),
    }, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const onRefresh = () => {
    fetchDonations({ ...buildFilter(), page: 1 }, true);
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ visible: true, id, name });
  };

  const confirmDelete = async () => {
    const { id } = deleteModal;
    setDeleteModal({ visible: false, id: '', name: '' });
    try {
      await removeDonation(id);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to delete donation');
    }
  };

  const renderStickyHeader = () => (
    <View style={styles.stickyBar}>
      {/* Search first */}
      <View style={styles.searchWrap}>
        <InputField
          value={search}
          onChangeText={setSearch}
          placeholder="Search donor, receipt or mobile…"
          returnKeyType="search"
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.searchClear}
            onPress={() => setSearch('')}>
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips below search */}
      <FlatList
        horizontal
        data={TYPES}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
        style={styles.filterRow}
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

      {/* View toggle */}
      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>{donations.length} result{donations.length !== 1 ? 's' : ''}</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.viewButton, viewMode === 'list' ? styles.viewButtonActive : null]}
            onPress={() => setViewMode('list')}>
            <Text style={[styles.viewButtonText, viewMode === 'list' ? styles.viewButtonTextActive : null]}>
              ☰ List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.viewButton, viewMode === 'grid' ? styles.viewButtonActive : null]}
            onPress={() => setViewMode('grid')}>
            <Text style={[styles.viewButtonText, viewMode === 'grid' ? styles.viewButtonTextActive : null]}>
              ⊞ Grid
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item, index }: any) => {
    const isGrid = viewMode === 'grid';
    const accent = typeAccents[item.donationType] || palette.primary;

    if (isGrid) {
      return (
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.gridCard}
          onPress={() =>
            navigation.navigate('ReceiptPreview', {
              donationId: item._id,
              receiptUrl: item.receiptUrl,
              receiptNumber: item.receiptNumber,
              donorName: item.donorName,
              mobileNumber: item.mobileNumber,
              qrImageUrl: item.qrImageUrl,
            })
          }>
          {/* Coloured top stripe */}
          <View style={[styles.gridStripe, { backgroundColor: accent }]}>
            <Text style={styles.gridIndex}>#{index + 1}</Text>
            <Badge label={item.donationType} tone={typeTones[item.donationType] || 'default'} />
          </View>
          <View style={styles.gridBody}>
            <Text style={styles.gridDonorName} numberOfLines={2}>{item.donorName}</Text>
            <Text style={styles.gridAmount}>{formatCurrency(item.amount)}</Text>
            <Text style={styles.gridMeta}>{item.receiptNumber}</Text>
            <Text style={styles.gridMeta}>{new Date(item.date).toLocaleDateString('en-GB')} · {item.mode}</Text>
            <View style={styles.gridFooter}>
              <Badge
                label={item.whatsappSent ? 'Sent' : 'Pending'}
                tone={item.whatsappSent ? 'success' : 'warning'}
              />
              {isAdmin ? (
                <TouchableOpacity
                  activeOpacity={0.75}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => openDeleteModal(item._id, item.donorName)}
                  style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    // List card
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.listCard}
        onPress={() =>
          navigation.navigate('ReceiptPreview', {
            donationId: item._id,
            receiptUrl: item.receiptUrl,
            receiptNumber: item.receiptNumber,
            donorName: item.donorName,
            mobileNumber: item.mobileNumber,
            qrImageUrl: item.qrImageUrl,
          })
        }>
        {/* Left accent bar */}
        <View style={[styles.listAccentBar, { backgroundColor: accent }]} />
        <View style={styles.listBody}>
          <View style={styles.listTopRow}>
            <View style={styles.listLeft}>
              <Text style={styles.listDonorName} numberOfLines={1}>{item.donorName}</Text>
              {item.mobileNumber ? <Text style={styles.listMeta}>{item.mobileNumber}</Text> : null}
            </View>
            <View style={styles.listRight}>
              <Text style={styles.listAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.listReceiptNo}>{item.receiptNumber}</Text>
            </View>
          </View>

          <View style={styles.listDivider} />

          <View style={styles.listBottomRow}>
            <View style={styles.listBadges}>
              <Badge label={item.donationType} tone={typeTones[item.donationType] || 'default'} />
              <Badge
                label={item.whatsappSent ? 'Sent' : 'Pending'}
                tone={item.whatsappSent ? 'success' : 'warning'}
              />
              <Text style={styles.listDate}>
                {new Date(item.date).toLocaleDateString('en-GB')} · {item.mode}
              </Text>
            </View>
            {isAdmin ? (
              <TouchableOpacity
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => openDeleteModal(item._id, item.donorName)}
                style={styles.deleteIconWrap}>
                <View style={styles.deleteIconInner}>
                  <Text style={styles.deleteIconText}>⌫</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !donations.length) {
    return (
      <Page header={<PageHeader title="Donation History" subtitle="Loading receipts" compact />}>
        {renderStickyHeader()}
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
      {renderStickyHeader()}
      <FlatList
        key={viewMode}
        style={styles.list}
        data={donations}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
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
        keyboardShouldPersistTaps="handled"
      />

      <Modal
        visible={deleteModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModal({ visible: false, id: '', name: '' })}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Donation</Text>
            <Text style={styles.modalText}>
              Delete <Text style={styles.modalBold}>{deleteModal.name}</Text>'s donation record? This cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={() => setDeleteModal({ visible: false, id: '', name: '' })}
                style={styles.modalBtn}
              />
              <Button
                label="Delete"
                variant="danger"
                onPress={confirmDelete}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: 126,
  },
  stickyBar: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: palette.background,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  // ── Search ──
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    paddingRight: 40,
  },
  searchClear: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  searchClearText: {
    color: palette.textSoft,
    fontSize: fs(13),
    fontWeight: '700',
  },
  // ── Filter chips ──
  filterRow: {
    marginBottom: spacing.md,
  },
  filterContent: {
    paddingRight: spacing.md,
  },
  filterChip: {
    height: 36,
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
  // ── View toggle ──
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  viewLabel: {
    color: palette.textMuted,
    fontSize: fs(12),
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonActive: {
    backgroundColor: palette.primarySoft,
    borderColor: palette.primary,
  },
  viewButtonText: {
    color: palette.textMuted,
    fontSize: fs(12),
    fontWeight: '700',
  },
  viewButtonTextActive: {
    color: palette.primaryDark,
  },
  // ── List card ──
  listCard: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  listAccentBar: {
    width: 5,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  listBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  listTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  listLeft: {
    flex: 1,
  },
  listRight: {
    alignItems: 'flex-end',
  },
  listDonorName: {
    color: palette.text,
    fontSize: fs(15),
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  listMeta: {
    color: palette.textMuted,
    fontSize: fs(12),
    marginTop: 2,
  },
  listAmount: {
    color: palette.primary,
    fontSize: fs(16),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  listReceiptNo: {
    color: palette.textSoft,
    fontSize: fs(11),
    marginTop: 2,
    fontWeight: '600',
  },
  listDivider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.sm,
  },
  listBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
    flex: 1,
  },
  listDate: {
    color: palette.textSoft,
    fontSize: fs(11),
    marginLeft: 2,
  },
  // Delete button (list)
  deleteIconWrap: {
    marginLeft: spacing.sm,
  },
  deleteIconInner: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteIconText: {
    fontSize: fs(15),
    color: '#DC2626',
  },
  // ── Grid card ──
  gridCard: {
    width: '48%',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  gridStripe: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridIndex: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fs(11),
    fontWeight: '700',
  },
  gridBody: {
    padding: spacing.md,
  },
  gridDonorName: {
    color: palette.text,
    fontSize: fs(13),
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  gridAmount: {
    color: palette.primary,
    fontSize: fs(15),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gridMeta: {
    color: palette.textMuted,
    fontSize: fs(10),
    marginTop: 3,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  // Delete button (grid)
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: fs(10),
    fontWeight: '700',
  },
  // ── Misc ──
  gridRow: {
    justifyContent: 'space-between',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screen,
  },
  modalBox: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    ...shadows.lg,
  },
  modalTitle: {
    color: palette.text,
    fontSize: fs(18),
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  modalText: {
    color: palette.textMuted,
    fontSize: fs(14),
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  modalBold: {
    color: palette.text,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalBtn: {
    flex: 1,
    minHeight: 44,
  },
});
