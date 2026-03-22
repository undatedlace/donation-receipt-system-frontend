import { useState, useCallback } from 'react';
import { createDonation, deleteDonation, generateReceipt, getDonation, getDonations, updateDonation } from '../services/api';

export interface Donation {
  _id: string;
  fills: string;
  date: string;
  donorName: string;
  mobileNumber: string;
  address: string;
  donationType: string;
  mode: string;
  boxNumber?: number;
  amount: number;
  receiptNumber: string;
  receiptUrl?: string;
  qrImageUrl?: string;
  whatsappSentAt?: string;
  createdAt: string;
}

export interface DonationListResult {
  data: Donation[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateDonationPayload {
  fills: string;
  date: string;
  donorName: string;
  mobileNumber: string;
  address: string;
  donationType: string;
  mode: string;
  boxNumber?: number;
  amount: number;
}

export interface DonationsFilter {
  page?: number;
  limit?: number;
  search?: string;
  donationType?: string;
  startDate?: string;
  endDate?: string;
}

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = useCallback(
    async (filter: DonationsFilter = {}, reset = true) => {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const params: DonationsFilter = { limit: 20, ...filter };
        const { data } = await getDonations(params);
        const items: Donation[] = Array.isArray(data?.data) ? data.data : [];

        setDonations(prev => (reset ? items : [...prev, ...items]));
        setPage(data?.page ?? 1);
        setTotalPages(data?.pages ?? 1);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load donations');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [],
  );

  const refresh = useCallback(
    (filter: DonationsFilter = {}) => {
      setRefreshing(true);
      fetchDonations({ ...filter, page: 1 }, true);
    },
    [fetchDonations],
  );

  const loadMore = useCallback(
    (filter: DonationsFilter = {}) => {
      if (loadingMore || page >= totalPages) {
        return;
      }
      fetchDonations({ ...filter, page: page + 1 }, false);
    },
    [fetchDonations, loadingMore, page, totalPages],
  );

  const submitDonation = useCallback(
    async (payload: CreateDonationPayload): Promise<{ donation: Donation; receiptUrl: string; receiptNumber: string }> => {
      const { data: donation } = await createDonation(payload);
      const { data: receipt } = await generateReceipt(donation._id);
      return { donation, receiptUrl: receipt.url, receiptNumber: receipt.receiptNumber };
    },
    [],
  );

  const removeDonation = useCallback(async (id: string): Promise<void> => {
    await deleteDonation(id);
    setDonations(prev => prev.filter(d => d._id !== id));
  }, []);

  const editDonation = useCallback(async (id: string, payload: Partial<CreateDonationPayload & { date: string }>): Promise<Donation> => {
    const { data } = await updateDonation(id, payload);
    setDonations(prev => prev.map(d => d._id === id ? { ...d, ...data } : d));
    return data;
  }, []);

  const fetchOne = useCallback(async (id: string): Promise<Donation> => {
    const { data } = await getDonation(id);
    return data;
  }, []);

  return {
    donations,
    loading,
    loadingMore,
    refreshing,
    page,
    totalPages,
    error,
    fetchDonations,
    refresh,
    loadMore,
    submitDonation,
    removeDonation,
    editDonation,
    fetchOne,
  };
}
