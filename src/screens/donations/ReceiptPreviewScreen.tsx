import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Badge,
  Button,
  EmptyState,
  Page,
  PageHeader,
  SurfaceCard,
} from '../../components/ui/primitives';
import { generateReceipt } from '../../services/api';
import { useWhatsApp } from '../../hooks/useWhatsApp';
import { useAuth } from '../../hooks/useAuth';
import { palette, spacing } from '../../theme/theme';

/** Wraps an S3 PDF URL in Google Docs Viewer so Android WebView can render it. */
const toViewerUrl = (url: string) =>
  `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

export default function ReceiptPreviewScreen({ route }: any) {
  const { donationId, receiptUrl, receiptNumber, donorName, mobileNumber } = route.params || {};
  const { sending, send } = useWhatsApp();
  const { user } = useAuth();
  const canSendWhatsApp = Array.isArray(user?.roles)
    ? user.roles.some(r => r === 'admin' || r === 'internal-admin')
    : user?.role !== 'user';
  const [sent, setSent] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(receiptUrl);
  const [viewerError, setViewerError] = useState(false);

  const handleSendWhatsApp = async () => {
    const result = await send(donationId);

    if (result.success) {
      setSent(true);
      Alert.alert('Receipt sent', `Receipt sent to ${mobileNumber} via WhatsApp.`);
    } else {
      // Twilio failed — offer manual fallback
      Alert.alert('Send via WhatsApp', result.error || 'Could not send automatically. Open WhatsApp manually?', [
        {
          text: 'Open WhatsApp',
          onPress: () => {
            const number = mobileNumber?.replace(/\D/g, '');
            const text = encodeURIComponent(
              `Assalamu Alaikum ${donorName},\n\nPlease find your donation receipt:\n${currentUrl}`,
            );
            Linking.openURL(`whatsapp://send?phone=${number}&text=${text}`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Donation Receipt ${receiptNumber} for ${donorName}:\n${currentUrl}`,
        url: currentUrl,
        title: `Receipt ${receiptNumber}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);

    try {
      const { data } = await generateReceipt(donationId);
      setCurrentUrl(data.url);
      setViewerError(false);
      Alert.alert('Receipt regenerated', 'The preview has been refreshed with the latest receipt.');
    } catch {
      Alert.alert('Error', 'Failed to regenerate receipt');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Page>
      <View style={styles.container}>
        <PageHeader
          compact
          eyebrow="Receipt"
          title={receiptNumber || 'Draft preview'}
          subtitle={`${donorName || 'Unknown donor'}${mobileNumber ? ` • ${mobileNumber}` : ''}`}
          trailing={
            <Badge
              label={sent ? 'Delivered' : 'Ready to share'}
              tone={sent ? 'success' : 'primary'}
            />
          }
        />

        <SurfaceCard style={styles.previewCard}>
          {currentUrl && !viewerError ? (
            <WebView
              source={{ uri: toViewerUrl(currentUrl) }}
              style={styles.webview}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loaderWrap}>
                  <Text style={styles.loaderTitle}>Loading receipt preview…</Text>
                  <Text style={styles.loaderText}>Fetching from Google Docs Viewer.</Text>
                </View>
              )}
              onError={() => setViewerError(true)}
              onHttpError={(e) => {
                if (e.nativeEvent.statusCode >= 400) setViewerError(true);
              }}
            />
          ) : currentUrl && viewerError ? (
            <View style={styles.loaderWrap}>
              <Text style={styles.loaderTitle}>Preview unavailable</Text>
              <Text style={styles.loaderText}>
                The inline viewer couldn't load. Open the PDF directly in your browser.
              </Text>
              <Button
                label="Open PDF in browser"
                onPress={() => Linking.openURL(currentUrl)}
                style={styles.regenButton}
              />
            </View>
          ) : (
            <View style={styles.emptyPreview}>
              <EmptyState
                title="No receipt URL available"
                subtitle="Generate the receipt again to refresh the preview and download link."
              />
              <Button
                label="Generate receipt"
                loading={regenerating}
                onPress={handleRegenerate}
                style={styles.regenButton}
              />
            </View>
          )}
        </SurfaceCard>

        <SurfaceCard style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Actions</Text>
          <Text style={styles.actionsSubtitle}>
            Send the receipt through WhatsApp, share the link, or regenerate the PDF.
          </Text>

          {canSendWhatsApp && (
            <Button
              label={sent ? 'Sent to WhatsApp' : 'Send to WhatsApp'}
              variant={sent ? 'success' : 'primary'}
              loading={sending}
              disabled={sent}
              onPress={handleSendWhatsApp}
              style={styles.mainAction}
            />
          )}

          <View style={styles.secondaryRow}>
            <Button label="Share" variant="secondary" onPress={handleShare} style={styles.secondaryAction} />
            <Button
              label="Download"
              variant="ghost"
              onPress={() => currentUrl && Linking.openURL(currentUrl)}
              style={styles.secondaryAction}
            />
            <Button
              label="Regenerate"
              variant="ghost"
              loading={regenerating}
              onPress={handleRegenerate}
              style={styles.secondaryAction}
            />
          </View>
        </SurfaceCard>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screen,
    gap: spacing.lg,
  },
  previewCard: {
    flex: 1,
    overflow: 'hidden',
    padding: 0,
  },
  webview: {
    flex: 1,
    backgroundColor: palette.surfaceStrong,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceStrong,
    paddingHorizontal: spacing.xl,
  },
  loaderTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  loaderText: {
    color: palette.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  emptyPreview: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  regenButton: {
    marginTop: spacing.lg,
  },
  actionsCard: {
    gap: spacing.sm,
  },
  actionsTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  actionsSubtitle: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  mainAction: {
    marginTop: spacing.sm,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secondaryAction: {
    flex: 1,
  },
});
