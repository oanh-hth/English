// Given: a placeholder shown until you finish an exercise.
export function Todo({ exercise, what }: { exercise: string; what: string }) {
  return (
    <div className="todo" role="note">
      <b>{what}</b> appears here after exercise {exercise}. Run <code>npm run ex {exercise}</code>.
    </div>
  );
}
