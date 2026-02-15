/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
  SafeAreaView: ({children}: {children: React.ReactNode}) => <>{children}</>,
  useSafeAreaInsets: () => ({top: 0, right: 0, bottom: 0, left: 0}),
}));

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  ReactTestRenderer.act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) {
    return (style ?? {}) as Record<string, unknown>;
  }

  return style.reduce<Record<string, unknown>>((acc, part) => {
    if (part && typeof part === 'object') {
      return {...acc, ...(part as Record<string, unknown>)};
    }

    return acc;
  }, {});
}

async function renderApp() {
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    jest.runOnlyPendingTimers();
  });

  return tree!;
}

test('renders grid feed with featured cards', async () => {
  const tree = await renderApp();

  const feed = tree.root.findByProps({testID: 'library-feed'});

  expect(feed).toBeTruthy();
  expect(tree.root.findByProps({testID: 'masonry-group-1'})).toBeTruthy();
  expect(tree.root.findByProps({testID: 'pose-card-2-featured'})).toBeTruthy();
  expect(tree.root.findByProps({testID: 'pose-card-1'})).toBeTruthy();
});

test('keeps 9:16 ratio on standard and featured cards', async () => {
  const tree = await renderApp();

  const standardFrame = tree.root.findByProps({testID: 'card-frame-1'});
  const featuredFrame = tree.root.findByProps({testID: 'card-frame-2-featured'});

  const standardStyle = flattenStyle(standardFrame.props.style);
  const featuredStyle = flattenStyle(featuredFrame.props.style);

  const standardWidth = standardStyle.width as number;
  const standardHeight = standardStyle.height as number;
  const featuredWidth = featuredStyle.width as number;
  const featuredHeight = featuredStyle.height as number;

  expect(standardHeight).toBeCloseTo((standardWidth * 16) / 9, 4);
  expect(featuredHeight).toBeCloseTo((featuredWidth * 16) / 9, 4);
});

test('renders iOS dock with centered camera button', async () => {
  const tree = await renderApp();

  expect(tree.root.findByProps({testID: 'ios-dock'})).toBeTruthy();
  expect(tree.root.findByProps({testID: 'dock-item-library'})).toBeTruthy();
  expect(tree.root.findByProps({testID: 'dock-item-camera'})).toBeTruthy();
  expect(tree.root.findByProps({testID: 'dock-item-favorites'})).toBeTruthy();
});

test('opens overlay, toggles favorite and closes', async () => {
  const tree = await renderApp();

  const firstCard = tree.root.findByProps({testID: 'pose-card-1'});

  await ReactTestRenderer.act(() => {
    firstCard.props.onPress();
  });

  expect(tree.root.findByProps({testID: 'fullscreen-overlay'})).toBeTruthy();

  const favoriteButton = tree.root.findByProps({testID: 'favorite-toggle'});

  await ReactTestRenderer.act(() => {
    favoriteButton.props.onPress();
  });

  expect(JSON.stringify(tree.toJSON())).toContain('Favorited');

  const closeButton = tree.root.findByProps({testID: 'close-overlay'});

  await ReactTestRenderer.act(() => {
    closeButton.props.onPress();
  });

  expect(() => tree.root.findByProps({testID: 'fullscreen-overlay'})).toThrow();
});
