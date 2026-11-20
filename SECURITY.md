# Security

## What the ladder is

Thirteen skills written as instructions for an AI agent, the shared files they use, and a few scripts. The skills are Markdown. Nothing in the package runs on its own, and nothing in it sends your material anywhere. The agent you run the skills in, and the model behind that agent, are where your transcripts and findings go; their terms govern that, not the ladder's.

## The scripts, and what each one touches

| Script | Reads | Writes | Network |
|---|---|---|---|
| `install.sh` | the package | copies each skill folder into your skills folder, and the `VERSION` file into `ladder-core`; stops, copying nothing, if any of them already exists; never deletes or overwrites | none |
| `verify.sh` | your skills folder, and whether `HF_TOKEN` is set in the environment; it opens no file outside the skills folder | nothing | none |
| `ladder-core/scripts/synthesis-gates-check/` | the synthesis folder you point it at | nothing; prints a report | none |
| `ladder-core/scripts/skill-guardrails-check/` | the skills folder | nothing; prints a report | none |
| `ladder-core/scripts/diarize/setup.sh` | its own folder, and whether `HF_TOKEN` is set in the environment; it opens no file outside its own folder | a Python environment (`venv/`) inside its own folder | uv downloads Python 3.12 and the locked packages |
| `ladder-core/scripts/diarize/` (the two transcription tools) | the recording you name; for diarization (Method D), a Hugging Face token: `HF_TOKEN` from the environment, or, if that is unset, an `HF_TOKEN=` line in `~/.claude/.env` (`$PAI_DIR/.env` when `PAI_DIR` is set); no other script in the package opens that file | the draft transcript you name with `--out`; working audio in a temporary folder that is removed afterwards | the speech and diarization models download from Hugging Face on first use; the recording itself never leaves your machine |
| `l0-survey-corpus-prep/scripts/` | the survey export you name | corpus files in the output folder you name, and a ledger file | none |

## When a skill loads

Each skill's description says when to use it. An agent that chooses skills by description may load one when your request matches, without your naming it. Every move from one rung to the next is meant to be started by a person; the skills say so, but they are instructions, and an agent can ignore them.

## What it protects, and what it doesn't

The skills tell the agent to quote participants verbatim, to stop on a transcript whose speakers are unresolved, and to hold each level to its gates. They cannot stop an agent that ignores them, and they cannot keep material out of the model you choose. Consent, and what may be recorded or shared, are yours to manage before anything reaches the agent.

## Reporting a vulnerability

Report it privately to the author through the repository's Security tab ("Report a vulnerability"). Please don't open a public issue.
