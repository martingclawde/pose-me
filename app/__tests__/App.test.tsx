/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => (
    <>{children}</>
  ),
  SafeAreaView: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

test('renders Pose Me library shell', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });

  expect(JSON.stringify(tree!.toJSON())).toContain('Pose Me');
});
