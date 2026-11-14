// Given: React wrappers around the SVG art. The SVG strings are our own, so injecting them is safe.
// Never use dangerouslySetInnerHTML with text that a user or another site could control.
import { GROUP_COLORS, THEMES, folderSvg, themeById } from "@app/client/src/art/art";

export function FolderArt({ group, stickers }: { group: string; stickers: string[] }) {
  return <span className="folder-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: folderSvg(GROUP_COLORS[group] ?? "#8A93A6", stickers) }} />;
}

export function SceneThumb({ id }: { id: string }) {
  const t = themeById(id);
  return <span className="thumb" aria-hidden="true" style={{ background: t.tint || "var(--paper)" }} dangerouslySetInnerHTML={{ __html: t.svg }} />;
}

/** The animated scene behind the whole app. */
export function Backdrop({ id }: { id: string }) {
  const t = themeById(id);
  return <div className="backdrop" aria-hidden="true" dangerouslySetInnerHTML={{ __html: t.svg }} />;
}

export { THEMES };
