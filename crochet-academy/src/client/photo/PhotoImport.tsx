import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChartInput } from '@/shared/types';
import { estimateRounds } from '@/core/estimateRounds';
import { circleRows, type CircleStitch } from '@/core/circleRows';
import { RoundChart } from '../chart/RoundChart';
import { detectPiece, loadPhoto, pieceColor, radialProfiles, type Photo } from './analyse';

/**
 * PROVIDED: "Import from photo". Choose or paste a picture of a flat round piece; the page finds the piece,
 * counts its rounds with YOUR estimateRounds (5.3), and builds the chart with YOUR circleRows (5.4),
 * drawn with YOUR RoundChart (3.7). Until those exist you will see the "Waiting for exercise ..." cards.
 */
export function PhotoImport({ onCreate }: { onCreate: (input: ChartInput) => void }) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  async function choose(file: Blob | null | undefined) {
    if (!file) return;
    setProblem(null);
    try {
      setPhoto(await loadPhoto(file));
    } catch (error) {
      setProblem(error instanceof Error ? error.message : 'Could not open that image');
    }
  }

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = [...(event.clipboardData?.files ?? [])].find((f) => f.type.startsWith('image/'));
      if (file) { event.preventDefault(); void choose(file); }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, []);

  return (
    <>
      <h2>Import from a photo</h2>
      <p className="muted small">Choose (or paste) a photo of a flat, round piece taken from above. The photo never leaves your browser.</p>
      <input type="file" accept="image/*" aria-label="Photo" onChange={(e) => void choose(e.target.files?.[0])} />
      {problem ? <p className="hint" role="alert">{problem}</p> : null}
      {photo ? <Analysed photo={photo} onCreate={onCreate} /> : null}
    </>
  );
}

function Analysed({ photo, onCreate }: { photo: Photo; onCreate: (input: ChartInput) => void }) {
  const piece = useMemo(() => detectPiece(photo), [photo]);
  const detected = useMemo(() => estimateRounds(radialProfiles(photo, piece)), [photo, piece]); // exercise 5.3
  const [rounds, setRounds] = useState<number | null>(null);
  const [stitch, setStitch] = useState<CircleStitch>('sc');
  const [color, setColor] = useState(() => pieceColor(photo, piece));
  const [name, setName] = useState('');
  const count = rounds ?? detected;
  const rows = useMemo(() => circleRows(stitch, count, color), [stitch, count, color]); // exercise 5.4
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    el.width = photo.w;
    el.height = photo.h;
    const g = el.getContext('2d')!;
    g.drawImage(photo.canvas, 0, 0);
    g.strokeStyle = 'rgba(255,255,255,.6)';
    g.lineWidth = 2;
    for (let k = 1; k < count; k++) {
      g.beginPath();
      g.ellipse(piece.cx, piece.cy, (piece.rx * k) / count, (piece.ry * k) / count, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.strokeStyle = '#f2a3b8';
    g.lineWidth = 3;
    g.setLineDash([8, 5]);
    g.beginPath();
    g.ellipse(piece.cx, piece.cy, piece.rx, piece.ry, 0, 0, Math.PI * 2);
    g.stroke();
  }, [photo, piece, count]);

  const chart = { id: 'preview', name: name || 'Chart from photo', mode: 'round' as const, rows, updated: 0 };
  return (
    <div className="photo">
      <canvas ref={canvas} className="photo-canvas" aria-label="Your photo with the detected outline and one ring per round" />
      <p className="muted small">
        {piece.found ? 'Found the piece.' : "I couldn't find the piece on its own, so this is a guess."} The thin rings show the rounds counted. Change <b>Rounds</b> until they match what you see.
      </p>
      <div className="pk-controls">
        <label>Rounds <input type="number" min={1} max={30} value={count} onChange={(e) => setRounds(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} /></label>
        <label>Stitch
          <select value={stitch} onChange={(e) => setStitch(e.target.value as CircleStitch)}>
            <option value="sc">Single crochet</option><option value="hdc">Half double</option><option value="dc">Double crochet</option>
          </select>
        </label>
        <label>Yarn <input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
        <label>Name <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Chart from photo" /></label>
      </div>
      <div className="viz photo-preview"><RoundChart chart={chart} /></div>
      <div className="actions">
        <button type="button" className="btn primary" onClick={() => onCreate({ name: chart.name, mode: 'round', rows })}>Create chart</button>
      </div>
    </div>
  );
}
