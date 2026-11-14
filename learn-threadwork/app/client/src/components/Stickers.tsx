// Exercise 8.4: Sticker and StickerPicker. Read curriculum/part-8/b-stickers.md first.
import { Todo } from "@app/client/src/components/Todo";

/**
 * A sticker drawing: <span className="sticker" role="img" aria-label="Sticker: <name>"> with the SVG from
 * stickerById(id) (art.ts) injected with dangerouslySetInnerHTML. Unknown id: render nothing (null).
 * `small` adds the class "small".
 */
export function Sticker({ id, small }: { id: string; small?: boolean }) {
  // TODO 8.4
  return null;
}

/**
 * <fieldset> with <legend>Sticker</legend> and radio inputs named "sticker":
 * first "None" (value "", checked when value is null), then one per STICKERS entry (art.ts), each labelled with the
 * sticker's name (put the name in a visually-hidden span next to the drawing, so the label has text).
 * Choosing one calls onChange(id), or onChange(null) for None.
 */
export function StickerPicker({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  // TODO 8.4
  return <Todo exercise="8.4" what="The sticker picker" />;
}
