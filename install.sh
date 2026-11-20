#!/usr/bin/env bash
# install.sh — installs the synthesis ladder skills into a skills folder.
#
#   ./install.sh [skills-folder]      default: ~/.claude/skills
#
# Copies each folder under skills/ into the target. Stops, and copies nothing, if any
# of them already exists there, or if the target holds the older package's skills
# (TitleCase folder names). Warns, without stopping, about the older package's loose
# files beside the skills folder. It never deletes or overwrites anything.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
dest="${1:-$HOME/.claude/skills}"

echo "S37 Synthesis Ladder installer"
echo "  package: $here"
echo "  target:  $dest"
echo

# The older package installed these names (and its abductive-reasoning skill under a
# TitleCase name too). Two copies of each rung would compete.
old=(L0TranscribeConversation L0TranscribeInterview L1FindingsExtraction L2ThemeSynthesis
     L3InsightSynthesis L4ArchetypeSynthesis L4DesignPrincipleSynthesis
     L4OpportunityAreaSynthesis L4ValuePropositionSynthesis L5FrameworkSynthesis
     DesignSynthesisLadder.md)
found=()
for n in "${old[@]}"; do [ -e "$dest/$n" ] && found+=("$dest/$n"); done
if [ ${#found[@]} -gt 0 ]; then
  echo "stop: the target holds the older SynthesisLadder package:"
  printf '  %s\n' "${found[@]}"
  echo
  echo "Both versions would load side by side and compete. Move or remove the folders above"
  echo "yourself (the older package also put files in agents/, config/ and tools/ beside the"
  echo "skills folder; see README.md, 'Upgrading'), then run this again. Nothing was copied."
  exit 1
fi

# The older package's loose files. Warn, don't stop: they may belong to a setup that is
# still in use, and only the owner can tell. A half-upgrade that leaves them behind should
# look like one (2026-09-30, first outside install).
parent="$(dirname "$dest")"
loose=("$dest/CORE/SkillGuardrails.md" "$parent/agents/Synthesist.md"
       "$parent/config/synthesis-gates.yaml" "$parent/tools/synthesis-gates-check"
       "$parent/tools/skill-guardrails-check" "$parent/tools/diarize"
       "$parent/tools/skill-workflow-notification")
left=()
for f in "${loose[@]}"; do [ -e "$f" ] && left+=("$f"); done
if [ ${#left[@]} -gt 0 ]; then
  echo "warning: files from the older package may still be here:"
  printf '  %s\n' "${left[@]}"
  echo "If they came with the older SynthesisLadder package, move them aside after installing"
  echo "(README.md, 'Upgrading'). If they belong to something else you use, leave them."
  echo
fi

for d in "$here"/skills/*/; do
  name="$(basename "$d")"
  if [ -e "$dest/$name" ]; then
    echo "stop: $dest/$name already exists; nothing was copied."
    echo "Move it aside and run this again."
    exit 1
  fi
done

mkdir -p "$dest"
for d in "$here"/skills/*/; do
  name="$(basename "$d")"
  cp -R "$d" "$dest/$name"
  echo "  installed $dest/$name"
done

# The release's VERSION file travels into ladder-core, so an installed copy can say which
# release it is (the package root, where it sits, is not installed).
[ -f "$here/VERSION" ] && cp "$here/VERSION" "$dest/ladder-core/VERSION" && echo "  installed $dest/ladder-core/VERSION"

core="$dest/ladder-core/scripts/diarize"
chmod +x "$core/diarize-transcript" "$core/tracks-transcript" "$core/setup.sh" 2>/dev/null || true

echo
echo "Done. The folders above must stay side by side."
echo "Next:"
echo "  1. ./verify.sh \"$dest\""
echo "  2. For the L0 transcription skills, build the diarize tool once:"
echo "       $core/setup.sh"
echo "  3. Optional, Claude Code only: copy extras/claude-code/agents/synthesist.md"
echo "     into ~/.claude/agents/ to add the Synthesist orchestrator agent."
