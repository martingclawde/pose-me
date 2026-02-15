export interface LandingCard {
  id: string;
  title: string;
}

export interface MasonryGroup {
  anchor: 'left' | 'right';
  featured: LandingCard;
  stack: [LandingCard?, LandingCard?];
}

export const CARD_RATIO = 9 / 16;

interface GridMetricsInput {
  screenWidth: number;
  insetLeft: number;
  insetRight: number;
  horizontalPadding: number;
  columnGap: number;
}

export interface GridMetrics {
  contentWidth: number;
  narrowWidth: number;
  narrowHeight: number;
  wideWidth: number;
  wideHeight: number;
}

export function computeGridMetrics(input: GridMetricsInput): GridMetrics {
  const contentWidth =
    input.screenWidth -
    input.insetLeft -
    input.insetRight -
    input.horizontalPadding * 2;
  const narrowWidth =
    (contentWidth - input.columnGap * (1 + CARD_RATIO)) / 3;
  const narrowHeight = narrowWidth / CARD_RATIO;
  const wideWidth = contentWidth - input.columnGap - narrowWidth;
  const wideHeight = wideWidth / CARD_RATIO;

  return {
    contentWidth,
    narrowWidth,
    narrowHeight,
    wideWidth,
    wideHeight,
  };
}

export function buildMasonryGroups(
  cards: LandingCard[],
  featuredIndexes: number[],
): MasonryGroup[] {
  const featured = new Set(featuredIndexes);
  const groups: MasonryGroup[] = [];

  for (let index = 0; index < cards.length; index += 3) {
    const chunk = cards.slice(index, index + 3);

    if (chunk.length === 0) {
      continue;
    }

    let featuredOffset = 0;

    for (let chunkIndex = 0; chunkIndex < chunk.length; chunkIndex += 1) {
      if (featured.has(index + chunkIndex)) {
        featuredOffset = chunkIndex;
        break;
      }
    }

    const featuredCard = chunk[featuredOffset];
    const stackCards = chunk.filter((_, chunkIndex) => chunkIndex !== featuredOffset);

    groups.push({
      anchor: groups.length % 2 === 0 ? 'left' : 'right',
      featured: featuredCard,
      stack: [stackCards[0], stackCards[1]],
    });
  }

  return groups;
}
