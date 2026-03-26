import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import {
  Badge,
  Button,
  SurfaceCard,
} from '../../components/ui/primitives';
import { generateReceipt, getDonation } from '../../services/api';
import { useWhatsApp } from '../../hooks/useWhatsApp';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeContext';
import { fs, type Palette, spacing } from '../../theme/theme';

const toViewerUrl = (url: string) =>
  `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

export default function ReceiptPreviewScreen({ navigation, route }: any) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { donationId, receiptUrl: paramReceiptUrl, receiptNumber: paramReceiptNumber, donorName: paramDonorName, mobileNumber: paramMobileNumber, qrImageUrl: paramQrImageUrl } = route.params || {};
  const { sending, send } = useWhatsApp();
  const { user } = useAuth();
  const canSendWhatsApp = !!user;

  const [sent, setSent] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [viewerError, setViewerError] = useState(false);
  const [webviewKey, setWebviewKey] = useState(0);

  // Donation fields — initialised from route params, then overwritten by API fetch
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(paramReceiptUrl);
  const [qrImageUrl, setQrImageUrl] = useState<string | undefined>(paramQrImageUrl);
  const [receiptNumber, setReceiptNumber] = useState<string | undefined>(paramReceiptNumber);
  const [donorName, setDonorName] = useState<string | undefined>(paramDonorName);
  const [mobileNumber, setMobileNumber] = useState<string | undefined>(paramMobileNumber);
  const [donationType, setDonationType] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState<number | undefined>(undefined);

  // Always fetch the full donation to get latest receiptUrl + qrImageUrl
  useEffect(() => {
    if (!donationId) { setFetching(false); return; }
    (async () => {
      try {
        const { data } = await getDonation(donationId);
        if (data?.receiptUrl) setReceiptUrl(data.receiptUrl);
        if (data?.qrImageUrl) setQrImageUrl(data.qrImageUrl);
        if (data?.receiptNumber) setReceiptNumber(data.receiptNumber);
        if (data?.donorName) setDonorName(data.donorName);
        if (data?.mobileNumber) setMobileNumber(data.mobileNumber);
        if (data?.donationType) setDonationType(data.donationType);
        if (data?.amount) setAmount(data.amount);
      } catch {
        // fall through — use whatever came in through params
      } finally {
        setFetching(false);
      }
    })();
  }, [donationId]);

  const handleSendWhatsApp = async () => {
    const result = await send(donationId);
    if (result.success) {
      setSent(true);
      Alert.alert('Receipt sent', `Receipt sent to ${mobileNumber} via WhatsApp.`);
      return;
    }
    Alert.alert('Send via WhatsApp', result.error || 'Could not send automatically. Open WhatsApp manually?', [
      {
        text: 'Open WhatsApp',
        onPress: () => {
          const number = mobileNumber?.replace(/\D/g, '');
          const text = encodeURIComponent(
            `Assalamu Alaikum ${donorName},\n\nPlease find your donation receipt:\n${receiptUrl}`,
          );
          Linking.openURL(`whatsapp://send?phone=${number}&text=${text}`);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Donation Receipt ${receiptNumber} for ${donorName}:\n${receiptUrl}`,
        url: receiptUrl,
        title: `Receipt ${receiptNumber}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const retryViewer = () => {
    setViewerError(false);
    setWebviewKey(k => k + 1);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const { data } = await generateReceipt(donationId);
      setReceiptUrl(data.url);
      setViewerError(false);
      setWebviewKey(k => k + 1);
    } catch {
      Alert.alert('Error', 'Failed to regenerate receipt');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: spacing.lg + insets.top }]}>
        <TouchableOpacity activeOpacity={0.88} style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>{'‹'}</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>{receiptNumber || 'Receipt Preview'}</Text>
          {donorName ? <Text style={styles.headerSub} numberOfLines={1}>{donorName}{mobileNumber ? ` • ${mobileNumber}` : ''}</Text> : null}
        </View>
        <Badge label={sent ? 'Delivered' : 'Ready'} tone={sent ? 'success' : 'primary'} />
      </View>

      {fetching ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.primary} size="large" />
          <Text style={styles.loadingText}>Loading receipt…</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ── Donation info ── */}
          {(donationType || amount) ? (
            <SurfaceCard style={styles.infoCard}>
              <View style={styles.infoRow}>
                {donationType ? (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Type</Text>
                    <Text style={styles.infoValue}>{donationType}</Text>
                  </View>
                ) : null}
                {amount ? (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Amount</Text>
                    <Text style={styles.infoValueAccent}>Rs {Number(amount).toLocaleString('en-IN')}</Text>
                  </View>
                ) : null}
                {receiptNumber ? (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Receipt No.</Text>
                    <Text style={styles.infoValue}>{receiptNumber}</Text>
                  </View>
                ) : null}
              </View>
            </SurfaceCard>
          ) : null}

          {/* ── PDF Preview ── */}
          <SurfaceCard style={styles.previewCard}>
            <Text style={styles.sectionTitle}>Receipt PDF</Text>
            {receiptUrl && !viewerError ? (
              <View style={styles.webviewWrap}>
                <WebView
                  key={webviewKey}
                  source={{ uri: toViewerUrl(receiptUrl) }}
                  style={styles.webview}
                  javaScriptEnabled
                  domStorageEnabled
                  startInLoadingState
                  renderLoading={() => (
                    <View style={styles.webviewLoader}>
                      <ActivityIndicator color={palette.primary} size="large" />
                      <Text style={styles.webviewLoaderText}>Loading PDF preview…</Text>
                    </View>
                  )}
                  onError={() => setViewerError(true)}
                  onHttpError={e => { if (e.nativeEvent.statusCode >= 400) setViewerError(true); }}
                />
              </View>
            ) : receiptUrl && viewerError ? (
              <View style={styles.fallbackWrap}>
                <Text style={styles.fallbackText}>Preview failed to load. Retry or open the PDF directly.</Text>
                <Button label="Retry Preview" onPress={retryViewer} style={styles.openBtn} />
                <Button label="Open PDF" variant="secondary" onPress={() => Linking.openURL(receiptUrl!)} style={styles.openBtn} />
              </View>
            ) : (
              <View style={styles.fallbackWrap}>
                <Text style={styles.fallbackText}>No receipt PDF found. Generate it below.</Text>
                <Button label="Generate Receipt" loading={regenerating} onPress={handleRegenerate} style={styles.openBtn} />
              </View>
            )}
          </SurfaceCard>

          {/* ── QR Image ── */}
          {qrImageUrl ? (
            <SurfaceCard style={styles.qrCard}>
              <Text style={styles.sectionTitle}>QR Screenshot</Text>
              <Image
                source={{ uri: qrImageUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </SurfaceCard>
          ) : null}

          {/* ── Actions ── */}
          <SurfaceCard style={styles.actionsCard}>
            {canSendWhatsApp ? (
              <Button
                label={sent ? 'Sent to WhatsApp ✓' : 'Send to WhatsApp'}
                variant={sent ? 'success' : 'primary'}
                loading={sending}
                disabled={sent}
                onPress={handleSendWhatsApp}
              />
            ) : null}

            {/* Row 1 — Share + Open PDF (only when receipt exists) */}
            {receiptUrl ? (
              <View style={styles.secondaryRow}>
                <TouchableOpacity
                  activeOpacity={0.82}
                  style={styles.iconBtn}
                  onPress={handleShare}>
                  <Text style={styles.iconBtnIcon}>↑</Text>
                  <Text style={styles.iconBtnLabel}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.82}
                  style={styles.iconBtn}
                  onPress={() => Linking.openURL(receiptUrl!)}>
                  <Text style={styles.iconBtnIcon}>⊞</Text>
                  <Text style={styles.iconBtnLabel}>Open PDF</Text>
                </TouchableOpacity>
                {donationType === 'QR' && qrImageUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.82}
                    style={styles.iconBtn}
                    onPress={() => Linking.openURL(qrImageUrl!)}>
                    <Text style={styles.iconBtnIcon}>◫</Text>
                    <Text style={styles.iconBtnLabel}>Screenshot</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {/* Row 2 — Regenerate full-width */}
            <TouchableOpacity
              activeOpacity={0.82}
              style={[styles.regenBtn, regenerating ? styles.regenBtnDisabled : null]}
              disabled={regenerating}
              onPress={handleRegenerate}>
              {regenerating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.regenBtnIcon}>↺</Text>
              )}
              <Text style={styles.regenBtnLabel}>
                {regenerating ? 'Regenerating…' : 'Regenerate Receipt'}
              </Text>
            </TouchableOpacity>
          </SurfaceCard>

        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(p: Palette) {
  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: p.primary,
  },
  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    backgroundColor: p.primary,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: fs(24),
    fontWeight: '400',
    lineHeight: 28,
    marginTop: -2,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: fs(17),
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fs(12),
    marginTop: 2,
  },
  // ── Body ──
  center: {
    flex: 1,
    backgroundColor: p.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: p.textMuted,
    fontSize: fs(14),
  },
  scroll: {
    flex: 1,
    backgroundColor: p.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: 120,
    gap: spacing.lg,
  },
  // ── Info card ──
  infoCard: {
    paddingVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoItem: {
    flex: 1,
    minWidth: 80,
  },
  infoLabel: {
    color: p.textSoft,
    fontSize: fs(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: p.text,
    fontSize: fs(15),
    fontWeight: '700',
    marginTop: 3,
  },
  infoValueAccent: {
    color: p.primary,
    fontSize: fs(15),
    fontWeight: '700',
    marginTop: 3,
  },
  // ── PDF ──
  previewCard: {
    padding: 0,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: p.text,
    fontSize: fs(13),
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  webviewWrap: {
    height: 440,
  },
  webview: {
    flex: 1,
    backgroundColor: p.surfaceStrong,
  },
  webviewLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: p.surfaceStrong,
    gap: spacing.md,
  },
  webviewLoaderText: {
    color: p.textMuted,
    fontSize: fs(13),
  },
  fallbackWrap: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  fallbackText: {
    color: p.textMuted,
    fontSize: fs(13),
    textAlign: 'center',
    lineHeight: 20,
  },
  openBtn: {
    minWidth: 180,
  },
  // ── QR ──
  qrCard: {
    padding: 0,
    overflow: 'hidden',
  },
  qrImage: {
    width: '100%',
    height: 260,
    backgroundColor: p.surfaceMuted,
  },
  // ── Actions ──
  actionsCard: {
    gap: spacing.md,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: p.surfaceStrong,
    gap: 4,
    minHeight: 64,
  },
  iconBtnIcon: {
    fontSize: fs(22),
    color: p.primary,
    lineHeight: fs(26),
  },
  iconBtnLabel: {
    fontSize: fs(12),
    fontWeight: '600',
    color: p.text,
    textAlign: 'center',
  },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: p.primary,
  },
  regenBtnDisabled: {
    opacity: 0.6,
  },
  regenBtnIcon: {
    fontSize: fs(20),
    color: '#FFFFFF',
    lineHeight: fs(24),
  },
  regenBtnLabel: {
    fontSize: fs(15),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  });
}
