# Support

There is no service-level commitment and no paid support. Help is best effort. Questions, bugs and suggestions go in the repository's issues; see `CONTRIBUTING.md`. Security problems go privately, as `SECURITY.md` says.

## What it's tested on

`TEST-REPORT.md` gives the results for this release. In short:

### Models

The skills are instructions the model carries out, so how well they work depends on the model. They are designed for the top tiers of Claude models as of October 2026.

| Model | Status |
|---|---|
| Claude Opus and Sonnet, current versions | Used by the author on live engagements. The clean-account test did not record which model ran. |
| Claude Haiku | Not tested. Not recommended. |
| Other models | Not tested. |

### Agents

| How you use it | Status |
|---|---|
| Claude Code, from `install.sh` | Tested on a clean macOS account with none of the author's setup. |
| Other agents that read the Agent Skills format | Expected to work, because each skill is a folder with a `SKILL.md`. Not tested. The rung skills reach the shared files in `../ladder-core/`, which the format neither forbids nor describes; this is the first thing to check on another agent. |

### Platforms

| Part | Needs |
|---|---|
| The skills (L1 to L5) | Any operating system the agent runs on. |
| The two checkers and the survey scripts | [Bun](https://bun.sh). |
| The L0 transcription skills | macOS on Apple Silicon, [uv](https://docs.astral.sh/uv/), FFmpeg. Diarization of a mixed recording also needs a Hugging Face token whose account has accepted the three pyannote model licences; a recording with one audio file per participant needs no token. |

## Requirements

- An agent that loads skills from a folder.
- The thirteen skill folders installed side by side, as `install.sh` does.
