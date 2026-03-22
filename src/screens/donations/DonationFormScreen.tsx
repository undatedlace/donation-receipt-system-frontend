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
  PageHeader,
  PageScroll,
  SectionHeading,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { useDonations } from '../../hooks/useDonations';
import { uploadQrImage } from '../../services/api';
import { fs, palette, radius, shadows, spacing } from '../../theme/theme';

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
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}>
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
  label,
  value,
  placeholder,
  onPress,
  hint,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  hint?: string;
}) {
  return (
    <FieldGroup label={label} hint={hint}>
      <TouchableOpacity activeOpacity={0.88} style={styles.pickerField} onPress={onPress}>
        <Text style={[styles.pickerValue, !value ? styles.pickerPlaceholder : null]}>
          {value || placeholder}
        </Text>
        <View style={styles.pickerAction}>
          <Text style={styles.pickerActionText}>Select</Text>
        </View>
      </TouchableOpacity>
    </FieldGroup>
  );
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default function DonationFormScreen({ navigation }: any) {
  const { user } = useAuth();
  const { submitDonation } = useDonations();
  const today = new Date();

  const [form, setForm] = useState({
    fills: user?.name || '',
    donorName: '',
    mobileNumber: '',
    address: '',
    zone: 'Tooba Zone',
    branch: 'Jogeshwari West',
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
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      setDate(selected);
    }
  };

  const pickQrImage = async (source: 'camera' | 'gallery') => {
    const fn = source === 'camera' ? launchCamera : launchImageLibrary;
    const result = await fn({ mediaType: 'photo', quality: 0.8, includeBase64: false });

    if (result.didCancel || result.errorCode) {
      return;
    }

    const asset = result.assets?.[0];

    if (!asset?.uri) {
      return;
    }

    setQrUploading(true);

    try {
      const url = await uploadQrImage({
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName,
      });
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
    setForm({
      fills: user?.name || '',
      donorName: '',
      mobileNumber: '',
      address: '',
      zone: 'Tooba Zone',
      branch: 'Jogeshwari West',
      donationType: '',
      mode: '',
      boxNumber: '',
      amount: '',
      qrImageUrl: '',
    });
    setDate(new Date());
  };

  const handleSubmit = async () => {
    const err = validate();

    if (err) {
      return Alert.alert('Validation Error', err);
    }

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
        {
          text: 'View receipt',
          onPress: () =>
            navigation.navigate('ReceiptPreview', {
              donationId: donation._id,
              receiptUrl,
              receiptNumber,
              donorName: form.donorName,
              mobileNumber: form.mobileNumber,
            }),
        },
        { text: 'New donation', onPress: resetForm },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageScroll
      header={
        <PageHeader
          title="New Donation"
          subtitle="Capture donor details and generate the receipt instantly."
          trailing={<Badge label="Live" tone="success" />}
        />
      }
      contentContainerStyle={styles.content}>
      <SurfaceCard style={styles.heroCard}>
        <Text style={styles.heroTitle}>Receipt Ready Flow</Text>
        <Text style={styles.heroText}>
          Fill the donor details, confirm payment mode, and the preview opens immediately after save.
        </Text>

        <View style={styles.heroPills}>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillLabel}>Date</Text>
            <Text style={styles.heroPillValue}>{formatDate(date)}</Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillLabel}>Filled By</Text>
            <Text style={styles.heroPillValue}>{form.fills || 'Pending'}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading
          title="Donor Details"
          caption="Basic information used for the record and WhatsApp receipt delivery."
        />

        <FieldGroup label="Recorded By">
          <InputField value={form.fills} onChangeText={value => setValue('fills', value)} placeholder="Your name" />
        </FieldGroup>

        <FieldGroup label="Date">
          <TouchableOpacity activeOpacity={0.88} style={styles.pickerField} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.pickerValue}>{formatDate(date)}</Text>
            <View style={styles.pickerAction}>
              <Text style={styles.pickerActionText}>Pick</Text>
            </View>
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

        <FieldGroup label="Donor Name">
          <InputField value={form.donorName} onChangeText={value => setValue('donorName', value)} placeholder="Full name" />
        </FieldGroup>

        <FieldGroup label="Mobile Number">
          <InputField
            value={form.mobileNumber}
            onChangeText={value => setValue('mobileNumber', value)}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
          />
        </FieldGroup>

        <FieldGroup label="Address">
          <InputField
            value={form.address}
            onChangeText={value => setValue('address', value)}
            placeholder="Full address"
            multiline
            numberOfLines={4}
          />
        </FieldGroup>

        <FieldGroup label="Zone">
          <InputField
            value={form.zone}
            onChangeText={value => setValue('zone', value)}
            placeholder="e.g. Zone A, North Zone"
          />
        </FieldGroup>

        <FieldGroup label="Branch">
          <InputField
            value={form.branch}
            onChangeText={value => setValue('branch', value)}
            placeholder="e.g. Mira Road Branch"
          />
        </FieldGroup>
      </SurfaceCard>

      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading
          title="Collection Details"
          caption="Choose the category, payment mode, and amount for the receipt."
        />

        <PickerField
          label="Donation Type"
          value={form.donationType}
          placeholder="Select donation type"
          onPress={() => setActiveModal('donationType')}
        />

        <PickerField
          label="Payment Mode"
          value={form.mode}
          placeholder="Select payment mode"
          onPress={() => setActiveModal('mode')}
        />

        {form.mode === 'QR' && (
          <FieldGroup label="QR Payment Screenshot" hint="Required for QR mode">
            {form.qrImageUrl ? (
              <View style={styles.qrPreviewWrap}>
                <Image source={{ uri: form.qrImageUrl }} style={styles.qrPreview} resizeMode="cover" />
                <View style={styles.qrPreviewFooter}>
                  <Badge label="Uploaded" tone="success" />
                  <TouchableOpacity onPress={() => setValue('qrImageUrl', '')}>
                    <Text style={styles.qrRemoveText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.qrButtonRow}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[styles.qrBtn, qrUploading ? styles.qrBtnDisabled : null]}
                  disabled={qrUploading}
                  onPress={() => pickQrImage('camera')}>
                  <Text style={styles.qrBtnTitle}>Take Photo</Text>
                  <Text style={styles.qrBtnText}>Use the camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[styles.qrBtn, qrUploading ? styles.qrBtnDisabled : null]}
                  disabled={qrUploading}
                  onPress={() => pickQrImage('gallery')}>
                  <Text style={styles.qrBtnTitle}>{qrUploading ? 'Uploading' : 'Upload Image'}</Text>
                  <Text style={styles.qrBtnText}>Choose from device</Text>
                </TouchableOpacity>
              </View>
            )}
          </FieldGroup>
        )}

        {form.donationType === 'Noori Box' && (
          <PickerField
            label="Box Number"
            value={form.boxNumber}
            placeholder="Select box number"
            onPress={() => setActiveModal('boxNumber')}
          />
        )}

        <FieldGroup label="Amount">
          <InputField
            value={form.amount}
            onChangeText={value => setValue('amount', value)}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </FieldGroup>
      </SurfaceCard>

      <SurfaceCard style={styles.submitCard}>
        <Text style={styles.submitTitle}>Generate Receipt</Text>
        <Text style={styles.submitText}>
          Once saved, the app opens the receipt preview and makes it ready to share through WhatsApp.
        </Text>
        <Button
          label="Save and Generate Receipt"
          loading={loading}
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </SurfaceCard>

      <SelectModal
        visible={activeModal === 'donationType'}
        options={DONATION_TYPES}
        title="Select donation type"
        onSelect={value => {
          setValue('donationType', value);
          if (value !== 'Noori Box') {
            setValue('boxNumber', '');
          }
        }}
        onClose={() => setActiveModal(null)}
      />
      <SelectModal
        visible={activeModal === 'mode'}
        options={PAYMENT_MODES}
        title="Select payment mode"
        onSelect={value => {
          setValue('mode', value);
          if (value !== 'QR') {
            setValue('qrImageUrl', '');
          }
        }}
        onClose={() => setActiveModal(null)}
      />
      <SelectModal
        visible={activeModal === 'boxNumber'}
        options={BOX_NUMBERS}
        title="Select box number"
        onSelect={value => setValue('boxNumber', value)}
        onClose={() => setActiveModal(null)}
      />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xs,
  },
  heroCard: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    ...shadows.md,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: fs(21),
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  heroText: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: fs(13),
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  heroPills: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  heroPill: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.16)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  heroPillLabel: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: fs(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroPillValue: {
    color: '#FFFFFF',
    fontSize: fs(14),
    fontWeight: '700',
    marginTop: 4,
  },
  sectionCard: {
    marginTop: spacing.xl,
  },
  pickerField: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValue: {
    color: palette.text,
    fontSize: fs(14),
    flex: 1,
  },
  pickerPlaceholder: {
    color: palette.textSoft,
  },
  pickerAction: {
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pickerActionText: {
    color: palette.primaryDark,
    fontSize: fs(11),
    fontWeight: '700',
  },
  qrButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  qrBtn: {
    flex: 1,
    minHeight: 100,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
  },
  qrBtnDisabled: {
    opacity: 0.55,
  },
  qrBtnTitle: {
    color: palette.primaryDark,
    fontSize: fs(14),
    fontWeight: '700',
  },
  qrBtnText: {
    color: palette.textMuted,
    fontSize: fs(11),
    lineHeight: 16,
  },
  qrPreviewWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.surfaceMuted,
  },
  qrPreview: {
    width: '100%',
    height: 192,
  },
  qrPreviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  qrRemoveText: {
    color: '#A01919',
    fontSize: fs(13),
    fontWeight: '700',
  },
  submitCard: {
    marginTop: spacing.xl,
    backgroundColor: palette.primarySoft,
    borderColor: palette.accentSoft,
  },
  submitTitle: {
    color: palette.primaryDark,
    fontSize: fs(20),
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  submitText: {
    color: palette.textMuted,
    fontSize: fs(13),
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: palette.overlay,
  },
  modalSheet: {
    maxHeight: '72%',
    backgroundColor: palette.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xl,
  },
  modalHandle: {
    width: 46,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.borderStrong,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: palette.text,
    fontSize: fs(18),
    fontWeight: '700',
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
  },
  modalItem: {
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  modalItemText: {
    color: palette.text,
    fontSize: fs(14),
    fontWeight: '600',
  },
});
