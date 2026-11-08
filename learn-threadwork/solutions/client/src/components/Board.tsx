import type { Day, Status, Task } from "@app/shared/types";
import { TaskCard } from "@app/client/src/components/TaskCard";

export const COLUMNS: { status: Status; name: string }[] = [
  { status: "inbox", name: "Inbox" },
  { status: "doing", name: "Doing" },
  { status: "done", name: "Done" },
];

export interface BoardProps {
  tasks: Task[];
  today: Day;
  onOpen: (id: string) => void;
  onMove: (id: string, status: Status) => void;
}

export function Board({ tasks, today, onOpen, onMove }: BoardProps) {
  return (
    <div className="board">
      {COLUMNS.map(col => {
        const list = tasks.filter(t => t.status === col.status);
        return (
          <section key={col.status} aria-label={col.name} className="column">
            <h2>{col.name} ({list.length})</h2>
            {list.length === 0 && <p className="empty">Nothing here</p>}
            {list.map(t => (
              <div key={t.id} className="card-wrap">
                <TaskCard task={t} today={today} onOpen={onOpen} />
                <div className="moves">
                  {COLUMNS.filter(c => c.status !== col.status).map(c => (
                    <button key={c.status} type="button" aria-label={`Move ${t.title} to ${c.name}`} onClick={() => onMove(t.id, c.status)}>
                      → {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
