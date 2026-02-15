import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
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
import {
  clampPanOffset,
  clampScale,
  computeDismissFromDrag,
  computeDoubleTapTargetScale,
} from './src/application/photo-viewer-gestures';

type DockTab = 'Library' | 'Camera' | 'Favorites';

const HORIZONTAL_PADDING = 20;
const GRID_GAP = 1;

const poseCards: LandingCard[] = Array.from({length: 24}, (_, index) => ({
  id: `${index + 1}`,
  title: `Pose ${index + 1}`,
}));

const featuredIndexes = [1, 5, 8, 12, 16, 20];
const posePlaceholderImage = require('./src/assets/placeholders/pose-placeholder-v2.jpg');
const TRANSITION_DURATION_MS = 280;
const DOUBLE_TAP_WINDOW_MS = 260;
const DOUBLE_TAP_RADIUS = 28;

interface CardFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

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
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<DockTab>('Library');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCardFrame, setSelectedCardFrame] = useState<CardFrame | null>(null);
  const [isOverlayClosing, setIsOverlayClosing] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gridMetrics = useMemo(
    () =>
      computeGridMetrics({
        screenWidth,
        insetLeft: insets.left,
        insetRight: insets.right,
        horizontalPadding: 0,
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

  const fallbackFrame = useMemo<CardFrame>(
    () => ({
      x: (screenWidth - gridMetrics.narrowWidth) / 2,
      y: Math.max(96, insets.top + 80),
      width: gridMetrics.narrowWidth,
      height: gridMetrics.narrowHeight,
    }),
    [gridMetrics.narrowHeight, gridMetrics.narrowWidth, insets.top, screenWidth],
  );

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const openCard = useCallback(
    (cardId: string, frame?: CardFrame) => {
      const card = poseCards.find(item => item.id === cardId);

      if (!card) {
        return;
      }

      setSelectedCardFrame(frame ?? fallbackFrame);
      setSelectedCardId(card.id);
      setIsOverlayClosing(false);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    },
    [fallbackFrame],
  );

  const buildFrameFromPress = useCallback(
    (event: GestureResponderEvent | undefined, width: number, height: number): CardFrame | undefined => {
      if (!event?.nativeEvent) {
        return undefined;
      }

      const {pageX, pageY, locationX, locationY} = event.nativeEvent;

      return {
        x: pageX - locationX,
        y: pageY - locationY,
        width,
        height,
      };
    },
    [],
  );

  const closeOverlay = useCallback(() => {
    setIsOverlayClosing(true);

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = setTimeout(() => {
      setSelectedCardId(null);
      setSelectedCardFrame(null);
      setIsOverlayClosing(false);
    }, TRANSITION_DURATION_MS);
  }, []);

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
            onPress={event =>
              openCard(
                item.featured.id,
                buildFrameFromPress(event, gridMetrics.wideWidth, gridMetrics.wideHeight),
              )
            }>
            <View
              testID={`card-frame-${item.featured.id}-featured`}
              style={[
                styles.cardPlaceholder,
                {
                  width: gridMetrics.wideWidth,
                  height: gridMetrics.wideHeight,
                },
              ]}>
              <Image
                testID={`card-image-${item.featured.id}-featured`}
                source={posePlaceholderImage}
                style={styles.cardImage}
                resizeMode="contain"
              />
              <View style={styles.cardLabelScrim}>
                <Text style={styles.cardTitle}>{item.featured.title}</Text>
              </View>
            </View>
          </Pressable>

          <View style={[styles.stackColumn, {width: gridMetrics.narrowWidth}]}> 
            {stackCards.map(card => (
              <Pressable
                key={`stack-card-${card.id}`}
                testID={`pose-card-${card.id}`}
                accessibilityRole="button"
                style={styles.poseCard}
                onPress={event =>
                  openCard(
                    card.id,
                    buildFrameFromPress(event, gridMetrics.narrowWidth, gridMetrics.narrowHeight),
                  )
                }>
                <View
                  testID={`card-frame-${card.id}`}
                  style={[
                    styles.cardPlaceholder,
                    {
                      width: gridMetrics.narrowWidth,
                      height: gridMetrics.narrowHeight,
                    },
                  ]}>
                  <Image
                    testID={`card-image-${card.id}`}
                    source={posePlaceholderImage}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                  <View style={styles.cardLabelScrim}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      );
    },
    [
      buildFrameFromPress,
      gridMetrics.narrowHeight,
      gridMetrics.narrowWidth,
      gridMetrics.wideHeight,
      gridMetrics.wideWidth,
      openCard,
    ],
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeAreaContent}>
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
      </SafeAreaView>

      {selectedCard ? (
        <PhotoOverlay
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          selectedCard={selectedCard}
          startFrame={selectedCardFrame ?? fallbackFrame}
          isClosing={isOverlayClosing}
          isSelectedFavorite={isSelectedFavorite}
          onToggleFavorite={toggleFavorite}
          onClose={closeOverlay}
        />
      ) : null}
    </GestureHandlerRootView>
  );
}

interface PhotoOverlayProps {
  insetsTop: number;
  insetsBottom: number;
  screenWidth: number;
  screenHeight: number;
  selectedCard: LandingCard;
  startFrame: CardFrame;
  isClosing: boolean;
  isSelectedFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

function PhotoOverlay({
  insetsTop,
  insetsBottom,
  screenWidth,
  screenHeight,
  selectedCard,
  startFrame,
  isClosing,
  isSelectedFavorite,
  onToggleFavorite,
  onClose,
}: PhotoOverlayProps) {
  const transition = useSharedValue(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const photoScale = useSharedValue(1);
  const photoTranslateX = useSharedValue(0);
  const photoTranslateY = useSharedValue(0);
  const pinchStartScale = useSharedValue(1);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);

  useEffect(() => {
    transition.value = withTiming(1, {
      duration: TRANSITION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [transition]);

  useEffect(() => {
    if (!isClosing) {
      return;
    }

    transition.value = withTiming(0, {
      duration: TRANSITION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });

    dragY.value = withTiming(0, {
      duration: TRANSITION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });

    dragX.value = withTiming(0, {
      duration: TRANSITION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [dragX, dragY, isClosing, transition]);

  const panGesture = Gesture.Pan()
    .enabled(!isClosing)
    .maxPointers(1)
    .minDistance(2)
    .onBegin(() => {
      panStartX.value = photoTranslateX.value;
      panStartY.value = photoTranslateY.value;
    })
    .onUpdate(event => {
      if (photoScale.value > 1.01) {
        const bounded = clampPanOffset({
          x: panStartX.value + event.translationX,
          y: panStartY.value + event.translationY,
          scale: photoScale.value,
          viewportWidth: screenWidth,
          viewportHeight: screenHeight,
        });
        photoTranslateX.value = bounded.x;
        photoTranslateY.value = bounded.y;
        return;
      }

      dragX.value = event.translationX;
      dragY.value = event.translationY;
    })
    .onEnd(() => {
      if (photoScale.value > 1.01) {
        return;
      }

      if (computeDismissFromDrag(dragY.value)) {
        runOnJS(onClose)();
        return;
      }

      dragX.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      dragY.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    });

  const pinchGesture = Gesture.Pinch()
    .enabled(!isClosing)
    .onBegin(() => {
      pinchStartScale.value = photoScale.value;
    })
    .onUpdate(event => {
      const nextScale = clampScale(pinchStartScale.value * event.scale);
      photoScale.value = nextScale;

      if (nextScale <= 1) {
        photoTranslateX.value = 0;
        photoTranslateY.value = 0;
        return;
      }

      const boundedPan = clampPanOffset({
        x: photoTranslateX.value,
        y: photoTranslateY.value,
        scale: nextScale,
        viewportWidth: screenWidth,
        viewportHeight: screenHeight,
      });

      photoTranslateX.value = boundedPan.x;
      photoTranslateY.value = boundedPan.y;
    })
    .onEnd(() => {
      if (photoScale.value <= 1) {
        photoScale.value = withSpring(1, {damping: 18, stiffness: 220});
        photoTranslateX.value = withSpring(0, {damping: 18, stiffness: 220});
        photoTranslateY.value = withSpring(0, {damping: 18, stiffness: 220});
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .enabled(!isClosing)
    .numberOfTaps(2)
    .maxDelay(DOUBLE_TAP_WINDOW_MS)
    .maxDistance(DOUBLE_TAP_RADIUS)
    .onEnd((event, success) => {
      if (!success) {
        return;
      }

      const target = computeDoubleTapTargetScale(photoScale.value);
      const rawOffsetX = (screenWidth / 2 - event.x) * (target - 1);
      const rawOffsetY = (screenHeight / 2 - event.y) * (target - 1);
      const boundedOffset = clampPanOffset({
        x: rawOffsetX,
        y: rawOffsetY,
        scale: target,
        viewportWidth: screenWidth,
        viewportHeight: screenHeight,
      });

      photoScale.value = withTiming(target, {duration: 190, easing: Easing.out(Easing.ease)});
      photoTranslateX.value = withTiming(target === 1 ? 0 : boundedOffset.x, {
        duration: 190,
        easing: Easing.out(Easing.ease),
      });
      photoTranslateY.value = withTiming(target === 1 ? 0 : boundedOffset.y, {
        duration: 190,
        easing: Easing.out(Easing.ease),
      });
    });

  const gesture = Gesture.Simultaneous(doubleTapGesture, pinchGesture, panGesture);

  const cardStyle = useAnimatedStyle(() => {
    return {
      top: interpolate(transition.value, [0, 1], [startFrame.y, 0], Extrapolation.CLAMP),
      left: interpolate(transition.value, [0, 1], [startFrame.x, 0], Extrapolation.CLAMP),
      width: interpolate(
        transition.value,
        [0, 1],
        [startFrame.width, screenWidth],
        Extrapolation.CLAMP,
      ),
      height: interpolate(
        transition.value,
        [0, 1],
        [startFrame.height, screenHeight],
        Extrapolation.CLAMP,
      ),
      borderRadius: 0,
      borderWidth: interpolate(transition.value, [0, 1], [1, 0], Extrapolation.CLAMP),
      transform: [{translateX: dragX.value}, {translateY: dragY.value}],
    };
  }, [
    dragX,
    screenHeight,
    screenWidth,
    startFrame.height,
    startFrame.width,
    startFrame.x,
    startFrame.y,
  ]);

  const scrimStyle = useAnimatedStyle(() => {
    const dragDistance = Math.hypot(dragX.value, dragY.value);
    const dragProgress = interpolate(dragDistance, [0, 260], [1, 0.78], Extrapolation.CLAMP);
    return {
      opacity: interpolate(transition.value, [0, 1], [0, 0.34], Extrapolation.CLAMP) * dragProgress,
    };
  });

  const controlsStyle = useAnimatedStyle(() => {
    const dragDistance = Math.hypot(dragX.value, dragY.value);
    const dragProgress = interpolate(dragDistance, [0, 260], [1, 0.78], Extrapolation.CLAMP);
    return {
      opacity: interpolate(transition.value, [0, 0.8, 1], [0, 0, 1], Extrapolation.CLAMP) * dragProgress,
    };
  });

  const mediaTransformStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: photoTranslateX.value},
      {translateY: photoTranslateY.value},
      {scale: photoScale.value},
    ],
  }));

  return (
    <View testID="fullscreen-overlay" style={styles.fullscreenOverlay}>
      <Animated.View style={[styles.overlayScrim, scrimStyle]} />

      <Animated.View
        testID="fullscreen-photo-transition"
        style={[styles.fullscreenCard, styles.transitionCard, cardStyle]}>
        <GestureDetector gesture={gesture}>
          <View style={styles.photoGestureSurface}>
            <Animated.View style={[styles.fullscreenCardContent, mediaTransformStyle]}>
              <Image
                testID="fullscreen-photo-image"
                source={posePlaceholderImage}
                style={styles.fullscreenPhotoImage}
                resizeMode="contain"
              />
              <View style={styles.fullscreenLabelScrim}>
                <Text style={styles.fullscreenTitle}>{selectedCard.title}</Text>
              </View>
            </Animated.View>
          </View>
        </GestureDetector>
      </Animated.View>

      <Animated.View
        style={[
          styles.overlayControls,
          controlsStyle,
          {paddingTop: insetsTop + 10, paddingBottom: insetsBottom + 14},
        ]}
        pointerEvents="box-none">
        <Pressable
          testID="close-overlay"
          accessibilityRole="button"
          style={styles.closeButton}
          onPress={onClose}>
          <Text style={styles.closeButtonLabel}>Close</Text>
        </Pressable>

        <Pressable
          testID="favorite-toggle"
          accessibilityRole="button"
          style={styles.favoriteButton}
          onPress={onToggleFavorite}>
          <Text style={styles.favoriteButtonLabel}>
            {isSelectedFavorite ? 'Favorited' : 'Add to favorites'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
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
  },
  safeAreaContent: {
    flex: 1,
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
    marginHorizontal: -HORIZONTAL_PADDING,
  },
  libraryContent: {
    paddingBottom: 18,
  },
  masonryGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: GRID_GAP,
    backgroundColor: '#000000',
  },
  masonryGroupRight: {
    flexDirection: 'row-reverse',
  },
  stackColumn: {
    gap: GRID_GAP,
  },
  groupSeparator: {
    height: GRID_GAP,
    backgroundColor: '#000000',
  },
  poseCard: {
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  cardPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ede1d0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardLabelScrim: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#00000055',
  },
  cardTitle: {
    color: '#f3f7f5',
    fontSize: 18,
    fontWeight: '700',
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
  },
  overlayScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111411',
  },
  overlayControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#3f4a43',
    backgroundColor: '#d9cebf',
    overflow: 'hidden',
  },
  transitionCard: {
    position: 'absolute',
  },
  photoGestureSurface: {
    flex: 1,
  },
  fullscreenCardContent: {
    flex: 1,
  },
  fullscreenPhotoImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenLabelScrim: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#0000005f',
  },
  fullscreenTitle: {
    color: '#f4f6f4',
    fontSize: 26,
    fontWeight: '800',
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
