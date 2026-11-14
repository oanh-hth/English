// Given: the Settings page: sync status, backup and sign-out.
import { useApp } from "@app/client/src/state/AppContext";
import { download, todayKey } from "@app/client/src/views/shared";

export function SettingsView({ onSignOut, syncText }: { onSignOut: () => void; syncText: string }) {
  const { state } = useApp();
  return (
    <section className="card stack">
      <h1>Settings</h1>
      <h2>Your data</h2>
      <p>{syncText}</p>
      <div><button onClick={() => download(`threadwork-backup-${todayKey()}.json`, JSON.stringify({ app: "threadwork", exportedAt: new Date().toISOString(), state }), "application/json")}>Download a backup</button></div>
      <h2>Account</h2>
      <div><button onClick={onSignOut}>Sign out</button></div>
    </section>
  );
}
