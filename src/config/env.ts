/**
 * __DEV__ is true when running `npx react-native run-android` (Metro bundler / debug build).
 * It is automatically false in a release build (`assembleRelease` / `bundleRelease`).
 */
const DEV_API_URL = 'http://10.0.2.2:3001/api'; // Android emulator → localhost
const PROD_API_URL = 'https://donation-receipt-system-backend.onrender.com/api';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;
