import { Component, type ErrorInfo, type ReactNode } from 'react';
import { NotImplementedError } from '@/shared/todo';
import { ALL_EXERCISES, exercisePath, findExercise } from '../../curriculum/curriculum';
import { onHotUpdate } from './useHotReset';

interface Props {
  /** What this part of the app is called, for the card: "the stitch picker". */
  feature: string;
  children: ReactNode;
}

interface State {
  error: unknown;
}

/**
 * PROVIDED. Wraps a feature that depends on one of your exercises. While the exercise is still a stub
 * (it throws NotImplementedError) the card below is shown instead of a broken page.
 * Any OTHER error is a real bug in your code: it is shown with its message so you can fix it.
 */
export class ExerciseBoundary extends Component<Props, State> {
  state: State = { error: null };
  private stopWatching: () => void = () => {};

  componentDidMount() {
    this.stopWatching = onHotUpdate(() => this.setState({ error: null }));
  }

  componentWillUnmount() {
    this.stopWatching();
  }

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (!(error instanceof NotImplementedError)) console.error(error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (error instanceof NotImplementedError) {
      const exercise = findExercise(error.exercise) ?? ALL_EXERCISES[0];
      return (
        <aside className="card todo-card" role="status">
          <h3>🧶 Waiting for exercise {exercise.id}</h3>
          <p>
            Build <b>{exercise.title.toLowerCase()}</b> to unlock {this.props.feature}.
          </p>
          <p className="muted small">
            Read <code>{exercisePath(exercise)}/README.md</code>, then run <code>npm run learn test {exercise.id}</code>.
          </p>
        </aside>
      );
    }

    return (
      <aside className="card error-card" role="alert">
        <h3>Something in {this.props.feature} threw an error</h3>
        <p><code>{error instanceof Error ? error.message : String(error)}</code></p>
        <button className="btn sm" type="button" onClick={() => this.setState({ error: null })}>Try again</button>
      </aside>
    );
  }
}
