import type { GardenState, PlantKind } from "@app/shared/types";
import { VARIETIES, isUnlocked } from "@app/shared/garden";
import { nextStage, stageOf } from "@app/shared/growth";

export interface GardenPanelProps {
  garden: GardenState;
  onHarvest: () => void;
  onChooseSeed: (kind: PlantKind) => void;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function GardenPanel({ garden, onHarvest, onChooseSeed }: GardenPanelProps) {
  const v = VARIETIES[garden.kind], next = nextStage(garden.growth);
  return (
    <section aria-label="Garden" className="garden-panel">
      <h2>{v.name} · {stageOf(garden.growth)}</h2>
      <label htmlFor="growth">Growth</label>
      <progress id="growth" value={Math.round(garden.growth)} max={100} />
      {garden.growth >= 100
        ? <button type="button" className="primary" onClick={onHarvest}>Harvest {v.fruits} {v.plural}</button>
        : next && <p>{Math.round(next.missing)}% to {next.name.toLowerCase()}</p>}
      <h3>Next seed</h3>
      <div className="seeds">
        {(Object.keys(VARIETIES) as PlantKind[]).map(k => {
          const locked = !isUnlocked(garden, k), need = VARIETIES[k].unlockAfter;
          return (
            <button key={k} type="button" aria-pressed={garden.nextKind === k} disabled={locked} onClick={() => onChooseSeed(k)}>
              {VARIETIES[k].name}{locked && <small> Unlocks after {plural(need, "harvest", "harvests")}</small>}
            </button>
          );
        })}
      </div>
      <p className="muted">{plural(garden.harvests.length, "harvest", "harvests")} so far</p>
    </section>
  );
}
