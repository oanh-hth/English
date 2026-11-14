// Exercise 7.3: LoginForm. Read curriculum/part-7/c-sign-in.md first.
import { Todo } from "@app/client/src/components/Todo";

export interface LoginFormProps {
  mode: "login" | "register";
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitchMode: () => void;
}

/**
 * A form with an <h2> "Sign in" (login) or "Create your account" (register), and:
 * - inputs labelled "Email" and "Password"; in register mode also "Repeat password"
 * - a submit button "Sign in" / "Create account". While waiting for onSubmit it is disabled and says "Please wait…"
 * - checks before calling onSubmit (show the first problem in role="alert"):
 *   "Enter a valid email address"; "Use at least 8 characters for the password" (register only);
 *   "The two passwords don't match" (register only)
 * - if onSubmit rejects, show the error's message in role="alert" and enable the button again
 * - a button "Create an account instead" (login) / "I already have an account" (register) that calls onSwitchMode
 */
export function LoginForm(props: LoginFormProps) {
  // TODO 7.3
  return <Todo exercise="7.3" what="The sign-in form" />;
}
