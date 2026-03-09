import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Replace with your Railway URL after deployment
export const BASE_URL = 'http://localhost:3001/api';
// For local dev: export const BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator
// For local dev: export const BASE_URL = 'http://localhost:3000/api'; // iOS simulator

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ──────────────────────────────────────────────────────────────
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password });

export const getMe = () => api.get('/auth/me');

// ─── Donations ─────────────────────────────────────────────────────────
export const createDonation = (data: any) => api.post('/donations', data);
export const getDonations = (params?: any) => api.get('/donations', { params });
export const getDonation = (id: string) => api.get(`/donations/${id}`);
export const deleteDonation = (id: string) => api.delete(`/donations/${id}`);

// ─── Receipts ──────────────────────────────────────────────────────────
export const generateReceipt = (donationId: string) =>
  api.post(`/receipts/generate/${donationId}`);

export const getReceiptDownloadUrl = (receiptNumber: string) =>
  `${BASE_URL.replace('/api', '')}/receipts/${receiptNumber}.pdf`;

// ─── WhatsApp ──────────────────────────────────────────────────────────
export const getWhatsAppStatus = () => api.get('/whatsapp/status');
export const getWhatsAppQr = () => api.get('/whatsapp/qr');
export const sendWhatsApp = (donationId: string) =>
  api.post(`/whatsapp/send/${donationId}`);

// ─── Stats ─────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/stats/dashboard');

export default api;
