import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  Badge,
  Button,
  FieldGroup,
  InputField,
  PageScroll,
  SectionHeading,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { useDonations } from '../../hooks/useDonations';
import { uploadQrImage } from '../../services/api';
import { fs, palette, radius, spacing } from '../../theme/theme';

const DONATION_TYPES = ['Zakat', 'Fitra', 'Atiyaat', 'Noori Box'];
const PAYMENT_MODES = ['Cheque', 'Bank Transfer', 'QR', 'Cash'];
const BOX_NUMBERS = Array.from({ length: 100 }, (_, index) => String(index + 1));

interface SelectModalProps {
  visible: boolean;
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
  title: string;
}

function SelectModal({ visible, options, onSelect, onClose, title }: SelectModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.modalItem}
                onPress={() => { onSelect(item); onClose(); }}>
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function PickerField({
  label, value, placeholder, onPress, hint,
}: {
  label: string; value: string; placeholder: string; onPress: () => void; hint?: string;
}) {
  return (
    <FieldGroup label={label} hint={hint}>
      <TouchableOpacity activeOpacity={0.88} style={styles.pickerField} onPress={onPress}>
        <Text style={[styles.pickerValue, !value && styles.pickerPlaceholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.pickerArrow}>Open</Text>
      </TouchableOpacity>
    </FieldGroup>
  );
}

const formatDate = (d: Date) => d.toISOString().split('T')[0];

export default function DonationFormScreen({ navigation }: any) {
  const { user } = useAuth();
  const { submitDonation } = useDonations();
  const today = new Date();

  const [form, setForm] = useState({
    fills: user?.name || '',
    donorName: '',
    mobileNumber: '',
    address: '',
    donationType: '',
    mode: '',
    boxNumber: '',
    amount: '',
    qrImageUrl: '',
  });
  const [date, setDate] = useState<Date>(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [qrUploading, setQrUploading] = useState(false);

  const setValue = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // keep open on iOS until dismissed
    if (selected) setDate(selected);
  };

  const pickQrImage = async (source: 'camera' | 'gallery') => {
    const fn = source === 'camera' ? launchCamera : launchImageLibrary;
    const result = await fn({ mediaType: 'photo', quality: 0.8, includeBase64: false });
    if (result.didCancel || result.errorCode) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setQrUploading(true);
    try {
      const url = await uploadQrImage({ uri: asset.uri, type: asset.type, fileName: asset.fileName });
      setValue('qrImageUrl', url);
    } catch {
      Alert.alert('Upload failed', 'Could not upload QR screenshot. Please try again.');
    } finally {
      setQrUploading(false);
    }
  };

  const validate = () => {
    if (!form.fills) return 'Filled-by field is required';
    if (!form.donorName.trim()) return 'Donor name is required';
    if (!form.mobileNumber.trim()) return 'Mobile number is required';
    if (!form.address.trim()) return 'Address is required';
    if (!form.donationType) return 'Please select donation type';
    if (!form.mode) return 'Please select payment mode';
    if (form.mode === 'QR' && !form.qrImageUrl) return 'Please upload or capture the QR payment screenshot';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return 'Valid amount is required';
    return null;
  };

  const resetForm = () => {
    setForm({ fills: user?.name || '', donorName: '', mobileNumber: '', address: '', donationType: '', mode: '', boxNumber: '', amount: '', qrImageUrl: '' });
    setDate(new Date());
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation Error', err);
    setLoading(true);
    try {
      const payload: any = {
        ...form,
        date: formatDate(date),
        amount: Number(form.amount),
        boxNumber: form.boxNumber ? Number(form.boxNumber) : undefined,
        qrImageUrl: form.qrImageUrl || undefined,
      };
      const { donation, receiptUrl, receiptNumber } = await submitDonation(payload);
      Alert.alert('Donation recorded', `Receipt ${receiptNumber} generated successfully.`, [
        { text: 'View receipt', onPress: () => navigation.navigate('ReceiptPreview', { donationId: donation._id, receiptUrl, receiptNumber, donorName: form.donorName, mobileNumber: form.mobileNumber }) },
        { text: 'New donation', onPress: resetForm },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageScroll>
      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading title="Donor details" caption="Basic contact information used for the record and WhatsApp receipt delivery." />

        <FieldGroup label="Recorded By">
          <InputField value={form.fills} onChangeText={v => setValue('fills', v)} placeholder="Your name" />
        </FieldGroup>

        {/* ─── Date picker ─── */}
        <FieldGroup label="Date">
          <TouchableOpacity activeOpacity={0.88} style={styles.pickerField} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.pickerValue}>{formatDate(date)}</Text>
            <Text style={styles.pickerArrow}>Pick</Text>
          </TouchableOpacity>
        </FieldGroup>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        <FieldGroup label="Name of the Donor">
          <InputField value={form.donorName} onChangeText={v => setValue('donorName', v)} placeholder="Full name" />
        </FieldGroup>

        <FieldGroup label="Mobile Number">
          <InputField value={form.mobileNumber} onChangeText={v => setValue('mobileNumber', v)} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />
        </FieldGroup>

        <FieldGroup label="Address">
          <InputField value={form.address} onChangeText={v => setValue('address', v)} placeholder="Full address" multiline numberOfLines={4} />
        </FieldGroup>
      </SurfaceCard>

      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading title="Donation details" caption="Select the collection type, payment mode, and final amount." />

        <PickerField label="Donation Type" value={form.donationType} placeholder="Select donation type" onPress={() => setActiveModal('donationType')} />

        <PickerField label="Payment Mode" value={form.mode} placeholder="Select payment mode" onPress={() => setActiveModal('mode')} />

        {/* ─── QR screenshot upload — only when mode is QR ─── */}
        {form.mode === 'QR' && (
          <FieldGroup label="QR Payment Screenshot">
            {form.qrImageUrl ? (
              <View style={styles.qrPreviewWrap}>
                <Image source={{ uri: form.qrImageUrl }} style={styles.qrPreview} resizeMode="contain" />
                <TouchableOpacity style={styles.qrRemove} onPress={() => setValue('qrImageUrl', '')}>
                  <Text style={styles.qrRemoveText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.qrButtonRow}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[styles.qrBtn, qrUploading && styles.qrBtnDisabled]}
                  disabled={qrUploading}
                  onPress={() => pickQrImage('camera')}>
                  <Text style={styles.qrBtnText}>📷  Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[styles.qrBtn, qrUploading && styles.qrBtnDisabled]}
                  disabled={qrUploading}
                  onPress={() => pickQrImage('gallery')}>
                  <Text style={styles.qrBtnText}>{qrUploading ? 'Uploading…' : '🖼  Upload from Device'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </FieldGroup>
        )}

        {/* ─── Box number — only when donation type is Noori Box ─── */}
        {form.donationType === 'Noori Box' && (
          <PickerField label="Box Number" value={form.boxNumber} placeholder="Select box number" onPress={() => setActiveModal('boxNumber')} />
        )}

        <FieldGroup label="Amount">
          <InputField value={form.amount} onChangeText={v => setValue('amount', v)} placeholder="0.00" keyboardType="numeric" />
        </FieldGroup>
      </SurfaceCard>

      <SurfaceCard style={styles.submitCard}>
        <Text style={styles.submitTitle}>Ready to generate the receipt?</Text>
        <Text style={styles.submitText}>Once saved, the receipt preview opens immediately and can be shared through WhatsApp.</Text>
        <Button label="Save and generate receipt" loading={loading} onPress={handleSubmit} style={styles.submitButton} />
      </SurfaceCard>

      <SelectModal visible={activeModal === 'donationType'} options={DONATION_TYPES} title="Select donation type" onSelect={v => { setValue('donationType', v); if (v !== 'Noori Box') setValue('boxNumber', ''); }} onClose={() => setActiveModal(null)} />
      <SelectModal visible={activeModal === 'mode'} options={PAYMENT_MODES} title="Select payment mode" onSelect={v => { setValue('mode', v); if (v !== 'QR') setValue('qrImageUrl', ''); }} onClose={() => setActiveModal(null)} />
      <SelectModal visible={activeModal === 'boxNumber'} options={BOX_NUMBERS} title="Select box number" onSelect={v => setValue('boxNumber', v)} onClose={() => setActiveModal(null)} />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  sectionCard: { marginTop: spacing.lg },
  pickerField: {
    minHeight: 54, borderRadius: radius.md, borderWidth: 1, borderColor: palette.border,
    backgroundColor: palette.surfaceMuted, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerValue: { color: palette.text, fontSize: fs(15) },
  pickerPlaceholder: { color: palette.textSoft },
  pickerArrow: { color: palette.primary, fontSize: fs(12), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  // ─── QR ────────────────────────────────────────────────────────────────────────
  qrButtonRow: { flexDirection: 'row', gap: spacing.sm },
  qrBtn: {
    flex: 1, minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: palette.border,
    backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center',
  },
  qrBtnDisabled: { opacity: 0.5 },
  qrBtnText: { color: palette.primaryDark, fontSize: fs(13), fontWeight: '700' },
  qrPreviewWrap: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: palette.surfaceStrong },
  qrPreview: { width: '100%', height: 160 },
  qrRemove: { padding: spacing.sm, alignItems: 'center' },
  qrRemoveText: { color: palette.danger, fontSize: fs(13), fontWeight: '700' },
  // ─── Submit ────────────────────────────────────────────────────────────────────
  submitCard: { marginTop: spacing.lg, backgroundColor: palette.primarySoft, borderColor: '#CFE7D6' },
  submitTitle: { color: palette.primaryDark, fontSize: fs(20), fontWeight: '800' },
  submitText: { color: palette.textMuted, fontSize: fs(14), lineHeight: 21, marginTop: spacing.sm },
  submitButton: { marginTop: spacing.lg },
  // ─── Select modal ─────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: palette.overlay },
  modalSheet: { maxHeight: '72%', backgroundColor: palette.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: spacing.xl },
  modalHandle: { width: 44, height: 5, borderRadius: 999, backgroundColor: palette.borderStrong, alignSelf: 'center', marginTop: spacing.md, marginBottom: spacing.md },
  modalTitle: { color: palette.text, fontSize: fs(18), fontWeight: '800', paddingHorizontal: spacing.screen, paddingBottom: spacing.md },
  modalItem: { paddingHorizontal: spacing.screen, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: palette.border },
  modalItemText: { color: palette.text, fontSize: fs(15), fontWeight: '600' },
});

