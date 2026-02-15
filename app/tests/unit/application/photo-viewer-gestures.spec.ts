import {
  clampScale,
  computeDismissFromDrag,
  computeDoubleTapTargetScale,
  clampPanOffset,
} from '../../../src/application/photo-viewer-gestures';

describe('photo viewer gestures', () => {
  it('clamps scale inside supported bounds', () => {
    expect(clampScale(0.6)).toBe(1);
    expect(clampScale(2.5)).toBe(2.5);
    expect(clampScale(8)).toBe(4);
  });

  it('decides dismiss from vertical drag threshold', () => {
    expect(computeDismissFromDrag(130)).toBe(true);
    expect(computeDismissFromDrag(-131)).toBe(true);
    expect(computeDismissFromDrag(70)).toBe(false);
  });

  it('toggles double tap between baseline and iOS-like zoom', () => {
    expect(computeDoubleTapTargetScale(1)).toBe(2);
    expect(computeDoubleTapTargetScale(1.3)).toBe(2);
    expect(computeDoubleTapTargetScale(2)).toBe(1);
    expect(computeDoubleTapTargetScale(2.4)).toBe(1);
  });

  it('keeps pan inside scaled image bounds', () => {
    const viewportWidth = 400;
    const viewportHeight = 800;

    const bounded = clampPanOffset({
      x: 300,
      y: -500,
      scale: 2,
      viewportWidth,
      viewportHeight,
    });

    expect(bounded.x).toBe(200);
    expect(bounded.y).toBe(-400);
  });
});
