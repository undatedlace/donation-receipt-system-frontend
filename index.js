/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Global unhandled-error handler — logs fatal JS errors instead of silently crashing.
// Prevents "force closed due to an internal error" on Android for unhandled promise rejections.
const defaultHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('[GlobalErrorHandler] isFatal:', isFatal, error);
  defaultHandler(error, isFatal);
});

AppRegistry.registerComponent(appName, () => App);
