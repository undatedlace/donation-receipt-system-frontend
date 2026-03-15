import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { palette, radius, spacing } from '../../theme/theme';

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
        <Text style={[styles.pickerValue, !value && styles.pickerPlaceholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.pickerArrow}>Open</Text>
      </TouchableOpacity>
    </FieldGroup>
  );
}

export default function DonationFormScreen({ navigation }: any) {
  const { user } = useAuth();
  const { submitDonation } = useDonations();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    fills: user?.name || '',
    date: today,
    donorName: '',
    mobileNumber: '',
    address: '',
    donationType: '',
    mode: '',
    boxNumber: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const setValue = (key: string, value: string) =>
    setForm(previous => ({ ...previous, [key]: value }));

  const validate = () => {
    if (!form.fills) {
      return 'Fills field is required';
    }
    if (!form.date) {
      return 'Date is required';
    }
    if (!form.donorName.trim()) {
      return 'Donor name is required';
    }
    if (!form.mobileNumber.trim()) {
      return 'Mobile number is required';
    }
    if (!form.address.trim()) {
      return 'Address is required';
    }
    if (!form.donationType) {
      return 'Please select donation type';
    }
    if (!form.mode) {
      return 'Please select payment mode';
    }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      return 'Valid amount is required';
    }
    return null;
  };

  const resetForm = () =>
    setForm({
      fills: user?.name || '',
      date: today,
      donorName: '',
      mobileNumber: '',
      address: '',
      donationType: '',
      mode: '',
      boxNumber: '',
      amount: '',
    });

  const handleSubmit = async () => {
    const validationMessage = validate();

    if (validationMessage) {
      return Alert.alert('Validation Error', validationMessage);
    }

    setLoading(true);

    try {
      const payload: any = {
        ...form,
        amount: Number(form.amount),
        boxNumber: form.boxNumber ? Number(form.boxNumber) : undefined,
      };

      const { donation, receiptUrl, receiptNumber } = await submitDonation(payload);

      Alert.alert(
        'Donation recorded',
        `Receipt ${receiptNumber} generated successfully.`,
        [
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
          {
            text: 'New donation',
            onPress: resetForm,
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageScroll>
      <PageHeader
        eyebrow="New donation"
        title="Capture donor details and generate the receipt instantly."
        subtitle="The form is organized into clean sections so data entry feels fast, even during busy collection periods."
        trailing={<Badge label={user?.name || 'Recorder'} tone="success" />}
      />

      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading
          title="Donor details"
          caption="Basic contact information used for the record and WhatsApp receipt delivery."
        />

        <FieldGroup label="Recorded By">
          <InputField value={form.fills} onChangeText={value => setValue('fills', value)} placeholder="Your name" />
        </FieldGroup>

        <FieldGroup label="Date">
          <InputField value={form.date} onChangeText={value => setValue('date', value)} placeholder="YYYY-MM-DD" />
        </FieldGroup>

        <FieldGroup label="Name of the Donor">
          <InputField
            value={form.donorName}
            onChangeText={value => setValue('donorName', value)}
            placeholder="Full name"
          />
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
      </SurfaceCard>

      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading
          title="Donation details"
          caption="Select the collection type, payment mode, optional box number, and final amount."
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

        <PickerField
          label="Box Number"
          hint="Optional"
          value={form.boxNumber}
          placeholder="Select box number"
          onPress={() => setActiveModal('boxNumber')}
        />

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
        <Text style={styles.submitTitle}>Ready to generate the receipt?</Text>
        <Text style={styles.submitText}>
          Once saved, the receipt preview opens immediately and can be shared through WhatsApp.
        </Text>
        <Button label="Save and generate receipt" loading={loading} onPress={handleSubmit} style={styles.submitButton} />
      </SurfaceCard>

      <SelectModal
        visible={activeModal === 'donationType'}
        options={DONATION_TYPES}
        title="Select donation type"
        onSelect={value => setValue('donationType', value)}
        onClose={() => setActiveModal(null)}
      />
      <SelectModal
        visible={activeModal === 'mode'}
        options={PAYMENT_MODES}
        title="Select payment mode"
        onSelect={value => setValue('mode', value)}
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
  sectionCard: {
    marginTop: spacing.lg,
  },
  pickerField: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValue: {
    color: palette.text,
    fontSize: 15,
  },
  pickerPlaceholder: {
    color: palette.textSoft,
  },
  pickerArrow: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  submitCard: {
    marginTop: spacing.lg,
    backgroundColor: palette.primarySoft,
    borderColor: '#CFE7D6',
  },
  submitTitle: {
    color: palette.primaryDark,
    fontSize: 20,
    fontWeight: '800',
  },
  submitText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: spacing.xl,
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: palette.borderStrong,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
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
    fontSize: 15,
    fontWeight: '600',
  },
});
