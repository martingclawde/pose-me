import {
  CARD_RATIO,
  buildMasonryGroups,
  computeGridMetrics,
  type LandingCard,
} from '../../../src/application/landing-grid';

describe('landing grid metrics', () => {
  test('computes narrow and wide card sizes from width', () => {
    const metrics = computeGridMetrics({
      screenWidth: 430,
      insetLeft: 0,
      insetRight: 0,
      horizontalPadding: 16,
      columnGap: 12,
    });

    expect(metrics.contentWidth).toBe(398);
    expect(metrics.narrowWidth).toBeCloseTo((398 - 12 * 2) / 3, 4);
    expect(metrics.wideWidth).toBeCloseTo(398 - 12 - metrics.narrowWidth, 4);
    expect(metrics.narrowHeight).toBeCloseTo(metrics.narrowWidth / CARD_RATIO, 4);
    expect(metrics.wideHeight).toBeCloseTo(metrics.wideWidth / CARD_RATIO, 4);
    expect(metrics.wideHeight).toBeCloseTo((metrics.narrowWidth * 2 + 12) / CARD_RATIO, 4);
  });
});

describe('landing masonry groups', () => {
  const cards: LandingCard[] = [
    {id: '1', title: 'Pose 1'},
    {id: '2', title: 'Pose 2'},
    {id: '3', title: 'Pose 3'},
    {id: '4', title: 'Pose 4'},
    {id: '5', title: 'Pose 5'},
  ];

  test('builds groups with configurable featured index and alternating anchors', () => {
    const groups = buildMasonryGroups(cards, [1, 4]);

    expect(groups).toEqual([
      {
        anchor: 'left',
        featured: cards[1],
        stack: [cards[0], cards[2]],
      },
      {
        anchor: 'right',
        featured: cards[4],
        stack: [cards[3]],
      },
    ]);
  });
});
