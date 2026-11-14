// Given: the Settings page: background (8.1), sync status, backup and sign-out.
import { useApp } from "@app/client/src/state/AppContext";
import { download, todayKey } from "@app/client/src/views/shared";
import { ThemePicker } from "@app/client/src/components/ThemePicker";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";

export function SettingsView({ onSignOut, syncText, backdrop, onBackdrop }: { onSignOut: () => void; syncText: string; backdrop: string; onBackdrop: (id: string) => void }) {
  const { state } = useApp();
  return (
    <section className="card stack">
      <h1>Settings</h1>
      <h2>Background</h2>
      <p className="muted">An animated scene behind your tasks. Animations stop when Reduce Motion is on.</p>
      <ErrorBoundary area="The theme picker"><ThemePicker value={backdrop} onChange={onBackdrop} /></ErrorBoundary>
      <h2>Your data</h2>
      <p>{syncText}</p>
      <div><button onClick={() => download(`threadwork-backup-${todayKey()}.json`, JSON.stringify({ app: "threadwork", exportedAt: new Date().toISOString(), state }), "application/json")}>Download a backup</button></div>
      <h2>Account</h2>
      <div><button onClick={onSignOut}>Sign out</button></div>
    </section>
  );
}
