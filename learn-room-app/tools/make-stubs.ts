/**
 * Maintainer tool: turns the reference solutions (solutions/src) into the learner's starting files (src).
 *
 * Inside a solution file:
 *   // @solution-start <hint for the learner>
 *   // @stub <optional line to keep instead of throwing>   (zero or more)
 *   ...the real code...
 *   // @solution-end
 * becomes
 *   // TODO: <hint>
 *   <the @stub lines, or: throw new Error('Not implemented yet');>
 *
 * Existing files in src/ are never overwritten (that would destroy the learner's work) unless --force is used.
 */
import { mkdirSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

export function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && line.length + 1 + word.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Convert one solution file into its stub. Pure: easy to test. */
export function stubSource(source: string): string {
  const out: string[] = [];
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string;
    const start = line.match(/^(\s*)\/\/ @solution-start\s*(.*)$/);
    if (!start) {
      out.push(line);
      continue;
    }
    const indent = start[1] ?? '';
    const hint = (start[2] ?? '').trim();
    const stubLines: string[] = [];
    i++;
    for (; i < lines.length && !/^\s*\/\/ @solution-end/.test(lines[i] as string); i++) {
      const stub = (lines[i] as string).match(/^\s*\/\/ @stub (.*)$/);
      if (stub) stubLines.push(stub[1] as string);
    }
    if (i >= lines.length) throw new Error('Missing // @solution-end');
    wrap(hint, 90 - indent.length).forEach((l, n) => out.push(`${indent}// ${n === 0 ? 'TODO: ' : '      '}${l}`));
    if (stubLines.length) stubLines.forEach((l) => out.push(`${indent}${l}`));
    else out.push(`${indent}throw new Error('Not implemented yet');`);
  }
  return out.join('\n');
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

export function generateStubs(options: { force?: boolean; only?: string[]; outDir?: string } = {}): string[] {
  const from = join(ROOT, 'solutions', 'src');
  const to = options.outDir ?? join(ROOT, 'src');
  const written: string[] = [];
  for (const file of walk(from)) {
    const rel = relative(from, file);
    if (options.only && !options.only.includes(rel)) continue;
    const target = join(to, rel);
    if (existsSync(target) && !options.force) continue;
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, stubSource(readFileSync(file, 'utf8')));
    written.push(rel);
  }
  return written;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const force = process.argv.includes('--force');
  const written = generateStubs({ force });
  console.log(written.length ? `Created ${written.length} file(s) in src/` : 'src/ is already up to date (use --force to overwrite).');
}
