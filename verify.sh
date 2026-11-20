#!/usr/bin/env bash
# verify.sh — checks an installed copy of the synthesis ladder skills. Read-only.
#
#   ./verify.sh [skills-folder]       default: ~/.claude/skills
#
# Exit 0 = everything present and green. Checker WARNs are reported, not fatal.
set -uo pipefail

dest="${1:-$HOME/.claude/skills}"
core="$dest/ladder-core"
fail=0
note() { printf '  %-4s %s\n' "$1" "$2"; }

echo "verifying the synthesis ladder skills in $dest"
[ -f "$dest/ladder-core/VERSION" ] && echo "  release: $(head -1 "$dest/ladder-core/VERSION")"
echo

# 1. the thirteen skill folders, each with a SKILL.md whose name matches its folder
for s in ladder-core l0-transcribe-conversation l0-transcribe-interview l1-findings-extraction \
         l2-theme-synthesis l3-insight-synthesis l4-archetype-synthesis \
         l4-design-principle-synthesis l4-opportunity-area-synthesis \
         l4-value-proposition-synthesis l5-framework-synthesis abductive-reasoning l0-survey-corpus-prep; do
  f="$dest/$s/SKILL.md"
  if [ ! -f "$f" ]; then note "FAIL" "$s/SKILL.md missing"; fail=1; continue; fi
  n="$(awk 'NR==1&&/^---/{f=1;next} f&&/^---/{exit} f&&/^name:/{sub(/^name:[ ]*/,"");print}' "$f")"
  if [ "$n" = "$s" ]; then note "OK" "$s"; else note "FAIL" "$s: name is '$n', not '$s'"; fail=1; fi
done

# 2. the shared files in ladder-core
for p in ladder-map.md skill-guardrails.md config/synthesis-gates.yaml LICENSING.md LICENSE LICENSE-CODE \
         scripts/synthesis-gates-check/check.ts scripts/skill-guardrails-check/check.ts \
         scripts/diarize/LICENSE; do
  [ -f "$core/$p" ] && note "OK" "ladder-core/$p" || { note "FAIL" "ladder-core/$p missing"; fail=1; }
done
[ -x "$core/scripts/diarize/tracks-transcript" ] && note "OK" "diarize tracks-transcript is executable" \
  || { note "FAIL" "ladder-core/scripts/diarize/tracks-transcript missing or not executable"; fail=1; }

# 3. the older package, installed alongside
for o in L2ThemeSynthesis DesignSynthesisLadder.md; do
  [ -e "$dest/$o" ] && { note "WARN" "$dest/$o is from the older package; the two versions will compete (README, 'Upgrading')"; }
done

# 4. the checkers (Bun)
if command -v bun >/dev/null 2>&1; then
  note "OK" "bun $(bun --version)"
  for t in synthesis-gates-check skill-guardrails-check; do
    if (cd "$core/scripts/$t" && bun test >/dev/null 2>&1); then note "OK" "$t: tests green"
    else note "FAIL" "$t: tests failed (run: cd $core/scripts/$t && bun test)"; fail=1; fi
  done
  if (cd "$dest/l0-survey-corpus-prep/scripts" && bun test >/dev/null 2>&1); then note "OK" "l0-survey-corpus-prep scripts: tests green"
  else note "FAIL" "l0-survey-corpus-prep scripts: tests failed (run: cd $dest/l0-survey-corpus-prep/scripts && bun test)"; fail=1; fi
  if bun "$core/scripts/synthesis-gates-check/check.ts" --source --root "$dest" >/dev/null 2>&1; then
    note "OK" "synthesis-gates-check --source: every gate pointer resolves"
  else note "WARN" "synthesis-gates-check --source reported findings; run it directly to review"; fi
  # one ladder folder at a time, so other skills in the same folder are never scanned
  worst=0
  for s in ladder-core l0-transcribe-conversation l0-transcribe-interview l1-findings-extraction \
           l2-theme-synthesis l3-insight-synthesis l4-archetype-synthesis \
           l4-design-principle-synthesis l4-opportunity-area-synthesis \
           l4-value-proposition-synthesis l5-framework-synthesis abductive-reasoning l0-survey-corpus-prep; do
    bun "$core/scripts/skill-guardrails-check/check.ts" "$dest/$s" "$core/skill-guardrails.md" >/dev/null 2>&1
    r=$?; { [ $r -eq 1 ] || [ $r -gt 2 ]; } && worst=1; [ $r -eq 2 ] && [ $worst -eq 0 ] && worst=2
  done
  case $worst in
    0) note "OK"   "skill-guardrails-check: clean" ;;
    2) note "INFO" "skill-guardrails-check: coverage WARNs (candidates for a human, not failures); run it directly to review" ;;
    *) note "FAIL" "skill-guardrails-check: HALT; run it directly to review"; fail=1 ;;
  esac
else
  note "FAIL" "bun not found. The two checkers need it: install from https://bun.sh"
  note ""     "(on a new macOS account, create ~/.zshrc first or add ~/.bun/bin to PATH by hand)"
  fail=1
fi

# 5. the diarize tool, once built
d="$core/scripts/diarize"
if [ -d "$d/venv" ]; then
  for b in test_diarize.py test_tracks.py test_lag.py; do
    if (cd "$d" && ./venv/bin/python "$b" >/dev/null 2>&1); then note "OK" "diarize $b green"
    else note "FAIL" "diarize $b failed"; fail=1; fi
  done
else
  note "INFO" "diarize not built yet: run $d/setup.sh before using the L0 skills"
fi
# The environment variable only: a verifier does not open files outside the skills folder.
if [ -n "${HF_TOKEN:-}" ]; then
  note "OK" "HF_TOKEN set in the environment (Method D also needs the pyannote model licences accepted; see the diarize README)"
else
  note "INFO" "HF_TOKEN not set in this shell. Method D diarization needs a token, from the environment or an HF_TOKEN= line in ~/.claude/.env, which the diarize tool reads when it runs; Method S does not need one"
fi

# 6. leftovers from the author's setup (the CHANGELOGs are history and are not searched)
left="$(grep -rlE --exclude=CHANGELOG.md 'skill-workflow-notification|Skill\("CORE"\)' "$dest"/ladder-core "$dest"/l[0-5]-* "$dest"/abductive-reasoning 2>/dev/null)"
[ -z "$left" ] && note "OK" "no setup-specific calls left" || { note "WARN" "setup-specific calls found:"; printf '       %s\n' $left; }

echo
[ $fail -eq 0 ] && echo "RESULT: verified" || echo "RESULT: failures above"
exit $fail
