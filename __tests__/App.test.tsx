/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: ({
      children,
      component: Component,
    }: {
      children?: ({navigation}: {navigation: {navigate: jest.Mock}}) => React.ReactNode;
      component?: React.ComponentType<any>;
    }) => {
      if (children) {
        return children({navigation: {navigate: jest.fn()}});
      }
      if (Component) {
        return <Component />;
      }
      return null;
    },
  }),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: ({
      children,
      component: Component,
    }: {
      children?: ({navigation}: {navigation: {navigate: jest.Mock}}) => React.ReactNode;
      component?: React.ComponentType<any>;
    }) => {
      if (children) {
        return children({navigation: {navigate: jest.fn()}});
      }
      if (Component) {
        return <Component />;
      }
      return null;
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
  SafeAreaView: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('react-native-webview', () => ({
  WebView: () => null,
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
