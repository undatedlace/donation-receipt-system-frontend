/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
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

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
