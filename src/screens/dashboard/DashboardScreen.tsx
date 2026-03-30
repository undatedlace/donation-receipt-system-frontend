import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { useFocusEffect } from '@react-navigation/native';
import {
  Badge,
  Button,
  Page,
  PageHeader,
  PageScroll,
  SectionHeading,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { useStats } from '../../hooks/useStats';
import { useTheme } from '../../theme/ThemeContext';
import { fs, type Palette, radius, spacing } from '../../theme/theme';

type ShadowRecord = ReturnType<typeof import('../../theme/theme').createShadows>;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - spacing.screen * 2 - spacing.md * 2 - 8;

const formatCurrency = (value: number) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const todayLabel = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function TrendChart({
  data,
}: {
  data: Array<{ _id: { year: number; month: number }; total: number; count: number }>;
}) {
  const { palette, shadows, isDark } = useTheme();
  const styles = React.useMemo(() => makeStyles(palette, shadows), [palette, shadows]);

  if (!data || data.length === 0) {
    return <Text style={styles.emptyText}>Monthly trend will appear once donations are recorded.</Text>;
  }

  // Always fill the last 6 months — pad months with no data as 0 so the area curve renders
  const now = new Date();
  const monthSlots = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const dataByKey: Record<string, number> = {};
  data.forEach(item => {
    dataByKey[`${item._id.year}-${item._id.month}`] = item.total;
  });
  const items = monthSlots.map(m => ({
    _id: m,
    total: dataByKey[`${m.year}-${m.month}`] ?? 0,
  }));

  const maxValue = Math.max(...items.map(i => i.total), 1);
  const yStepValue = Math.ceil(maxValue / 4 / 100) * 100 || 500;
  const peakIdx = items.reduce(
    (best, item, idx, arr) => (item.total > arr[best].total ? idx : best),
    0,
  );

  const chartData = items.map((item, idx) => ({
    value: item.total,
    label: MONTH_NAMES[(item._id.month - 1 + 12) % 12],
    hideDataPoint: item.total === 0 || idx !== peakIdx,
    dataPointRadius: 6,
    dataPointColor: '#F97316',
    ...(idx === peakIdx && item.total > 0
      ? {
          dataPointLabelComponent: () => (
            <Text style={styles.peakLabel}>
              {item.total >= 1000 ? `${(item.total / 1000).toFixed(1)}k` : String(item.total)}
            </Text>
          ),
          dataPointLabelShiftX: -14,
          dataPointLabelShiftY: -22,
        }
      : {}),
  }));

  return (
    <View style={styles.chartContainer}>
      <LineChart
        areaChart
        data={chartData}
        width={CHART_WIDTH - 32}
        height={180}
        curved
        color="#2B8A6B"
        thickness={2.5}
        startFillColor="rgba(43,138,107,0.40)"
        endFillColor="rgba(43,138,107,0.02)"
        startOpacity={0.85}
        endOpacity={0.05}
        initialSpacing={8}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor={palette.border}
        yAxisTextStyle={styles.chartAxisText}
        xAxisLabelTextStyle={styles.chartAxisText}
        rulesColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(4,94,83,0.08)'}
        rulesType="dashed"
        noOfSections={4}
        maxValue={maxValue + yStepValue}
        stepValue={yStepValue}
        formatYLabel={v => {
          const n = Number(v);
          return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
        }}
        isAnimated
      />
    </View>
  );
}

function UserCollectionChart({
  data,
}: {
  data: Array<{ _id: string; name: string; count: number; total: number }>;
}) {
  const { palette, shadows, isDark } = useTheme();
  const styles = React.useMemo(() => makeStyles(palette, shadows), [palette, shadows]);

  if (!data || data.length === 0) {
    return (
      <Text style={styles.emptyText}>
        User collection data will appear once donations are recorded.
      </Text>
    );
  }

  const maxValue = Math.max(...data.map(d => d.total), 1);
  const barWidth = Math.min(52, Math.floor((CHART_WIDTH - 48) / data.length) - 10);

  const barData = data.map((item, idx) => ({
    value: item.total,
    label: item.name.split(' ')[0],
    frontColor: idx === 0 ? '#2B8A6B' : palette.primary,
    topLabelComponent: () => (
      <Text style={styles.barTopLabel}>
        {item.total >= 1000 ? `${(item.total / 1000).toFixed(0)}k` : String(item.total)}
      </Text>
    ),
  }));

  return (
    <View>
      <View style={styles.chartContainer}>
        <BarChart
          data={barData}
          width={CHART_WIDTH - 32}
          height={180}
          barWidth={barWidth}
          barBorderTopLeftRadius={6}
          barBorderTopRightRadius={6}
          maxValue={Math.ceil((maxValue * 1.3) / 1000) * 1000 || 1000}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={palette.border}
          yAxisTextStyle={styles.chartAxisText}
          xAxisLabelTextStyle={styles.chartAxisText}
          rulesColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(4,94,83,0.08)'}
          rulesType="dashed"
          noOfSections={4}
          isAnimated
          formatYLabel={v => {
            const n = Number(v);
            return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
          }}
        />
      </View>

      {/* Name + amount legend below bars */}
      <View style={styles.userLegendWrap}>
        {data.map((item, idx) => (
          <View key={item._id} style={styles.userLegendRow}>
            <View style={[styles.userLegendDot, { backgroundColor: idx === 0 ? '#2B8A6B' : palette.primary }]} />
            <Text style={styles.userLegendName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.userLegendAmount}>{formatCurrency(item.total)}</Text>
            <Text style={styles.userLegendCount}>{item.count} donations</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function QuickTile({
  title,
  caption,
  tag,
  onPress,
  emphasized = false,
}: {
  title: string;
  caption: string;
  tag: string;
  onPress: () => void;
  emphasized?: boolean;
}) {
  const { palette, shadows } = useTheme();
  const styles = React.useMemo(() => makeStyles(palette, shadows), [palette, shadows]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.quickTile, emphasized ? styles.quickTileAccent : null]}
      onPress={onPress}>
      <View style={[styles.quickTileIcon, emphasized ? styles.quickTileIconAccent : null]}>
        <Text style={[styles.quickTileIconText, emphasized ? styles.quickTileIconTextAccent : null]}>
          {tag}
        </Text>
      </View>
      <Text style={[styles.quickTileTitle, emphasized ? styles.quickTileTitleAccent : null]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.quickTileCaption, emphasized ? styles.quickTileCaptionAccent : null]} numberOfLines={3}>
        {caption}
      </Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const { palette, shadows } = useTheme();
  const styles = React.useMemo(() => makeStyles(palette, shadows), [palette, shadows]);
  const { stats, loading, refreshing, fetchStats, refresh } = useStats();

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats]),
  );

  if (loading && !stats) {
    return (
      <Page header={<PageHeader title="Noori Donation" subtitle="Loading overview" compact />}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </Page>
    );
  }

  const recentDonation = stats?.recentDonations?.[0];
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = roles.includes('admin');
  const roleLabel = roles.includes('admin')
    ? 'Admin'
    : roles.includes('internal-admin')
      ? 'Internal'
      : 'Volunteer';

  return (
    <PageScroll
      header={
        <PageHeader
          title="Noori Donation"
          subtitle={`Assalamu Alaikum, ${user?.name ?? 'Team'}`}
          trailing={<Badge label={roleLabel} tone="success" />}
        />
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[palette.primary]} />
      }
      contentContainerStyle={styles.content}>
      <SurfaceCard style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Collection Summary</Text>
        <Text style={styles.heroAmount}>{formatCurrency(stats?.totalAmount || 0)}</Text>
        <Text style={styles.heroCopy}>Updated for {todayLabel}</Text>

        <View style={styles.heroMetricsRow}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricLabel}>Donations</Text>
            <Text style={styles.heroMetricValue}>{stats?.totalDonations || 0}</Text>
          </View>
          <View style={styles.heroMetricDivider} />
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricLabel}>This Month</Text>
            <Text style={styles.heroMetricValue}>{stats?.monthlyDonations || 0}</Text>
          </View>
        </View>
      </SurfaceCard>

      <View style={styles.tilesWrap}>
        <QuickTile
          title="New Donation"
          caption="Create and issue a receipt"
          tag="ND"
          emphasized
          onPress={() => navigation.navigate('Donate')}
        />
        <QuickTile
          title="History"
          caption="Search and review records"
          tag="HI"
          onPress={() => navigation.navigate('History')}
        />
        <QuickTile
          title="Team"
          caption="Manage user access"
          tag="TM"
          onPress={() => navigation.navigate('Users')}
        />
        <QuickTile
          title="About"
          caption="Profile and app details"
          tag="AB"
          onPress={() => navigation.navigate('Settings')}
        />
        <QuickTile
          title="Recent Receipt"
          caption={recentDonation ? recentDonation.receiptNumber : 'Open the latest preview'}
          tag="RC"
          onPress={() => {
            if (!recentDonation) {
              navigation.navigate('History');
              return;
            }

            navigation.navigate('ReceiptPreview', {
              donationId: recentDonation._id,
              receiptUrl: recentDonation.receiptUrl,
              receiptNumber: recentDonation.receiptNumber,
              donorName: recentDonation.donorName,
              mobileNumber: recentDonation.mobileNumber,
              qrImageUrl: recentDonation.qrImageUrl,
            });
          }}
        />
        <QuickTile
          title="Refresh"
          caption="Pull latest totals"
          tag="RF"
          onPress={refresh}
        />
      </View>

      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading
          title="Monthly Trend"
          caption="Donation amount over the recent collection months."
        />
        <TrendChart data={stats?.monthlyTrend ?? []} />
      </SurfaceCard>

      {isAdmin && (
        <SurfaceCard style={styles.sectionCard}>
          <SectionHeading
            title="Collection by Team Member"
            caption="Total amount collected per user across all donations."
          />
          <UserCollectionChart data={stats?.byUser ?? []} />
        </SurfaceCard>
      )}

      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading
          title="Donation Types"
          caption="Live distribution of your active collection categories."
        />

        {(stats?.byType ?? []).map(item => (
          <View key={item._id} style={styles.progressRow}>
            <View style={styles.progressTextWrap}>
              <Text style={styles.progressLabel}>{item._id}</Text>
              <Text style={styles.progressCaption}>{item.count} entries</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.max(12, (item.total / Math.max(stats?.totalAmount || 1, 1)) * 100),
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressAmount}>{formatCurrency(item.total)}</Text>
          </View>
        ))}

        {stats?.byType?.length ? null : (
          <Text style={styles.emptyText}>Donation totals will appear here after the first records are added.</Text>
        )}
      </SurfaceCard>

      <SurfaceCard style={styles.sectionCard}>
        <SectionHeading
          title="Recent Donations"
          caption="Tap any row to reopen the receipt preview."
          action={<Badge label={`${stats?.recentDonations?.length || 0} items`} />}
        />

        {(stats?.recentDonations ?? []).map((donation, index) => (
          <TouchableOpacity
            key={donation._id}
            activeOpacity={0.88}
            style={[
              styles.recentRow,
              index === (stats?.recentDonations?.length ?? 0) - 1 ? styles.recentRowLast : null,
            ]}
            onPress={() =>
              navigation.navigate('ReceiptPreview', {
                donationId: donation._id,
                receiptUrl: donation.receiptUrl,
                receiptNumber: donation.receiptNumber,
                donorName: donation.donorName,
                mobileNumber: donation.mobileNumber,
                qrImageUrl: donation.qrImageUrl,
              })
            }>
            <View style={styles.recentIndex}>
              <Text style={styles.recentIndexText}>{index + 1}</Text>
            </View>

            <View style={styles.recentInfo}>
              <Text style={styles.recentName}>{donation.donorName}</Text>
              <Text style={styles.recentMeta}>
                {donation.donationType} • {donation.receiptNumber}
              </Text>
            </View>

            <View style={styles.recentRight}>
              <Text style={styles.recentAmount}>{formatCurrency(donation.amount)}</Text>
              <Badge
                label={donation.whatsappSent ? 'Sent' : 'Pending'}
                tone={donation.whatsappSent ? 'success' : 'warning'}
              />
            </View>
          </TouchableOpacity>
        ))}

        {stats?.recentDonations?.length ? null : (
          <Text style={styles.emptyText}>Recent receipts will appear once donations are recorded.</Text>
        )}
      </SurfaceCard>

      <Button
        label="Create Donation Receipt"
        onPress={() => navigation.navigate('Donate')}
        style={styles.bottomButton}
      />
    </PageScroll>
  );
}

function makeStyles(p: Palette, shadows: ShadowRecord) {
  return StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      paddingTop: spacing.xs,
    },
    heroCard: {
      backgroundColor: p.primary,
      borderColor: p.primary,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      ...shadows.md,
    },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: fs(11),
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: fs(30),
    fontWeight: '700',
    letterSpacing: -0.8,
    marginTop: spacing.sm,
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: fs(13),
    marginTop: spacing.xs,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.16)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  heroMetric: {
    flex: 1,
  },
  heroMetricDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: spacing.md,
  },
  heroMetricLabel: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: fs(11),
    fontWeight: '600',
  },
  heroMetricValue: {
    color: '#FFFFFF',
    fontSize: fs(18),
    fontWeight: '700',
    marginTop: 2,
  },
  tilesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  quickTile: {
    width: '47.5%',
    minHeight: 120,
    backgroundColor: p.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: p.border,
    padding: spacing.md,
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  quickTileAccent: {
    backgroundColor: p.primarySoft,
    borderColor: p.accentSoft,
  },
  quickTileIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: p.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTileIconAccent: {
    backgroundColor: p.primary,
  },
  quickTileIconText: {
    color: p.primaryDark,
    fontSize: fs(11),
    fontWeight: '700',
  },
  quickTileIconTextAccent: {
    color: '#FFFFFF',
  },
  quickTileTitle: {
    color: p.text,
    fontSize: fs(15),
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  quickTileTitleAccent: {
    color: p.primaryDark,
  },
  quickTileCaption: {
    color: p.textMuted,
    fontSize: fs(12),
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  quickTileCaptionAccent: {
    color: p.primaryDark,
  },
  sectionCard: {
    marginTop: spacing.lg,
  },
  chartContainer: {
    marginTop: spacing.md,
    marginLeft: -8,
    overflow: 'hidden',
  },
  barTopLabel: {
    color: p.textMuted,
    fontSize: fs(9),
    fontWeight: '700',
    marginBottom: 2,
  },
  peakLabel: {
    color: p.textSoft,
    fontSize: fs(10),
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  chartAxisText: {
    color: p.textSoft,
    fontSize: fs(10),
    fontWeight: '600',
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  chartBarValue: {
    color: p.textMuted,
    fontSize: fs(10),
    fontWeight: '600',
  },
  chartBarTrack: {
    width: '62%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  chartBarActive: {
    backgroundColor: p.primary,
  },
  chartBarInactive: {
    backgroundColor: p.surfaceStrong,
  },
  chartBarLabel: {
    color: p.textSoft,
    fontSize: fs(11),
    fontWeight: '600',
  },
  progressRow: {
    marginTop: spacing.md,
  },
  progressTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  progressLabel: {
    color: p.text,
    fontSize: fs(14),
    fontWeight: '700',
  },
  progressCaption: {
    color: p.textMuted,
    fontSize: fs(11),
  },
  progressBarTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: p.surfaceMuted,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: p.primary,
  },
  progressAmount: {
    color: p.primaryDark,
    fontSize: fs(12),
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: p.border,
    gap: spacing.md,
  },
  recentRowLast: {
    paddingBottom: 0,
  },
  recentIndex: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: p.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentIndexText: {
    color: p.primaryDark,
    fontSize: fs(16),
    fontWeight: '700',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    color: p.text,
    fontSize: fs(15),
    fontWeight: '700',
  },
  recentMeta: {
    color: p.textMuted,
    fontSize: fs(11),
    marginTop: spacing.xs,
  },
  recentRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  recentAmount: {
    color: p.primaryDark,
    fontSize: fs(13),
    fontWeight: '700',
  },
  emptyText: {
    color: p.textSoft,
    fontSize: fs(12),
    lineHeight: 18,
    paddingTop: spacing.md,
  },
  bottomButton: {
    marginTop: spacing.lg,
  },
  userLegendWrap: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  userLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: p.border,
  },
  userLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  userLegendName: {
    flex: 1,
    color: p.text,
    fontSize: fs(13),
    fontWeight: '700',
  },
  userLegendAmount: {
    color: p.primaryDark,
    fontSize: fs(12),
    fontWeight: '700',
  },
  userLegendCount: {
    color: p.textMuted,
    fontSize: fs(11),
    minWidth: 72,
    textAlign: 'right',
  },
  });
}
