import { STICKERS, stickerById } from "@app/client/src/art/art";

export function Sticker({ id, small }: { id: string; small?: boolean }) {
  const s = stickerById(id);
  if (!s) return null;
  return <span className={small ? "sticker small" : "sticker"} role="img" aria-label={`Sticker: ${s.name}`} dangerouslySetInnerHTML={{ __html: s.svg }} />;
}

export function StickerPicker({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  return (
    <fieldset className="sticker-pick">
      <legend>Sticker</legend>
      <label className="none"><input type="radio" name="sticker" value="" checked={value === null} onChange={() => onChange(null)} /> None</label>
      {STICKERS.map(s => (
        <label key={s.id} title={s.name}>
          <input type="radio" name="sticker" value={s.id} checked={value === s.id} onChange={() => onChange(s.id)} />
          <span className="sticker" aria-hidden="true" dangerouslySetInnerHTML={{ __html: s.svg }} />
          <span className="visually-hidden">{s.name}</span>
        </label>
      ))}
    </fieldset>
  );
}
