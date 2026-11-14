// Exercise 8.1: ThemePicker. Read curriculum/part-8/a-svg-scenes.md first.
import { Todo } from "@app/client/src/components/Todo";

/**
 * <div role="radiogroup" aria-label="Background"> with one <button role="radio" aria-checked> per THEMES entry
 * (art.ts), named by the theme name, containing <SceneThumb id /> (given, Art.tsx) and the name.
 * Clicking calls onChange(id). Arrow keys: ArrowRight/ArrowDown choose the next theme, ArrowLeft/ArrowUp the previous
 * one (wrapping around), and move focus to it. Only the checked button has tabIndex 0; the others -1.
 */
export function ThemePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  // TODO 8.1
  return <Todo exercise="8.1" what="The theme picker" />;
}
