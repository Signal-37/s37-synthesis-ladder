---
name: ladder-core
description: Shared files for the synthesis ladder skills. Holds the ladder map, the gates config, the guardrails doctrine, the two checkers and the diarize transcription tool. Use when a ladder skill points at a path starting ../ladder-core/, or to see how the ladder's levels fit together.
license: CC-BY-SA-4.0 for content, Apache-2.0 for code, AGPL-3.0 for scripts/diarize/. See LICENSING.md in this folder.
compatibility: The checkers need Bun. The diarize tool needs macOS on Apple Silicon, uv (which installs its Python 3.12) and FFmpeg.
---

# ladder-core

The synthesis ladder skills are one set. They share the files in this folder, so there is one copy of each and the skills cannot drift apart.

## What is here

- `ladder-map.md`: how the levels fit together, from recordings to the strategic framework, and which skill does which step. Start here.
- `config/synthesis-gates.yaml`: the gates every level is held to. It owns each gate's condition and number; the skills quote it and point at it.
- `skill-guardrails.md`: the guardrail types the skills use and their tag vocabulary.
- `scripts/synthesis-gates-check/check.ts`: a checker for the gates. Run it from this folder as `bun scripts/synthesis-gates-check/check.ts <project folder>`. It finds the gates config on its own.
- `scripts/skill-guardrails-check/check.ts`: a checker for the guardrail tags in the skills.
- `scripts/diarize/`: the transcription and speaker-attribution tool the two L0 skills use. Build it once with `scripts/diarize/setup.sh`; its README lists what it needs.
- `LICENSING.md`, `LICENSE`, `LICENSE-CODE`: which licence covers which file in this folder. `scripts/diarize/` carries its own `LICENSE`.

## How the other skills point here

A ladder skill refers to these files by a path that starts `../ladder-core/`. Resolve that path from the folder of the skill that cites it, which is the base directory your agent reports when it loads the skill. Do not resolve it from the project you are working in.

All the ladder skill folders and this one must sit side by side in the same skills folder.

## If Bun is missing

The checkers are TypeScript run by Bun. If `bun` is not found, try its usual full path, `~/.bun/bin/bun`, before concluding it is missing: on a new account the agent's shell may not have Bun's folder on its `PATH` even when the user's terminal does. If neither works, Bun is not installed: say so and stop. Do not run a modified copy of a checker under another runtime: a gate check run from a changed copy is not the gate check. Install Bun from https://bun.sh. On a new macOS account the installer cannot add itself to `~/.zshrc` if that file does not exist yet, so create the file first or add `~/.bun/bin` to your `PATH` by hand.

## Two folders outside this package

- The L0 skills write working state to `~/.claude/state/transcribe/`. They create it when needed.
- The diarize tool reads a Hugging Face token from `HF_TOKEN` in the environment, or from `~/.claude/.env` (`$PAI_DIR/.env` if `PAI_DIR` is set).
