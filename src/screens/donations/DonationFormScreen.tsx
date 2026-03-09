import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Modal, FlatList, Platform,
} from 'react-native';
import { createDonation, generateReceipt } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const G = '#1B6B3A';
const GOLD = '#C8963E';

const DONATION_TYPES = ['Zakat', 'Fitra', 'Atiyaat', 'Noori Box'];
const PAYMENT_MODES = ['Cheque', 'Bank Transfer', 'QR', 'Cash'];
const BOX_NUMBERS = Array.from({ length: 100 }, (_, i) => String(i + 1));

interface SelectModalProps {
  visible: boolean;
  options: string[];
  onSelect: (val: string) => void;
  onClose: () => void;
  title: string;
}

function SelectModal({ visible, options, onSelect, onClose, title }: SelectModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => { onSelect(item); onClose(); }}>
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function DonationFormScreen({ navigation }: any) {
  const { user } = useAuth();
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

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    if (!form.fills) return 'Fills field is required';
    if (!form.date) return 'Date is required';
    if (!form.donorName.trim()) return 'Donor name is required';
    if (!form.mobileNumber.trim()) return 'Mobile number is required';
    if (!form.address.trim()) return 'Address is required';
    if (!form.donationType) return 'Please select donation type';
    if (!form.mode) return 'Please select payment mode';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return 'Valid amount is required';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) return Alert.alert('Validation Error', error);

    setLoading(true);
    try {
      const payload: any = {
        ...form,
        amount: Number(form.amount),
        boxNumber: form.boxNumber ? Number(form.boxNumber) : undefined,
      };

      const { data: donation } = await createDonation(payload);
      const { data: receipt } = await generateReceipt(donation._id);

      Alert.alert(
        '✅ Donation Recorded!',
        `Receipt ${receipt.receiptNumber} generated successfully`,
        [
          {
            text: 'View Receipt',
            onPress: () => navigation.navigate('ReceiptPreview', {
              donationId: donation._id,
              receiptUrl: receipt.url,
              receiptNumber: receipt.receiptNumber,
              donorName: form.donorName,
              mobileNumber: form.mobileNumber,
            }),
          },
          {
            text: 'New Donation',
            onPress: () => setForm({ fills: user?.name || '', date: today, donorName: '', mobileNumber: '', address: '', donationType: '', mode: '', boxNumber: '', amount: '' }),
          },
        ],
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  const Input = ({ label, field, ...props }: any) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[field as keyof typeof form]}
        onChangeText={(v) => set(field, v)}
        placeholderTextColor="#AAA"
        {...props}
      />
    </View>
  );

  const Picker = ({ label, field, options, title }: any) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.input, styles.picker]} onPress={() => setActiveModal(field)}>
        <Text style={{ color: form[field as keyof typeof form] ? '#333' : '#AAA', fontSize: 15 }}>
          {form[field as keyof typeof form] || `Select ${label}`}
        </Text>
        <Text style={{ color: '#AAA' }}>▾</Text>
      </TouchableOpacity>
      <SelectModal
        visible={activeModal === field}
        options={options}
        title={title}
        onSelect={(val) => set(field, val)}
        onClose={() => setActiveModal(null)}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.headerArabic}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
        <Text style={styles.headerTitle}>New Donation Entry</Text>
      </View>

      <View style={styles.form}>
        <Input label="Fills (Recorded By)" field="fills" placeholder="Your name" />
        <Input label="Date" field="date" placeholder="YYYY-MM-DD" />
        <Input label="Name of the Donor" field="donorName" placeholder="Full name" />
        <Input label="Mobile Number" field="mobileNumber" placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
            value={form.address}
            onChangeText={(v) => set('address', v)}
            placeholder="Full address"
            placeholderTextColor="#AAA"
            multiline
            numberOfLines={3}
          />
        </View>

        <Picker label="Donation Type" field="donationType" options={DONATION_TYPES} title="Select Donation Type" />
        <Picker label="Payment Mode" field="mode" options={PAYMENT_MODES} title="Select Payment Mode" />
        <Picker label="Box Number (if applicable)" field="boxNumber" options={BOX_NUMBERS} title="Select Box Number" />

        <Input label="Amount (₹)" field="amount" placeholder="0.00" keyboardType="numeric" />

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>💚 Save & Generate Receipt</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9F5' },
  header: { backgroundColor: G, padding: 20, alignItems: 'center' },
  headerArabic: { color: GOLD, fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  form: { padding: 16 },
  fieldWrap: { marginBottom: 4 },
  label: { color: G, fontWeight: '600', fontSize: 13, marginBottom: 5, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: '#D0E8D8', borderRadius: 10, padding: 14, fontSize: 15, color: '#333', backgroundColor: '#fff' },
  picker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btn: { backgroundColor: G, borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: 30 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: G, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  modalItemText: { fontSize: 15, color: '#333' },
});
