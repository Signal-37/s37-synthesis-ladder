# S37 Synthesis Ladder (L0–L5)

J. Scott King's leveled synthesis ladder as a set of agent skills: from recordings to transcripts, findings, themes, insights, the four L4 artifacts, and a strategic framework. Level transitions are grounded in Jon Kolko's abductive synthesis and LeCompte & Schensul's pattern discipline. The package also carries the gates each level is held to, the guardrail doctrine, and the checkers that keep both honest.

This edition is built to the open Agent Skills specification: lowercase skill names that match their folders, no dependence on the author's own setup, and one support skill, `ladder-core`, that holds the files the rung skills share. It is meant to run on a clean Claude Code install with none of the author's setup.

**Version 1.3.3.** The `VERSION` file at the package root carries the version and the build date, and `install.sh` copies it into `ladder-core`; cite both when referring to your copy. See `LICENSING.md`, "Releases".

Released under the Signal 37 (S37) name. `CHANGELOG.md` says what changed, `TEST-REPORT.md` how it was tested, `SUPPORT.md` what it runs on, `SECURITY.md` what each script touches, and `CONTRIBUTING.md` and `GOVERNANCE.md` how to report a problem and who decides.

## What the ladder is

Every rung transition is triggered by a person, never automated.

| Rung | Skill | Produces |
|---|---|---|
| L0 | `l0-transcribe-interview`, `l0-transcribe-conversation`, `l0-survey-corpus-prep` | Attributed transcripts; citable corpus files from survey exports |
| L1 | `l1-findings-extraction` | Exhaustive per-participant findings |
| L2 | `l2-theme-synthesis` | Cross-participant behavioral themes (3+ independent participants) |
| L3 | `l3-insight-synthesis` | Insights: observation plus injected knowledge, provenance-labeled |
| L4 | `l4-opportunity-area-synthesis`, `l4-design-principle-synthesis`, `l4-value-proposition-synthesis`, `l4-archetype-synthesis` (a fan-out, not a sequence) | Where to act, how to act, what to offer, who you are designing for |
| L5 | `l5-framework-synthesis` | The integrated strategic framework, and the FinalLadderReview capstone |

`l0-survey-corpus-prep` brings open-text survey exports into the ladder: it turns a spreadsheet of verbatims into corpus files that `l1-findings-extraction` (Survey Variant) cites row by row, with saturation sampling for categories too large to read in full. `abductive-reasoning` makes the leaps between rungs explicit. `ladder-core/ladder-map.md` is the map of the whole system: read it first.

## Requirements

- An agent host that loads skills from a folder. Tested on Claude Code.
- **Bun**, for the two checkers and the audit pre-pass: https://bun.sh. On a new macOS account the Bun installer cannot add itself to `~/.zshrc` if that file does not exist yet; create it first, or add `~/.bun/bin` to your `PATH` by hand. If an agent reports that `bun` is not found although your terminal has it, the ladder's skills tell it to call `~/.bun/bin/bun` by its full path.
- **For the L0 transcription skills only:** macOS on Apple Silicon, **uv** (https://docs.astral.sh/uv/; `setup.sh` uses it to install Python 3.12 and the tool's locked dependencies), FFmpeg, and a Hugging Face token (the speaker-diarization models are gated). The token is read from `HF_TOKEN` in the environment, or from `~/.claude/.env` (`$PAI_DIR/.env` if `PAI_DIR` is set), and the Hugging Face account behind it must have accepted the licences of three pyannote models (one click each; the links are in `skills/ladder-core/scripts/diarize/README.md`). Without that the models will not download, even with a valid token. The token is needed only for Method D (automated diarization); Method S, one audio file per participant, runs without it.

## Install

```
./install.sh                  # into ~/.claude/skills
./install.sh <skills-folder>  # anywhere else
./verify.sh [skills-folder]
```

The installer copies the thirteen folders under `skills/` into the skills folder. It stops, and copies nothing, if any of them already exists there, or if the older package is installed. It never deletes or overwrites anything. The folders must stay side by side: the rung skills point at shared files by paths that start `../ladder-core/`.

Then, for the L0 skills, build the diarize tool once: `<skills-folder>/ladder-core/scripts/diarize/setup.sh`.

**Optional, Claude Code only:** `extras/claude-code/agents/synthesist.md` is an orchestrator agent that runs one rung per invocation. Copy it into `~/.claude/agents/` to use it.

## Upgrading from the older package

The older package used TitleCase folder names (`L2ThemeSynthesis` and the rest, the abductive-reasoning skill included), and it also put files beside the skills folder: `DesignSynthesisLadder.md` and `CORE/SkillGuardrails.md` in `skills/`, and `agents/Synthesist.md`, `config/synthesis-gates.yaml`, and `tools/` (the two checkers, `diarize`, `skill-workflow-notification`) in the folder above it. Installed together, the two versions would load side by side and compete. The installer stops if it finds the old skill folders, and warns, without stopping, if it finds the loose files. Move or remove all of them yourself, keeping anything you changed, then install. If you built the diarize tool before, its `venv/` folder can be moved into the new `ladder-core/scripts/diarize/` to skip a rebuild.

Three things the installer cannot see, because they live in your own setup rather than in the package:

- **Other skills that name the rungs.** If your own skills, agents, hooks or configuration refer to the old TitleCase names, those references now point at skills that no longer exist. Search your setup for the old names (`L1FindingsExtraction`, `L2ThemeSynthesis` and the rest) and update them. Leave the old names in dated records such as changelogs, where the name is part of what happened.
- **Fields your setup adds to skills.** If your system stamps its own frontmatter or blocks onto skills (a grouping field, say, or a block that sets which model a subagent runs on), the new skills arrive without them. Add them back. A lost model setting is easy to miss, because the skill still runs, on whatever model it inherits.
- **The synthesist agent.** If you already have a synthesist agent, merge `extras/claude-code/agents/synthesist.md` into it rather than copying it over. The shipped version carries the current rules (level audits run by a fresh agent, among others); your copy carries your setup (voice, startup context, file locations). Overwriting loses the second, and keeping yours loses the first.

## Layout

```
skills/
  ladder-core/                  shared files; not a rung
    SKILL.md  ladder-map.md  skill-guardrails.md  LICENSING.md  LICENSE  LICENSE-CODE
    config/synthesis-gates.yaml       the gates: each condition and number, owned here
    scripts/synthesis-gates-check/    checks a project against the gates (Bun)
    scripts/skill-guardrails-check/   checks the skills' guardrail tags (Bun)
    scripts/synthesis-audit-prepass/  lists candidates for each audit to judge (Bun)
    scripts/diarize/                  the L0 transcription tool (Python; AGPL-3.0)
  l0-survey-corpus-prep/ ... l5-framework-synthesis/   the twelve rung skills (l0-survey-corpus-prep/scripts/: Bun)
  abductive-reasoning/
extras/claude-code/agents/synthesist.md
install.sh  verify.sh  README.md  LICENSING.md  NOTICE.md  LICENSE  LICENSE-CODE
```

## Two folders outside the package

- The L0 skills keep working state in `~/.claude/state/transcribe/`, and create it when needed.
- The diarize tool's token file, above.

## Optional companions, not in this package

Some skills name other skills that sit outside the ladder: `DesignResearchPlanning` (discussion guides, before fieldwork) and `SensemakingSession`, which ship later in the S37 Design Research Kit, reviewer agents for FinalLadderReview, a Mermaid renderer for the L5 diagram, and a copy-edit skill for the audit passes. Where a rung routes to one of them, it says what to do without it, and nothing on the ladder's own path needs them. The product, service and experience design variants at L4 and L5, and the sufficiency check after L4 and L5, are described in the skills themselves.

## Provenance and licence

The ladder is Scott King's own work. `NOTICE.md` is the authorship and provenance record; attribution means crediting J. Scott King. Content is CC BY-SA-4.0, code Apache-2.0, and the diarize tool AGPL-3.0. `LICENSING.md` has the map and the reasons, and `skills/ladder-core/LICENSING.md` repeats the map for that folder, so the terms install with the skills.

## Anonymization

The worked examples are drawn from a real client engagement and are fully anonymized. The client appears as a fictional premium road-bike brand, **Meridian** (models such as the *Apex*; a fictional rival appears as the *Summit Vantage*), and every participant and dealer carries a pseudonym. Publicly known brands cited only as generic method examples are kept as references. Any resemblance of the fictional names to real companies is coincidental.
