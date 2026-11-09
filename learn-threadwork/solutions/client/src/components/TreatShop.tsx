import { useState, type FormEvent } from "react";
import type { Claimed, Harvest, Treat } from "@app/shared/types";
import { basketCount } from "@app/shared/treats";

export interface TreatShopProps {
  treats: Treat[];
  harvests: Harvest[];
  claimed: Claimed[];
  onClaim: (treatId: string) => void;
  onAdd: (name: string, cost: number) => void;
}

export function TreatShop({ treats, harvests, claimed, onClaim, onAdd }: TreatShopProps) {
  const have = basketCount({ harvests, claimed });
  const [name, setName] = useState("");
  const [cost, setCost] = useState(5);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, cost);
    setName("");
  }
  return (
    <section aria-label="Treat shop" className="shop">
      <p><b>{have}</b> fruit to spend</p>
      <ul>
        {treats.map(t => (
          <li key={t.id}>
            <span>{t.name}</span> <span className="muted">{t.cost} fruit</span>{" "}
            {t.cost <= have
              ? <button type="button" onClick={() => onClaim(t.id)}>Claim {t.name}</button>
              : <button type="button" disabled aria-label={`Claim ${t.name}`}>{t.cost - have} more fruit</button>}
          </li>
        ))}
      </ul>
      <form onSubmit={submit} aria-label="Add your own treat" className="row">
        <label htmlFor="t-name">Treat</label>
        <input id="t-name" value={name} onChange={e => setName(e.target.value)} />
        <label htmlFor="t-cost">Cost</label>
        <input id="t-cost" type="number" min={1} value={cost} onChange={e => setCost(Number(e.target.value))} />
        <button type="submit">Add treat</button>
      </form>
      <h3>Claimed</h3>
      <ul>
        {claimed.slice(-5).reverse().map((c, i) => <li key={i}>{c.name} · {c.day}</li>)}
      </ul>
    </section>
  );
}
