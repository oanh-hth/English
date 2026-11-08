import { clamp, pointToPercent } from '@/client/drag';

describe('clamp', () => {
  it('keeps a value inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('pointToPercent', () => {
  const box = { left: 100, top: 50, width: 400, height: 200 };
  it('maps a pointer position inside the room to percentages', () => {
    expect(pointToPercent(300, 150, box)).toEqual({ x: 50, y: 50 });
    expect(pointToPercent(100, 50, box)).toEqual({ x: 0, y: 0 });
    expect(pointToPercent(500, 250, box)).toEqual({ x: 100, y: 100 });
  });
  it('rounds to one decimal', () => {
    expect(pointToPercent(100 + 133, 50 + 67, box)).toEqual({ x: 33.3, y: 33.5 });
  });
  it('clamps positions outside the room', () => {
    expect(pointToPercent(0, 1000, box)).toEqual({ x: 0, y: 100 });
  });
  it('handles an empty box without dividing by zero', () => {
    expect(pointToPercent(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 50, y: 50 });
  });
});
