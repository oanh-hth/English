// Given: the Garden page. Uses Plant (7.1), Sky + sceneFor (7.7), GardenPanel (7.2), TreatShop (7.4) and badges (2.4).
import { useApp } from "@app/client/src/state/AppContext";
import { Plant } from "@app/client/src/components/Plant";
import { Sky } from "@app/client/src/components/Sky";
import { GardenPanel } from "@app/client/src/components/GardenPanel";
import { TreatShop } from "@app/client/src/components/TreatShop";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { BADGES, computeStats, earnedBadges } from "@app/shared/badges";
import { isThirsty } from "@app/shared/dates";
import { todayKey } from "@app/client/src/format";
import { newId, useShell } from "@app/client/src/views/shared";

export function GardenView() {
  const { state, dispatch } = useApp();
  const { weather } = useShell();
  const today = todayKey();
  const g = state.garden;
  let earned: string[] = [], thirsty = false;
  try { earned = earnedBadges(computeStats(state.tasks, g, state.streak, state.focusSessions)); thirsty = isThirsty(state.streak.lastDone, today, g.growth) && weather?.kind !== "rain"; } catch { /* Part 2 not done yet */ }
  return (
    <div className="garden">
      <section className="card plant-card">
        <ErrorBoundary area="Your plant">
          <Sky weather={weather?.kind ?? null} isDay={weather?.isDay ?? null}>
            <div className={thirsty ? "thirsty" : ""}><Plant growth={g.growth} kind={g.kind} /></div>
          </Sky>
        </ErrorBoundary>
        {thirsty && <p className="warn">No task finished for a few days, so the leaves droop. Finish any task to water it.</p>}
        <ErrorBoundary area="Garden controls">
          <GardenPanel garden={g} onHarvest={() => dispatch({ type: "harvest", day: today })} onChooseSeed={kind => dispatch({ type: "chooseSeed", kind })} />
        </ErrorBoundary>
      </section>
      <div className="stack">
        <section className="card"><h2>Treats</h2>
          <ErrorBoundary area="The treat shop">
            <TreatShop treats={state.treats} harvests={g.harvests} claimed={state.claimed}
              onClaim={treatId => dispatch({ type: "claimTreat", treatId, day: today })}
              onAdd={(name, cost) => dispatch({ type: "addTreat", id: newId(), name, cost })} />
          </ErrorBoundary>
        </section>
        <section className="card"><h2>Badges</h2>
          <ul className="badges">{BADGES.map(b => <li key={b.id} className={earned.includes(b.id) ? "got" : ""}><b>{b.name}</b><small>{b.description}</small></li>)}</ul>
        </section>
      </div>
    </div>
  );
}
