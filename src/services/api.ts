import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

export const BASE_URL = API_BASE_URL;

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 }); // 15 s timeout

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ──────────────────────────────────────────────────────────────
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  roles?: string[],
) => api.post('/auth/register', { firstName, lastName, email, password, roles });

export const getMe = () => api.get('/auth/me');

// ─── Donations ─────────────────────────────────────────────────────────
export const createDonation = (data: any) => api.post('/donations', data);
export const getDonations = (params?: any) => api.get('/donations', { params });
export const getDonation = (id: string) => api.get(`/donations/${id}`);
export const updateDonation = (id: string, data: any) => api.patch(`/donations/${id}`, data);
export const deleteDonation = (id: string) => api.delete(`/donations/${id}`);

// ─── Receipts ──────────────────────────────────────────────────────────
export const generateReceipt = (donationId: string) =>
  api.post(`/receipts/generate/${donationId}`);

/** Returns the backend redirect URL for a receipt PDF stored on S3. */
export const getReceiptDownloadUrl = (receiptNumber: string) =>
  `${BASE_URL}/receipts/download/${receiptNumber}`;

// ─── WhatsApp ──────────────────────────────────────────────────────────
export const getWhatsAppStatus = () => api.get('/whatsapp/status');
export const getWhatsAppQr = () => api.get('/whatsapp/qr');
export const sendWhatsApp = (donationId: string) =>
  api.post(`/whatsapp/send/${donationId}`);

// ─── Stats ─────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/stats/dashboard');

// ─── Users (Admin only) ────────────────────────────────────────────────
export const getUsers = () => api.get('/users');
export const createUser = (data: any) => api.post('/users', data);
export const updateUser = (id: string, data: any) => api.patch(`/users/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);
// ─── QR Screenshot upload ──────────────────────────────────────────────────
export const uploadQrImage = async (asset: {
  uri: string;
  type?: string;
  fileName?: string;
}): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    name: asset.fileName ?? 'qr.jpg',
  } as any);
  const { data } = await api.post('/donations/upload-qr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
};
export default api;
