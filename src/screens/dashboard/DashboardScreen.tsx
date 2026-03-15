import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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
  Page,
  PageScroll,
  PageHeader,
  SectionHeading,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardStats } from '../../services/api';
import { palette, radius, shadows, spacing } from '../../theme/theme';

const formatCurrency = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function MetricCard({
  label,
  value,
  accent,
  muted = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <SurfaceCard
      style={[
        styles.metricCard,
        accent && styles.metricCardAccent,
        muted && styles.metricCardMuted,
      ]}>
      <Text style={[styles.metricValue, accent && styles.metricValueAccent]}>{value}</Text>
      <Text style={[styles.metricLabel, accent && styles.metricLabelAccent]}>{label}</Text>
    </SurfaceCard>
  );
}

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <Page>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </Page>
    );
  }

  return (
    <PageScroll
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />
      }>
      <PageHeader
        eyebrow="Dashboard"
        title={`Assalamu Alaikum, ${user?.name ?? 'Team'}`}
        subtitle="Track donations, review recent activity, and jump back into receipt generation."
        trailing={<Badge label="Live data" tone="success" />}
      />

      <View style={styles.metricsGrid}>
        <MetricCard label="Total raised" value={formatCurrency(stats?.totalAmount)} accent />
        <MetricCard label="Donations" value={String(stats?.totalDonations || 0)} />
        <MetricCard label="This month" value={String(stats?.monthlyDonations || 0)} />
        <SurfaceCard style={styles.quickActionCard}>
          <Text style={styles.quickActionTitle}>New donation</Text>
          <Text style={styles.quickActionText}>Start a fresh receipt in one step.</Text>
          <Button label="Create receipt" onPress={() => navigation.navigate('Donate')} style={styles.quickActionButton} />
        </SurfaceCard>
      </View>

      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading
          title="By donation type"
          caption="A quick distribution snapshot across your active categories."
        />
        {(stats?.byType ?? []).map((item: any, index: number) => (
          <View
            key={item._id}
            style={[styles.listRow, index === (stats?.byType?.length ?? 0) - 1 && styles.listRowLast]}>
            <View>
              <Text style={styles.listLabel}>{item._id}</Text>
              <Text style={styles.listCaption}>{item.count} donations</Text>
            </View>
            <Badge label={formatCurrency(item.total)} tone="primary" />
          </View>
        ))}
        {stats?.byType?.length ? null : (
          <Text style={styles.emptyText}>Donation type totals will appear here after records are added.</Text>
        )}
      </SurfaceCard>

      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading
          title="Recent donations"
          caption="Tap any record to open the receipt preview and share flow."
          action={<Badge label={`${stats?.recentDonations?.length || 0} items`} />}
        />
        {(stats?.recentDonations ?? []).map((donation: any, index: number) => (
          <TouchableOpacity
            key={donation._id}
            activeOpacity={0.9}
            style={[
              styles.recentRow,
              index === (stats?.recentDonations?.length ?? 0) - 1 && styles.listRowLast,
            ]}
            onPress={() =>
              navigation.navigate('ReceiptPreview', {
                donationId: donation._id,
                receiptUrl: donation.receiptUrl,
                receiptNumber: donation.receiptNumber,
                donorName: donation.donorName,
                mobileNumber: donation.mobileNumber,
              })
            }>
            <View style={styles.recentLeft}>
              <Text style={styles.recentName}>{donation.donorName}</Text>
              <Text style={styles.recentMeta}>
                {donation.donationType} • {donation.receiptNumber}
              </Text>
            </View>
            <View style={styles.recentRight}>
              <Text style={styles.recentAmount}>{formatCurrency(donation.amount)}</Text>
              <Badge
                label={donation.whatsappSent ? 'WhatsApp sent' : 'Pending send'}
                tone={donation.whatsappSent ? 'success' : 'warning'}
              />
            </View>
          </TouchableOpacity>
        ))}
        {stats?.recentDonations?.length ? null : (
          <Text style={styles.emptyText}>Recent donations will appear once you start recording entries.</Text>
        )}
      </SurfaceCard>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '47%',
    minHeight: 124,
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
  },
  metricCardAccent: {
    backgroundColor: palette.primaryDark,
    borderColor: palette.primaryDark,
    ...shadows.md,
  },
  metricCardMuted: {
    backgroundColor: palette.surfaceStrong,
  },
  metricValue: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '800',
  },
  metricValueAccent: {
    color: palette.surface,
  },
  metricLabel: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  metricLabelAccent: {
    color: 'rgba(244, 248, 243, 0.84)',
  },
  quickActionCard: {
    width: '47%',
    minHeight: 124,
    justifyContent: 'space-between',
    backgroundColor: palette.primarySoft,
  },
  quickActionTitle: {
    color: palette.primaryDark,
    fontSize: 18,
    fontWeight: '800',
  },
  quickActionText: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  quickActionButton: {
    minHeight: 42,
    borderRadius: radius.sm,
    marginTop: spacing.md,
  },
  sectionCard: {
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  listRowLast: {
    paddingBottom: 0,
  },
  listLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  listCaption: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  recentLeft: {
    flex: 1,
  },
  recentRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  recentName: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  recentMeta: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  recentAmount: {
    color: palette.primaryDark,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: spacing.md,
  },
});
