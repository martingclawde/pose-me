import React, {useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  buildMasonryGroups,
  computeGridMetrics,
  type LandingCard,
  type MasonryGroup,
} from './src/application/landing-grid';

type DockTab = 'Library' | 'Camera' | 'Favorites';

const HORIZONTAL_PADDING = 20;
const GRID_GAP = 12;

const poseCards: LandingCard[] = Array.from({length: 24}, (_, index) => ({
  id: `${index + 1}`,
  title: `Pose ${index + 1}`,
}));

const featuredIndexes = [1, 5, 8, 12, 16, 20];

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const {width: screenWidth} = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<DockTab>('Library');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const gridMetrics = useMemo(
    () =>
      computeGridMetrics({
        screenWidth,
        insetLeft: insets.left,
        insetRight: insets.right,
        horizontalPadding: HORIZONTAL_PADDING,
        columnGap: GRID_GAP,
      }),
    [insets.left, insets.right, screenWidth],
  );

  const masonryGroups = useMemo(
    () => buildMasonryGroups(poseCards, featuredIndexes),
    [],
  );

  const favoriteCards = poseCards.filter(card => favorites[card.id]);
  const selectedCard =
    selectedCardId === null
      ? null
      : poseCards.find(card => card.id === selectedCardId) ?? null;
  const isSelectedFavorite =
    selectedCardId === null ? false : Boolean(favorites[selectedCardId]);

  const toggleFavorite = () => {
    if (selectedCardId === null) {
      return;
    }

    setFavorites(current => ({
      ...current,
      [selectedCardId]: !current[selectedCardId],
    }));
  };

  const renderLibraryGroup = useCallback(
    ({item, index}: {item: MasonryGroup; index: number}) => {
      const stackCards = item.stack.filter(Boolean) as LandingCard[];

      return (
        <View
          testID={`masonry-group-${index + 1}`}
          style={[
            styles.masonryGroup,
            item.anchor === 'right' ? styles.masonryGroupRight : null,
          ]}>
          <Pressable
            testID={`pose-card-${item.featured.id}-featured`}
            accessibilityRole="button"
            style={styles.poseCard}
            onPress={() => setSelectedCardId(item.featured.id)}>
            <View
              testID={`card-frame-${item.featured.id}-featured`}
              style={[
                styles.cardPlaceholder,
                {
                  width: gridMetrics.wideWidth,
                  height: gridMetrics.wideHeight,
                },
              ]}>
              <Text style={styles.cardTitle}>{item.featured.title}</Text>
              <Text style={styles.cardHint}>9:16 placeholder</Text>
            </View>
          </Pressable>

          <View style={[styles.stackColumn, {width: gridMetrics.narrowWidth}]}> 
            {stackCards.map(card => (
              <Pressable
                key={`stack-card-${card.id}`}
                testID={`pose-card-${card.id}`}
                accessibilityRole="button"
                style={styles.poseCard}
                onPress={() => setSelectedCardId(card.id)}>
                <View
                  testID={`card-frame-${card.id}`}
                  style={[
                    styles.cardPlaceholder,
                    {
                      width: gridMetrics.narrowWidth,
                      height: gridMetrics.narrowHeight,
                    },
                  ]}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardHint}>9:16 placeholder</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      );
    },
    [gridMetrics.narrowHeight, gridMetrics.narrowWidth, gridMetrics.wideHeight, gridMetrics.wideWidth],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text testID="screen-title" style={styles.title}>
          Pose Me
        </Text>
        <Text style={styles.subtitle}>Instagram-ready shots in minutes.</Text>
      </View>

      {activeTab === 'Library' ? (
        <FlatList
          testID="library-feed"
          data={masonryGroups}
          renderItem={renderLibraryGroup}
          keyExtractor={(_, groupIndex) => `group-${groupIndex}`}
          ItemSeparatorComponent={() => <View style={styles.groupSeparator} />}
          contentContainerStyle={styles.libraryContent}
          style={styles.libraryFeed}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={9}
        />
      ) : activeTab === 'Camera' ? (
        <View testID="camera-panel" style={styles.libraryPanel}>
          <Text style={styles.panelTitle}>Camera</Text>
          <Text style={styles.panelBody}>
            Camera flow placeholder. Keep this entry point centered in the dock.
          </Text>
        </View>
      ) : (
        <View testID="favorites-panel" style={styles.libraryPanel}>
          <Text style={styles.panelTitle}>Favorites</Text>
          {favoriteCards.length > 0 ? (
            <View style={styles.favoriteList}>
              {favoriteCards.map(card => (
                <Text key={`favorite-item-${card.id}`} style={styles.favoriteItemText}>
                  {card.title}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.panelBody}>
              Mark poses as favorite and they will appear here.
            </Text>
          )}
        </View>
      )}

      <View testID="ios-dock" style={styles.dockContainer}>
        <DockButton
          isActive={activeTab === 'Library'}
          testID="dock-item-library"
          label="Library"
          onPress={() => setActiveTab('Library')}
          variant="default"
        />
        <DockButton
          isActive={activeTab === 'Camera'}
          testID="dock-item-camera"
          label="Camera"
          onPress={() => setActiveTab('Camera')}
          variant="camera"
        />
        <DockButton
          isActive={activeTab === 'Favorites'}
          testID="dock-item-favorites"
          label="Favorites"
          onPress={() => setActiveTab('Favorites')}
          variant="default"
        />
      </View>

      {selectedCard ? (
        <View testID="fullscreen-overlay" style={styles.fullscreenOverlay}>
          <Pressable
            testID="close-overlay"
            accessibilityRole="button"
            style={styles.closeButton}
            onPress={() => setSelectedCardId(null)}>
            <Text style={styles.closeButtonLabel}>Close</Text>
          </Pressable>

          <View style={styles.fullscreenCard}>
            <Text style={styles.fullscreenTitle}>{selectedCard.title}</Text>
            <Text style={styles.fullscreenHint}>9:16 placeholder</Text>
          </View>

          <Pressable
            testID="favorite-toggle"
            accessibilityRole="button"
            style={styles.favoriteButton}
            onPress={toggleFavorite}>
            <Text style={styles.favoriteButtonLabel}>
              {isSelectedFavorite ? 'Favorited' : 'Add to favorites'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

interface DockButtonProps {
  label: DockTab;
  isActive: boolean;
  onPress: () => void;
  testID: string;
  variant: 'default' | 'camera';
}

function DockButton({
  label,
  isActive,
  onPress,
  testID,
  variant,
}: DockButtonProps) {
  const isCamera = variant === 'camera';

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.dockButton,
        isCamera ? styles.dockButtonCamera : null,
        isActive ? styles.dockButtonActive : null,
      ]}>
      <Text style={[styles.dockLabel, isActive ? styles.dockLabelActive : null]}>
        {isCamera ? '○' : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4efe8',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  header: {
    paddingTop: 16,
    gap: 6,
  },
  title: {
    color: '#1f2a24',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#48554f',
    fontSize: 14,
  },
  libraryFeed: {
    flex: 1,
    marginTop: 24,
  },
  libraryContent: {
    paddingBottom: 18,
  },
  masonryGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: GRID_GAP,
  },
  masonryGroupRight: {
    flexDirection: 'row-reverse',
  },
  stackColumn: {
    gap: GRID_GAP,
  },
  groupSeparator: {
    height: GRID_GAP,
  },
  poseCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4d8c8',
    backgroundColor: '#f4ebde',
    overflow: 'hidden',
  },
  cardPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ede1d0',
    gap: 8,
  },
  cardTitle: {
    color: '#1f2a24',
    fontSize: 20,
    fontWeight: '700',
  },
  cardHint: {
    color: '#5a665f',
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  libraryPanel: {
    flex: 1,
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: '#fffefb',
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5ddd0',
  },
  panelTitle: {
    color: '#1f2a24',
    fontSize: 24,
    fontWeight: '700',
  },
  panelBody: {
    marginTop: 10,
    color: '#46524c',
    fontSize: 15,
    lineHeight: 22,
  },
  favoriteList: {
    marginTop: 14,
    gap: 10,
  },
  favoriteItemText: {
    color: '#2a332d',
    fontSize: 16,
    fontWeight: '600',
  },
  dockContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#d8cdbe',
    backgroundColor: '#f8f4edee',
  },
  dockButton: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#efe7db',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  dockButtonCamera: {
    flex: 0,
    width: 64,
    height: 64,
    borderRadius: 32,
    marginTop: -22,
    borderWidth: 2,
    borderColor: '#d8cdbe',
    backgroundColor: '#f7f2e8',
  },
  dockButtonActive: {
    backgroundColor: '#1f2a24',
  },
  dockLabel: {
    color: '#37453f',
    fontSize: 14,
    fontWeight: '700',
  },
  dockLabelActive: {
    color: '#f7f5ef',
  },
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111411f0',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d7d1c9',
    backgroundColor: '#f4efe8',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeButtonLabel: {
    color: '#252e28',
    fontSize: 14,
    fontWeight: '700',
  },
  fullscreenCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3f4a43',
    backgroundColor: '#d9cebf',
    aspectRatio: 9 / 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullscreenTitle: {
    color: '#202823',
    fontSize: 28,
    fontWeight: '800',
  },
  fullscreenHint: {
    color: '#2e3832',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  favoriteButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0e2cf',
    backgroundColor: '#fef4e6',
    alignItems: 'center',
    paddingVertical: 15,
  },
  favoriteButtonLabel: {
    color: '#2a332d',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default App;
