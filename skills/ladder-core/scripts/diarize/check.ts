#!/usr/bin/env bun
/**
 * check.ts — guard-cadence entry for the diarize tool (Method D + Method S).
 *
 * Origin: as-built review 2026-07-23, Architect F2 — the tool's entire test
 * surface (test_diarize.py, test_tracks.py, doctrine-pointers.test.ts) ran
 * on-demand only, so the "detected by a tested sensor" ladder rung was only
 * as real as a human remembering three manual invocations across two
 * runtimes. This wrapper enrolls all three in the guard fleet: the cadence
 * registry discovers `tools/<dir>/check.ts` automatically, and run-guards'
 * DEFAULT_META carries the matching roster entry (unregistered = FAIL).
 *
 * Exit contract: 0 = both suites pass (this edition ships the two Python batteries; the doctrine-pointers suite stays with the author's setup) · 1 = any failure (no warn tier).
 * Runs in seconds: both Python batteries are pure-function suites (no model
 * loads — heavy imports in the tool are function-local by design).
 */
import { spawnSync } from 'bun';
import { existsSync } from 'fs';
import { join } from 'path';

const DIR = import.meta.dir;
const VENV_PY = join(DIR, 'venv', 'bin', 'python');
const PAI = join(DIR, '..', '..');

if (!existsSync(VENV_PY)) {
  // A machine that hasn't bootstrapped the venv cannot run the batteries —
  // that is a real coverage hole, not a pass. Fail loud with the remedy.
  console.error(`diarize check: venv missing at ${VENV_PY} — run ${join(DIR, 'setup.sh')}`);
  process.exit(1);
}

let failed = 0;
function run(label: string, cmd: string[], cwd: string) {
  const r = spawnSync({ cmd, cwd, stdout: 'pipe', stderr: 'pipe' });
  if (r.exitCode === 0) {
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label} (exit ${r.exitCode})`);
    const tail = (new TextDecoder().decode(r.stderr) || new TextDecoder().decode(r.stdout))
      .trim().split('\n').slice(-8).join('\n');
    console.error(tail.replace(/^/gm, '    '));
  }
}

run('test_diarize.py (Method D battery)', [VENV_PY, join(DIR, 'test_diarize.py')], DIR);
run('test_tracks.py (Method S battery)', [VENV_PY, join(DIR, 'test_tracks.py')], DIR);

process.exit(failed > 0 ? 1 : 0);
