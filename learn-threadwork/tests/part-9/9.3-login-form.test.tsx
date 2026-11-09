// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@app/client/src/components/LoginForm";

describe("9.3 LoginForm", () => {
  it("signs in with email and password", async () => {
    const onSubmit = vi.fn(async () => {});
    render(<LoginForm mode="login" onSubmit={onSubmit} onSwitchMode={() => {}} />);
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Repeat password")).toBeNull();
    await userEvent.type(screen.getByLabelText("Email"), " me@example.com ");
    await userEvent.type(screen.getByLabelText("Password"), "pw");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(onSubmit).toHaveBeenCalledWith("me@example.com", "pw");
  });
  it("checks the email first", async () => {
    const onSubmit = vi.fn(async () => {});
    render(<LoginForm mode="login" onSubmit={onSubmit} onSwitchMode={() => {}} />);
    await userEvent.type(screen.getByLabelText("Email"), "nope");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email address");
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("checks password rules when registering", async () => {
    const onSubmit = vi.fn(async () => {});
    render(<LoginForm mode="register" onSubmit={onSubmit} onSwitchMode={() => {}} />);
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Password"), "short");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Use at least 8 characters for the password");
    await userEvent.type(screen.getByLabelText("Password"), "-but-long");
    await userEvent.type(screen.getByLabelText("Repeat password"), "different");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByRole("alert")).toHaveTextContent("The two passwords don't match");
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("shows a waiting state, then the server error", async () => {
    let reject!: (e: Error) => void;
    const onSubmit = vi.fn(() => new Promise<void>((_, r) => { reject = r; }));
    render(<LoginForm mode="login" onSubmit={onSubmit} onSwitchMode={() => {}} />);
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Password"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("button", { name: "Please wait…" })).toBeDisabled();
    reject(new Error("Email or password is wrong"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is wrong");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });
  it("switches mode", async () => {
    const onSwitchMode = vi.fn();
    const { rerender } = render(<LoginForm mode="login" onSubmit={async () => {}} onSwitchMode={onSwitchMode} />);
    await userEvent.click(screen.getByRole("button", { name: "Create an account instead" }));
    rerender(<LoginForm mode="register" onSubmit={async () => {}} onSwitchMode={onSwitchMode} />);
    await userEvent.click(screen.getByRole("button", { name: "I already have an account" }));
    expect(onSwitchMode).toHaveBeenCalledTimes(2);
  });
});
