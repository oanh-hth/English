export function movingAverage(values: number[], radius: number): number[] {
  return values.map((_, i) => {
    const from = Math.max(0, i - radius);
    const to = Math.min(values.length - 1, i + radius);
    let sum = 0;
    for (let j = from; j <= to; j++) sum += values[j];
    return sum / (to - from + 1);
  });
}

export function estimateRounds(profile: number[], options: { min?: number; max?: number } = {}): number {
  const { min = 5, max = 18 } = options;
  const n = profile.length;
  if (n < 20) throw new RangeError('Need at least 20 brightness samples');
  const lo = Math.floor(n * 0.1);
  const hi = Math.floor(n * 0.94);
  const segment = profile.slice(lo, hi);
  const m = segment.length;
  const smooth = movingAverage(segment, Math.max(3, Math.round(m * 0.075)));
  const detail = segment.map((v, i) => v - smooth[i]);

  let best = min;
  let bestPower = -1;
  for (let waves = min; waves <= max; waves += 0.25) {
    let re = 0;
    let im = 0;
    for (let k = 0; k < m; k++) {
      const t = (lo + k + 0.5) / n;
      const window = 0.5 - 0.5 * Math.cos((2 * Math.PI * (k + 0.5)) / m);
      re += detail[k] * window * Math.cos(2 * Math.PI * waves * t);
      im += detail[k] * window * Math.sin(2 * Math.PI * waves * t);
    }
    const power = re * re + im * im;
    if (power > bestPower) {
      bestPower = power;
      best = waves;
    }
  }
  return Math.round(best);
}
