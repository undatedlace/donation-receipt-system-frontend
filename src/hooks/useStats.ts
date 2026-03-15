import { useState, useCallback } from 'react';
import { getDashboardStats } from '../services/api';

export interface DonationTypeStat {
  _id: string;
  count: number;
  total: number;
}

export interface PaymentModeStat {
  _id: string;
  count: number;
  total: number;
}

export interface RecentDonation {
  _id: string;
  donorName: string;
  amount: number;
  donationType: string;
  receiptNumber: string;
  receiptUrl?: string;
  mobileNumber?: string;
  whatsappSent: boolean;
  createdAt: string;
}

export interface MonthlyTrendItem {
  _id: { year: number; month: number };
  count: number;
  total: number;
}

export interface DashboardStats {
  totalDonations: number;
  totalAmount: number | any;
  monthlyDonations: number;
  byType: DonationTypeStat[];
  byMode: PaymentModeStat[];
  recentDonations: RecentDonation[];
  monthlyTrend: MonthlyTrendItem[];
}

export function useStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refreshing, error, fetchStats, refresh };
}
