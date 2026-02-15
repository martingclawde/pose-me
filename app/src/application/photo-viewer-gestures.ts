const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2;
const DRAG_DISMISS_THRESHOLD = 120;

interface ClampPanOffsetInput {
  x: number;
  y: number;
  scale: number;
  viewportWidth: number;
  viewportHeight: number;
}

interface Point {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  'worklet';

  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

export function clampScale(scale: number): number {
  'worklet';

  return clamp(scale, MIN_SCALE, MAX_SCALE);
}

export function computeDismissFromDrag(verticalOffset: number): boolean {
  'worklet';

  return Math.abs(verticalOffset) >= DRAG_DISMISS_THRESHOLD;
}

export function computeDoubleTapTargetScale(currentScale: number): number {
  'worklet';

  return currentScale >= DOUBLE_TAP_SCALE ? MIN_SCALE : DOUBLE_TAP_SCALE;
}

export function clampPanOffset({
  x,
  y,
  scale,
  viewportWidth,
  viewportHeight,
}: ClampPanOffsetInput): Point {
  'worklet';

  const boundedScale = clampScale(scale);
  const maxX = ((boundedScale - 1) * viewportWidth) / 2;
  const maxY = ((boundedScale - 1) * viewportHeight) / 2;

  return {
    x: clamp(x, -maxX, maxX),
    y: clamp(y, -maxY, maxY),
  };
}
