// Given: users saved in one JSON file (data/users.json). Fine for a personal app with one or two accounts.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { User, UserRepo } from "@app/server/src/repos";

export function fileUserRepo(dir: string): UserRepo {
  const file = path.join(dir, "users.json");
  async function all(): Promise<User[]> {
    try { return JSON.parse(await readFile(file, "utf8")) as User[]; } catch { return []; }
  }
  return {
    async findByEmail(email) { return (await all()).find(u => u.email === email.toLowerCase()); },
    async create(user) {
      const users = await all();
      users.push({ ...user, email: user.email.toLowerCase() });
      await mkdir(dir, { recursive: true });
      await writeFile(`${file}.tmp`, JSON.stringify(users, null, 2));
      await rename(`${file}.tmp`, file);
    },
  };
}
