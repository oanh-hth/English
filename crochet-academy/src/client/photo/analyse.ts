/**
 * PROVIDED: reads a photo of a round piece. None of this is an exercise; read it if you are curious.
 *  loadPhoto    -> an image shrunk to at most 560 pixels, with its pixel data
 *  detectPiece  -> the ellipse around the piece (everything unlike the background colours around the border)
 *  radialProfiles -> the brightness at many distances from the centre, once per sector of the circle: YOUR estimateRounds (5.3) reads these
 *  pieceColor   -> the typical yarn colour
 */
export interface Photo {
  w: number;
  h: number;
  canvas: HTMLCanvasElement;
  data: ImageData;
}
export interface Ellipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** False when nothing stood out and we guessed. */
  found: boolean;
}

const MAX = 560;

export function loadPhoto(file: Blob): Promise<Photo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * k));
      const h = Math.max(1, Math.round(img.naturalHeight * k));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const g = canvas.getContext('2d', { willReadFrequently: true })!;
      g.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve({ w, h, canvas, data: g.getImageData(0, 0, w, h) });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file is not an image'));
    };
    img.src = url;
  });
}

type RGB = [number, number, number];
const dist = (a: RGB, b: RGB) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export function detectPiece(photo: Photo): Ellipse {
  const { w, h } = photo;
  const d = photo.data.data;
  const px = (x: number, y: number): RGB => {
    const i = (y * w + x) * 4;
    return [d[i], d[i + 1], d[i + 2]];
  };
  const band = Math.max(3, Math.round(Math.min(w, h) * 0.04));
  const samples: RGB[] = [];
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (x < band || y < band || x >= w - band || y >= h - band) samples.push(px(x, y));
  const lum = (c: RGB) => c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114;
  const sorted = samples.slice().sort((a, b) => lum(a) - lum(b));
  let centroids: RGB[] = [0, 0.33, 0.66, 1].map((q) => [...sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]] as RGB);
  for (let it = 0; it < 6; it++) {
    const sums = centroids.map(() => [0, 0, 0, 0]);
    for (const c of samples) {
      let best = 0;
      for (let k = 1; k < centroids.length; k++) if (dist(c, centroids[k]) < dist(c, centroids[best])) best = k;
      sums[best][0] += c[0]; sums[best][1] += c[1]; sums[best][2] += c[2]; sums[best][3]++;
    }
    centroids = centroids.map((c, k) => (sums[k][3] ? ([sums[k][0] / sums[k][3], sums[k][1] / sums[k][3], sums[k][2] / sums[k][3]] as RGB) : c));
  }
  const far = (c: RGB) => Math.min(...centroids.map((k) => dist(c, k)));
  // Otsu's method: the threshold that best separates "like the background" from "unlike it"
  const hist = new Array(64).fill(0);
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) hist[Math.min(63, Math.floor(far(px(x, y)) / 7))]++;
  const total = hist.reduce((a, b) => a + b, 0);
  const sumAll = hist.reduce((a, v, i) => a + v * i, 0);
  let wB = 0, sB = 0, bestVar = -1, bestBin = 8;
  for (let i = 0; i < 64; i++) {
    wB += hist[i];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sB += hist[i] * i;
    const mB = sB / wB, mF = (sumAll - sB) / wF, v = wB * wF * (mB - mF) ** 2;
    if (v > bestVar) { bestVar = v; bestBin = i; }
  }
  const threshold = Math.max(40, (bestBin + 1) * 7);
  const cell = 6, gw = Math.ceil(w / cell), gh = Math.ceil(h / cell);
  const fg = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    let on = 0, n = 0;
    for (let y = gy * cell; y < Math.min(h, gy * cell + cell); y += 2) for (let x = gx * cell; x < Math.min(w, gx * cell + cell); x += 2) {
      n++;
      if (far(px(x, y)) > threshold) on++;
    }
    fg[gy * gw + gx] = n && on / n >= 0.5 ? 1 : 0;
  }
  const seen = new Uint8Array(gw * gh);
  let best: number[] | null = null;
  for (let i = 0; i < fg.length; i++) {
    if (!fg[i] || seen[i]) continue;
    const stack = [i], comp: number[] = [];
    seen[i] = 1;
    while (stack.length) {
      const j = stack.pop()!;
      comp.push(j);
      const x = j % gw, y = (j / gw) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, n = ny * gw + nx;
        if (nx >= 0 && ny >= 0 && nx < gw && ny < gh && fg[n] && !seen[n]) { seen[n] = 1; stack.push(n); }
      }
    }
    if (!best || comp.length > best.length) best = comp;
  }
  const guess: Ellipse = { cx: w / 2, cy: h / 2, rx: Math.min(w, h) * 0.3, ry: Math.min(w, h) * 0.3, found: false };
  if (!best || best.length < gw * gh * 0.02 || best.length > gw * gh * 0.8) return guess;
  let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (const j of best) {
    const x = j % gw, y = (j / gw) | 0;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const L = x0 * cell, R = Math.min(w, (x1 + 1) * cell), T = y0 * cell, B = Math.min(h, (y1 + 1) * cell);
  return { cx: (L + R) / 2, cy: (T + B) / 2, rx: (R - L) / 2, ry: (B - T) / 2, found: true };
}

function sample(photo: Photo, e: Ellipse, t: number, angle: number): RGB | null {
  const x = Math.round(e.cx + t * e.rx * Math.cos(angle));
  const y = Math.round(e.cy + t * e.ry * Math.sin(angle));
  if (x < 0 || y < 0 || x >= photo.w || y >= photo.h) return null;
  const i = (y * photo.w + x) * 4;
  const d = photo.data.data;
  return [d[i], d[i + 1], d[i + 2]];
}

/** Average brightness at `steps` distances from the centre (0) to the edge (1), looking only at one slice of the circle. */
export function radialProfile(photo: Photo, e: Ellipse, steps = 120, angles = 90, from = 0, span = Math.PI * 2): number[] {
  const out: number[] = [];
  for (let i = 0; i < steps; i++) {
    let sum = 0, n = 0;
    for (let k = 0; k < angles; k++) {
      const c = sample(photo, e, (i + 0.5) / steps, from + (k / angles) * span);
      if (c) { sum += c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114; n++; }
    }
    out.push(n ? sum / n : 0);
  }
  return out;
}

/** One brightness profile per sector of the circle: what YOUR estimateRounds (5.3) takes as input. */
export function radialProfiles(photo: Photo, e: Ellipse, sectors = 12): number[][] {
  return Array.from({ length: sectors }, (_, k) => radialProfile(photo, e, 120, 12, (k / sectors) * Math.PI * 2, (Math.PI * 2) / sectors));
}

export function pieceColor(photo: Photo, e: Ellipse): string {
  const px: RGB[] = [];
  for (let i = 0; i < 24; i++) for (let k = 0; k < 40; k++) {
    const c = sample(photo, e, 0.12 + (0.78 * i) / 24, (k / 40) * Math.PI * 2);
    if (c) px.push(c);
  }
  if (!px.length) return '#d6c8ea';
  px.sort((a, b) => a[0] * 0.299 + a[1] * 0.587 + a[2] * 0.114 - (b[0] * 0.299 + b[1] * 0.587 + b[2] * 0.114));
  const mid = px.slice(Math.floor(px.length * 0.25), Math.ceil(px.length * 0.75));
  const avg = [0, 1, 2].map((k) => Math.round(mid.reduce((a, c) => a + c[k], 0) / mid.length));
  return '#' + avg.map((v) => v.toString(16).padStart(2, '0')).join('');
}
