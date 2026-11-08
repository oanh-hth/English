// Given: simple storage interfaces with in-memory versions (used by tests and as a starting point).
import type { Task } from "@app/shared/types";

export interface TaskRepo {
  list(): Promise<Task[]>;
  get(id: string): Promise<Task | undefined>;
  save(task: Task): Promise<void>;
  remove(id: string): Promise<boolean>;
}

export function memoryTaskRepo(initial: Task[] = []): TaskRepo {
  const map = new Map(initial.map(t => [t.id, t]));
  return {
    async list() { return [...map.values()]; },
    async get(id) { return map.get(id); },
    async save(task) { map.set(task.id, task); },
    async remove(id) { return map.delete(id); },
  };
}

export interface User { id: string; email: string; passwordHash: string }

export interface UserRepo {
  findByEmail(email: string): Promise<User | undefined>;
  create(user: User): Promise<void>;
}

export function memoryUserRepo(): UserRepo {
  const users = new Map<string, User>();
  return {
    async findByEmail(email) { return users.get(email.toLowerCase()); },
    async create(user) { users.set(user.email.toLowerCase(), user); },
  };
}
