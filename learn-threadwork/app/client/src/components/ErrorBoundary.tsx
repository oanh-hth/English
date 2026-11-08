// Given: keeps one unfinished exercise from breaking the whole page.
import { Component, type ReactNode } from "react";

interface Props { area: string; children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const todo = /TODO (\d\.\d)/.exec(error.message)?.[1];
    return (
      <div className="todo" role="note">
        <b>{this.props.area}</b>{" "}
        {todo ? <>needs exercise {todo}. Run <code>npm run ex {todo}</code>.</> : <>stopped with an error: {error.message}</>}
        <button type="button" onClick={() => this.setState({ error: null })}>Try again</button>
      </div>
    );
  }
}
