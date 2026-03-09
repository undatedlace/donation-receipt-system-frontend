import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, Linking, Share, ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { sendWhatsApp, generateReceipt } from '../../services/api';

const G = '#1B6B3A';
const GOLD = '#C8963E';

export default function ReceiptPreviewScreen({ route }: any) {
  const { donationId, receiptUrl, receiptNumber, donorName, mobileNumber } = route.params || {};
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(receiptUrl);

  const handleSendWhatsApp = async () => {
    setSending(true);
    try {
      await sendWhatsApp(donationId);
      setSent(true);
      Alert.alert('✅ Sent!', `Receipt sent to ${mobileNumber} via WhatsApp`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to send. WhatsApp may not be connected.';
      // Fallback: open WhatsApp manually
      Alert.alert(
        'Send via WhatsApp',
        'Automated send failed. Open WhatsApp manually?',
        [
          {
            text: 'Open WhatsApp',
            onPress: () => {
              const number = mobileNumber?.replace(/\D/g, '');
              const text = encodeURIComponent(`Assalamu Alaikum ${donorName},\n\nPlease find your donation receipt:\n${currentUrl}`);
              Linking.openURL(`whatsapp://send?phone=${number}&text=${text}`);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    } finally {
      setSending(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Donation Receipt ${receiptNumber} for ${donorName}:\n${currentUrl}`,
        url: currentUrl,
        title: `Receipt ${receiptNumber}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegenerate = async () => {
    try {
      const { data } = await generateReceipt(donationId);
      setCurrentUrl(data.url);
      Alert.alert('Done', 'Receipt regenerated!');
    } catch (e) {
      Alert.alert('Error', 'Failed to regenerate receipt');
    }
  };

  return (
    <View style={styles.container}>
      {/* PDF Preview */}
      <View style={styles.preview}>
        {currentUrl ? (
          <WebView
            source={{ uri: currentUrl }}
            style={{ flex: 1 }}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={G} />
                <Text style={styles.loadingText}>Loading receipt...</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.loadingWrap}>
            <Text style={styles.noReceipt}>No receipt URL available</Text>
            <TouchableOpacity style={styles.regenBtn} onPress={handleRegenerate}>
              <Text style={styles.regenBtnText}>Generate Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <View style={styles.infoRow}>
          <Text style={styles.receiptNum}>{receiptNumber}</Text>
          <Text style={styles.donorInfo}>{donorName} • {mobileNumber}</Text>
        </View>

        <TouchableOpacity
          style={[styles.whatsappBtn, sent && styles.sentBtn]}
          onPress={handleSendWhatsApp}
          disabled={sending || sent}>
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.whatsappBtnText}>
              {sent ? '✓ Sent to WhatsApp' : '📲 Send to WhatsApp'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.secondaryRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
            <Text style={styles.secondaryBtnText}>⬆ Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => currentUrl && Linking.openURL(currentUrl)}>
            <Text style={styles.secondaryBtnText}>⬇ Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleRegenerate}>
            <Text style={styles.secondaryBtnText}>↻ Regen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9F5' },
  preview: { flex: 1, backgroundColor: '#eee' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  noReceipt: { color: '#666', fontSize: 16, marginBottom: 16 },
  regenBtn: { backgroundColor: G, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  regenBtnText: { color: '#fff', fontWeight: 'bold' },
  actions: { backgroundColor: '#fff', padding: 16, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  infoRow: { marginBottom: 12 },
  receiptNum: { fontSize: 15, fontWeight: 'bold', color: G },
  donorInfo: { fontSize: 13, color: '#666', marginTop: 2 },
  whatsappBtn: { backgroundColor: '#25D366', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10 },
  sentBtn: { backgroundColor: '#4CAF50' },
  whatsappBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryRow: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flex: 1, borderWidth: 1.5, borderColor: G, borderRadius: 10, padding: 12, alignItems: 'center' },
  secondaryBtnText: { color: G, fontWeight: '600', fontSize: 13 },
});
