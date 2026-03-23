/**
 * __DEV__ is true when running via Metro bundler (debug build).
 * It is automatically false in a release build.
 *
 * Android emulator uses 10.0.2.2 to reach host machine localhost.
 * iOS simulator uses localhost directly.
 * Real iPhone on WiFi: replace YOUR_MAC_LOCAL_IP with your Mac's IP (e.g. 192.168.1.x)
 * For the hosted backend, DEV_API_URL can also point to PROD_API_URL.
 */
import { Platform } from 'react-native';

const DEV_API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001/api'   // Android emulator → host localhost
    : 'https://donation-receipt-system-backend.onrender.com/api'; // iOS: use hosted backend

const PROD_API_URL = 'https://donation-receipt-system-backend.onrender.com/api';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;
