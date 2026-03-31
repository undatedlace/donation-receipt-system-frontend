/**
 * Always points to the hosted Render.com backend.
 *
 * The emulator-only address (10.0.2.2) only works inside an Android emulator
 * running on the same machine as the dev server — it fails on real devices.
 * Since the backend is deployed on Render.com, we always use the production URL.
 */
export const API_BASE_URL = 'https://donation-receipt-system-backend.onrender.com/api';
