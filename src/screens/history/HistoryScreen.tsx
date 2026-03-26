import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import {
  Badge,
  Button,
  EmptyState,
  FieldGroup,
  InputField,
  Page,
  PageHeader,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { useDonations } from '../../hooks/useDonations';
import { bulkDeleteDonations, generateReceipt } from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';
import { fs, type Palette, radius, spacing } from '../../theme/theme';

type ShadowRecord = ReturnType<typeof import('../../theme/theme').createShadows>;

const TYPES = ['All', 'Zakat', 'Fitra', 'Atiyaat', 'Noori Box'];
const DONATION_TYPES = ['Zakat', 'Fitra', 'Atiyaat', 'Noori Box'];
const PAYMENT_MODES = ['Cheque', 'Bank Transfer', 'QR', 'Cash'];
const BOX_NUMBERS = Array.from({ length: 100 }, (_, i) => String(i + 1));

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
const formatDate = (date: Date) => date.toISOString().split('T')[0];

type ViewMode = 'list' | 'grid';

interface SelectModalProps {
  visible: boolean;
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
  title: string;
}

function SelectModal({ visible, options, onSelect, onClose, title }: SelectModalProps) {
  const { palette, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.selectOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.selectSheet}>
          <View style={styles.selectHandle} />
          <Text style={styles.selectTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.selectItem}
                onPress={() => { onSelect(item); onClose(); }}>
                <Text style={styles.selectItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function HistoryScreen({ navigation }: any) {
  const { palette, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);
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
    editDonation,
  } = useDonations();
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: '', name: '' });
  const [editModal, setEditModal] = useState({ visible: false });
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editDate, setEditDate] = useState(new Date());
  const [editLoading, setEditLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeSelectModal, setActiveSelectModal] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [modeFilter, setModeFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [knownZones, setKnownZones] = useState<string[]>([]);
  const [knownBranches, setKnownBranches] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Accumulate unique zone/branch values seen across all fetches
  useEffect(() => {
    const zones = donations.map((d: any) => d.zone).filter(Boolean) as string[];
    const branches = donations.map((d: any) => d.branch).filter(Boolean) as string[];
    if (zones.length) setKnownZones(prev => [...new Set([...prev, ...zones])]);
    if (branches.length) setKnownBranches(prev => [...new Set([...prev, ...branches])]);
  }, [donations]);

  const zoneOptions = useMemo(() => ['All', ...knownZones], [knownZones]);
  const branchOptions = useMemo(() => ['All', ...knownBranches], [knownBranches]);

  const buildFilter = useCallback(
    (overrideSearch?: string) => ({
      page: 1,
      ...(overrideSearch !== undefined ? (overrideSearch ? { search: overrideSearch } : {}) : (appliedSearch ? { search: appliedSearch } : {})),
      ...(filter !== 'All' ? { donationType: filter } : {}),
      ...(modeFilter !== 'All' ? { mode: modeFilter } : {}),
      ...(zoneFilter !== 'All' ? { zone: zoneFilter } : {}),
      ...(branchFilter !== 'All' ? { branch: branchFilter } : {}),
    }),
    [appliedSearch, filter, modeFilter, zoneFilter, branchFilter],
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

  // Re-fetch when any filter chip changes
  useEffect(() => {
    fetchDonations({
      page: 1,
      ...(appliedSearch ? { search: appliedSearch } : {}),
      ...(filter !== 'All' ? { donationType: filter } : {}),
      ...(modeFilter !== 'All' ? { mode: modeFilter } : {}),
      ...(zoneFilter !== 'All' ? { zone: zoneFilter } : {}),
      ...(branchFilter !== 'All' ? { branch: branchFilter } : {}),
    }, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, modeFilter, zoneFilter, branchFilter]);

  const onRefresh = () => {
    fetchDonations({ ...buildFilter(), page: 1 }, true);
  };

  const selectedCount = Object.keys(selectedIds).length;

  const toggleSelectItem = (id: string) => {
    setSelectedIds(prev => {
      if (prev[id]) { const next = { ...prev }; delete next[id]; return next; }
      return { ...prev, [id]: true };
    });
  };

  const selectAll = () => {
    const all: Record<string, boolean> = {};
    donations.forEach((d: any) => { all[d._id] = true; });
    setSelectedIds(all);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds({});
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(selectedIds);
    if (!ids.length) return;
    setBulkDeleteLoading(true);
    try {
      await bulkDeleteDonations(ids);
      setBulkDeleteModal(false);
      exitSelectMode();
      fetchDonations({ ...buildFilter(), page: 1 }, true);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to delete donations');
    } finally {
      setBulkDeleteLoading(false);
    }
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

  const openEditModal = (item: any) => {
    setEditTarget(item);
    setEditForm({
      fills: item.fills || '',
      donorName: item.donorName || '',
      mobileNumber: item.mobileNumber || '',
      address: item.address || '',
      donationType: item.donationType || '',
      mode: item.mode || '',
      boxNumber: item.boxNumber ? String(item.boxNumber) : '',
      amount: String(item.amount || ''),
      zone: item.zone || '',
      branch: item.branch || '',
      chequeNumber: item.chequeNumber || '',
    });
    setEditDate(new Date(item.date));
    setEditModal({ visible: true });
  };

  const setEditValue = (key: string, value: string) =>
    setEditForm((prev: any) => ({ ...prev, [key]: value }));

  const confirmEdit = async (regenerate = false) => {
    if (!editTarget) { return; }
    if (!editForm.donorName?.trim()) { return Alert.alert('Validation', 'Donor name is required'); }
    if (!editForm.amount || isNaN(Number(editForm.amount)) || Number(editForm.amount) <= 0) {
      return Alert.alert('Validation', 'Valid amount is required');
    }
    setEditLoading(true);
    try {
      const payload: any = {
        ...editForm,
        date: formatDate(editDate),
        amount: Number(editForm.amount),
        boxNumber: editForm.boxNumber ? Number(editForm.boxNumber) : undefined,
      };
      const updated = await editDonation(editTarget._id, payload);
      if (regenerate) {
        await generateReceipt(editTarget._id);
        Alert.alert('Success', 'Donation updated & receipt regenerated.');
      } else {
        Alert.alert('Success', 'Donation updated successfully.');
      }
      setEditModal({ visible: false });
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update donation');
    } finally {
      setEditLoading(false);
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

      {/* Donation type filter chips */}
      <View style={styles.filterRowWrap}>
        <Text style={styles.filterRowLabel}>Type</Text>
        <FlatList
          horizontal
          data={TYPES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.filterContent}
          style={styles.filterRowScroll}
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

      {/* Payment mode filter chips */}
      <View style={styles.filterRowWrap}>
        <Text style={styles.filterRowLabel}>Mode</Text>
        <FlatList
          horizontal
          data={['All', 'Cash', 'QR', 'Cheque', 'Bank Transfer']}
          keyExtractor={item => `mode-${item}`}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.filterContent}
          style={styles.filterRowScroll}
          renderItem={({ item }) => {
            const active = item === modeFilter;
            return (
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.filterChip, active ? styles.filterChipActiveMode : null]}
                onPress={() => setModeFilter(item)}>
                <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* TODO: Zone filter chips — enable next time
      <View style={styles.filterRowWrap}>
        <Text style={styles.filterRowLabel}>Zone</Text>
        <FlatList
          horizontal
          data={zoneOptions}
          keyExtractor={item => `zone-${item}`}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.filterContent}
          style={styles.filterRowScroll}
          renderItem={({ item }) => {
            const active = item === zoneFilter;
            return (
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.filterChip, active ? styles.filterChipActiveZone : null]}
                onPress={() => setZoneFilter(item)}>
                <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>
                  {item === 'All' ? 'All' : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      */}

      {/* TODO: Branch filter chips — enable next time
      <View style={styles.filterRowWrap}>
        <Text style={styles.filterRowLabel}>Branch</Text>
        <FlatList
          horizontal
          data={branchOptions}
          keyExtractor={item => `branch-${item}`}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.filterContent}
          style={styles.filterRowScroll}
          renderItem={({ item }) => {
            const active = item === branchFilter;
            return (
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.filterChip, active ? styles.filterChipActiveBranch : null]}
                onPress={() => setBranchFilter(item)}>
                <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>
                  {item === 'All' ? 'All' : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      */}

      {/* View toggle + select mode */}
      <View style={styles.viewRow}>
        {selectMode ? (
          <>
            <TouchableOpacity activeOpacity={0.88} style={styles.selectCancelBtn} onPress={exitSelectMode}>
              <Text style={styles.selectCancelText}>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.viewLabel}>
              {selectedCount > 0 ? `${selectedCount} selected` : 'Tap to select'}
            </Text>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.selectAllBtn}
                onPress={selectAll}>
                <Text style={styles.selectAllText}>Select All</Text>
              </TouchableOpacity>
              {selectedCount > 0 && (
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.bulkDeleteBtn}
                  onPress={() => setBulkDeleteModal(true)}>
                  <Text style={styles.bulkDeleteBtnText}>Delete ({selectedCount})</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.viewLabel}>{donations.length} result{donations.length !== 1 ? 's' : ''}</Text>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.viewButton}
                onPress={() => setSelectMode(true)}>
                <Text style={styles.viewButtonText}>☑ Select</Text>
              </TouchableOpacity>
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
          </>
        )}
      </View>
    </View>
  );

  const renderItem = ({ item, index }: any) => {
    const isGrid = viewMode === 'grid';
    const accent = typeAccents[item.donationType] || palette.primary;
    const isOwner = String(item.createdBy?._id ?? item.createdBy) === user?.id;
    const canEdit = isAdmin || isOwner;
    const canDelete = isAdmin || isOwner;
    const isItemSelected = !!selectedIds[item._id];

    const navigateToReceipt = () =>
      navigation.navigate('ReceiptPreview', {
        donationId: item._id,
        receiptUrl: item.receiptUrl,
        receiptNumber: item.receiptNumber,
        donorName: item.donorName,
        mobileNumber: item.mobileNumber,
        qrImageUrl: item.qrImageUrl,
      });

    const handleCardPress = () => {
      if (selectMode) { toggleSelectItem(item._id); } else { navigateToReceipt(); }
    };

    if (isGrid) {
      return (
        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.gridCard, isItemSelected ? styles.cardSelected : null]}
          onPress={handleCardPress}>
          {/* Coloured top stripe */}
          <View style={[styles.gridStripe, { backgroundColor: isItemSelected ? palette.primary : accent }]}>
            {selectMode ? (
              <View style={styles.checkBox}>
                {isItemSelected && <Text style={styles.checkMark}>✓</Text>}
              </View>
            ) : (
              <Text style={styles.gridIndex}>#{index + 1}</Text>
            )}
            <Badge label={item.donationType} tone={typeTones[item.donationType] || 'default'} />
          </View>
          <View style={styles.gridBody}>
            <Text style={styles.gridDonorName} numberOfLines={2}>{item.donorName}</Text>
            <Text style={styles.gridAmount}>{formatCurrency(item.amount)}</Text>
            <Text style={styles.gridMeta}>{item.receiptNumber}</Text>
            <Text style={styles.gridMeta}>{new Date(item.date).toLocaleDateString('en-GB')} · {item.mode}</Text>
            {!selectMode && (canEdit || canDelete) ? (
              <View style={styles.gridFooter}>
                <Badge
                  label={item.whatsappSent ? 'Sent' : 'Pending'}
                  tone={item.whatsappSent ? 'success' : 'warning'}
                />
                <View style={styles.gridActions}>
                  {canEdit && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => openEditModal(item)}
                      style={styles.editBtn}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                  {canDelete && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => openDeleteModal(item._id, item.donorName)}
                      style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>Del</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.gridFooter}>
                <Badge
                  label={item.whatsappSent ? 'Sent' : 'Pending'}
                  tone={item.whatsappSent ? 'success' : 'warning'}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    // List card
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.listCard, isItemSelected ? styles.cardSelected : null]}
        onPress={handleCardPress}>
        {/* Left accent bar / select indicator */}
        <View style={[styles.listAccentBar, { backgroundColor: isItemSelected ? palette.primary : accent }]}>
          {selectMode && (
            <View style={styles.listCheckBox}>
              {isItemSelected && <Text style={styles.listCheckMark}>✓</Text>}
            </View>
          )}
        </View>
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
            {!selectMode && (canEdit || canDelete) ? (
              <View style={styles.listActions}>
                {canEdit && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => openEditModal(item)}
                    style={styles.editIconWrap}>
                    <View style={styles.editIconInner}>
                      <Text style={styles.editIconText}>✎</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {canDelete && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => openDeleteModal(item._id, item.donorName)}
                    style={styles.deleteIconWrap}>
                    <View style={styles.deleteIconInner}>
                      <Text style={styles.deleteIconText}>⌫</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
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

      {/* ── Bulk Delete Modal ── */}
      <Modal
        visible={bulkDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setBulkDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete {selectedCount} Donation{selectedCount !== 1 ? 's' : ''}</Text>
            <Text style={styles.modalText}>
              This will permanently delete <Text style={styles.modalBold}>{selectedCount}</Text> selected donation record{selectedCount !== 1 ? 's' : ''}. This cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={() => setBulkDeleteModal(false)}
                style={styles.modalBtn}
              />
              <Button
                label="Delete"
                variant="danger"
                loading={bulkDeleteLoading}
                onPress={handleBulkDelete}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Edit Donation Modal ── */}
      <Modal
        visible={editModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModal({ visible: false })}>
        <View style={styles.editOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setEditModal({ visible: false })} />
          <View style={styles.editSheet}>
            <View style={styles.editHandle} />
            <Text style={styles.editSheetTitle}>Edit Donation</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <FieldGroup label="Donor Name">
                <InputField value={editForm.donorName || ''} onChangeText={v => setEditValue('donorName', v)} placeholder="Full name" />
              </FieldGroup>
              <FieldGroup label="Mobile Number">
                <InputField value={editForm.mobileNumber || ''} onChangeText={v => setEditValue('mobileNumber', v)} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />
              </FieldGroup>
              <FieldGroup label="Address">
                <InputField value={editForm.address || ''} onChangeText={v => setEditValue('address', v)} placeholder="Full address" />
              </FieldGroup>
              <FieldGroup label="Amount">
                <InputField value={editForm.amount || ''} onChangeText={v => setEditValue('amount', v)} placeholder="0" keyboardType="numeric" />
              </FieldGroup>
              <FieldGroup label="Donation Type">
                <TouchableOpacity activeOpacity={0.88} style={styles.editPickerField} onPress={() => setActiveSelectModal('donationType')}>
                  <Text style={[styles.editPickerValue, !editForm.donationType ? styles.editPickerPlaceholder : null]}>
                    {editForm.donationType || 'Select type'}
                  </Text>
                  <Text style={styles.editPickerArrow}>›</Text>
                </TouchableOpacity>
              </FieldGroup>
              <FieldGroup label="Payment Mode">
                <TouchableOpacity activeOpacity={0.88} style={styles.editPickerField} onPress={() => setActiveSelectModal('mode')}>
                  <Text style={[styles.editPickerValue, !editForm.mode ? styles.editPickerPlaceholder : null]}>
                    {editForm.mode || 'Select mode'}
                  </Text>
                  <Text style={styles.editPickerArrow}>›</Text>
                </TouchableOpacity>
              </FieldGroup>
              {editForm.mode === 'Cheque' && (
                <FieldGroup label="Cheque Number">
                  <InputField value={editForm.chequeNumber || ''} onChangeText={v => setEditValue('chequeNumber', v)} placeholder="Enter cheque number" />
                </FieldGroup>
              )}
              {editForm.donationType === 'Noori Box' && (
                <FieldGroup label="Box Number">
                  <TouchableOpacity activeOpacity={0.88} style={styles.editPickerField} onPress={() => setActiveSelectModal('boxNumber')}>
                    <Text style={[styles.editPickerValue, !editForm.boxNumber ? styles.editPickerPlaceholder : null]}>
                      {editForm.boxNumber || 'Select box number'}
                    </Text>
                    <Text style={styles.editPickerArrow}>›</Text>
                  </TouchableOpacity>
                </FieldGroup>
              )}
              <FieldGroup label="Date">
                <TouchableOpacity activeOpacity={0.88} style={styles.editPickerField} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.editPickerValue}>{formatDate(editDate)}</Text>
                  <Text style={styles.editPickerArrow}>›</Text>
                </TouchableOpacity>
              </FieldGroup>
              {showDatePicker && (
                <DateTimePicker
                  value={editDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={(_: DateTimePickerEvent, d?: Date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (d) setEditDate(d);
                  }}
                />
              )}
              <FieldGroup label="Zone">
                <InputField value={editForm.zone || ''} onChangeText={v => setEditValue('zone', v)} placeholder="e.g. North Zone" />
              </FieldGroup>
              <FieldGroup label="Branch">
                <InputField value={editForm.branch || ''} onChangeText={v => setEditValue('branch', v)} placeholder="e.g. Main Branch" />
              </FieldGroup>
              <FieldGroup label="Recorded By">
                <InputField value={editForm.fills || ''} onChangeText={v => setEditValue('fills', v)} placeholder="Your name" />
              </FieldGroup>
              <View style={styles.editActions}>
                <Button label="Save Changes" loading={editLoading} onPress={() => confirmEdit(false)} style={styles.editBtn2} />
                <Button label="Save & Regenerate Receipt" variant="secondary" loading={editLoading} onPress={() => confirmEdit(true)} style={styles.editBtn2} />
                <Button label="Cancel" variant="ghost" onPress={() => setEditModal({ visible: false })} style={styles.editBtn2} />
              </View>
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SelectModal
        visible={activeSelectModal === 'donationType'}
        options={DONATION_TYPES}
        title="Donation Type"
        onSelect={v => setEditValue('donationType', v)}
        onClose={() => setActiveSelectModal(null)}
      />
      <SelectModal
        visible={activeSelectModal === 'mode'}
        options={PAYMENT_MODES}
        title="Payment Mode"
        onSelect={v => setEditValue('mode', v)}
        onClose={() => setActiveSelectModal(null)}
      />
      <SelectModal
        visible={activeSelectModal === 'boxNumber'}
        options={BOX_NUMBERS}
        title="Box Number"
        onSelect={v => setEditValue('boxNumber', v)}
        onClose={() => setActiveSelectModal(null)}
      />
    </Page>
  );
}

function makeStyles(p: Palette, shadows: ShadowRecord) {
  return StyleSheet.create({
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
    backgroundColor: p.background,
    borderBottomWidth: 1,
    borderBottomColor: p.border,
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
    color: p.textSoft,
    fontSize: fs(13),
    fontWeight: '700',
  },
  // ── Filter chips ──
  filterRow: {
    marginBottom: spacing.md,
  },
  filterRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filterRowLabel: {
    color: p.textMuted,
    fontSize: fs(11),
    fontWeight: '700',
    width: 44,
    flexShrink: 0,
  },
  filterRowScroll: {
    flex: 1,
  },
  filterContent: {
    paddingRight: spacing.md,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: p.border,
    backgroundColor: p.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: p.primary,
    borderColor: p.primary,
  },
  filterChipActiveMode: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  filterChipActiveZone: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  filterChipActiveBranch: {
    backgroundColor: '#B45309',
    borderColor: '#B45309',
  },
  filterText: {
    color: p.textMuted,
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
    color: p.textMuted,
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
    borderColor: p.border,
    backgroundColor: p.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonActive: {
    backgroundColor: p.primarySoft,
    borderColor: p.primary,
  },
  viewButtonText: {
    color: p.textMuted,
    fontSize: fs(12),
    fontWeight: '700',
  },
  viewButtonTextActive: {
    color: p.primaryDark,
  },
  // ── List card ──
  listCard: {
    flexDirection: 'row',
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.border,
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
    color: p.text,
    fontSize: fs(15),
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  listMeta: {
    color: p.textMuted,
    fontSize: fs(12),
    marginTop: 2,
  },
  listAmount: {
    color: p.primary,
    fontSize: fs(16),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  listReceiptNo: {
    color: p.textSoft,
    fontSize: fs(11),
    marginTop: 2,
    fontWeight: '600',
  },
  listDivider: {
    height: 1,
    backgroundColor: p.border,
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
    color: p.textSoft,
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
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.border,
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
    color: p.text,
    fontSize: fs(13),
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  gridAmount: {
    color: p.primary,
    fontSize: fs(15),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gridMeta: {
    color: p.textMuted,
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
    backgroundColor: p.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    ...shadows.lg,
  },
  modalTitle: {
    color: p.text,
    fontSize: fs(18),
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  modalText: {
    color: p.textMuted,
    fontSize: fs(14),
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  modalBold: {
    color: p.text,
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
  // ── Edit buttons (list) ──
  listActions: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: spacing.sm,
  },
  editIconWrap: {},
  editIconInner: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: p.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: p.accentSoft,
  },
  editIconText: {
    fontSize: 15,
    color: p.primaryDark,
  },
  // ── Edit buttons (grid) ──
  gridActions: {
    flexDirection: 'row',
    gap: 4,
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: p.primarySoft,
    borderWidth: 1,
    borderColor: p.accentSoft,
  },
  editBtnText: {
    color: p.primaryDark,
    fontSize: 10,
    fontWeight: '700',
  },
  // ── Select Modal ──
  selectOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.46)',
    justifyContent: 'flex-end',
  },
  selectSheet: {
    backgroundColor: p.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  selectHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: p.borderStrong,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  selectTitle: {
    color: p.text,
    fontSize: fs(16),
    fontWeight: '700',
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
  },
  selectItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screen,
    borderBottomWidth: 1,
    borderBottomColor: p.border,
  },
  selectItemText: {
    color: p.text,
    fontSize: fs(15),
  },
  // ── Edit Donation Modal ──
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.46)',
    justifyContent: 'flex-end',
  },
  editSheet: {
    backgroundColor: p.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '92%',
    paddingHorizontal: spacing.screen,
    paddingBottom: 16,
  },
  editHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: p.borderStrong,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  editSheetTitle: {
    color: p.text,
    fontSize: fs(18),
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  editPickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1.5,
    borderColor: p.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: p.surfaceMuted,
  },
  editPickerValue: {
    color: p.text,
    fontSize: fs(14),
    flex: 1,
  },
  editPickerPlaceholder: {
    color: p.textSoft,
  },
  editPickerArrow: {
    color: p.textMuted,
    fontSize: 20,
    fontWeight: '300',
  },
  editActions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  editBtn2: {
    minHeight: 44,
  },
  // ── Multi-select ──
  cardSelected: {
    borderColor: p.primary,
    borderWidth: 2,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: fs(12),
    fontWeight: '800',
    lineHeight: 16,
  },
  listCheckBox: {
    position: 'absolute',
    top: '50%',
    left: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: p.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -9,
  },
  listCheckMark: {
    color: '#FFFFFF',
    fontSize: fs(10),
    fontWeight: '800',
    lineHeight: 14,
  },
  selectCancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: p.border,
    backgroundColor: p.surface,
  },
  selectCancelText: {
    color: p.textMuted,
    fontSize: fs(12),
    fontWeight: '700',
  },
  selectAllBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: p.primary,
    backgroundColor: p.primarySoft,
  },
  selectAllText: {
    color: p.primaryDark,
    fontSize: fs(12),
    fontWeight: '700',
  },
  bulkDeleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#B91C1C',
  },
  bulkDeleteBtnText: {
    color: '#FFFFFF',
    fontSize: fs(12),
    fontWeight: '700',
  },
  });
}
