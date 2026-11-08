// Shared helpers for the course scripts.
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export interface Phase { id: string; folder: string; title: string; goal: string }
export interface Exercise { id: string; phase: string; slug: string; title: string; files: string[]; test: string; lesson: string }
export interface Course { phases: Phase[]; exercises: Exercise[] }

export const course: Course = JSON.parse(readFileSync(path.join(root, "curriculum/course.json"), "utf8"));

export interface FileResult { passed: number; failed: number }

/** Runs vitest once and returns pass/fail counts per test file (relative path). */
export function runTests(env: Record<string, string> = {}, files: string[] = []): Map<string, FileResult> {
  const out = path.join(root, ".vitest-results.json");
  spawnSync(process.execPath, [path.join(root, "node_modules/vitest/vitest.mjs"), "run", "--reporter=json", `--outputFile=${out}`, ...files],
    { cwd: root, env: { ...process.env, ...env }, stdio: "ignore" });
  const results = new Map<string, FileResult>();
  if (!existsSync(out)) return results;
  const json = JSON.parse(readFileSync(out, "utf8")) as { testResults: { name: string; assertionResults: { status: string }[] }[] };
  for (const f of json.testResults) {
    const rel = path.relative(root, f.name).split(path.sep).join("/");
    const passed = f.assertionResults.filter(a => a.status === "passed").length;
    results.set(rel, { passed, failed: f.assertionResults.length - passed || (f.assertionResults.length ? 0 : 1) });
  }
  return results;
}

export interface CheckItem { text: string; done: boolean }

/** Reads "- [ ]" / "- [x]" lines from a markdown file (optionally only under one heading). */
export function checklist(file: string, heading?: string): CheckItem[] {
  const full = path.join(root, file);
  if (!existsSync(full)) return [];
  let text = readFileSync(full, "utf8");
  if (heading) {
    const at = text.indexOf(`## ${heading}`);
    if (at < 0) return [];
    text = text.slice(at + 3);
    const next = text.indexOf("\n## ");
    if (next >= 0) text = text.slice(0, next);
  }
  return [...text.matchAll(/^\s*- \[( |x|X)\] (.+)$/gm)].map(m => ({ done: m[1] !== " ", text: m[2]!.trim() }));
}

export const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`, red: (s: string) => `\x1b[31m${s}\x1b[0m`, yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`, bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};
