#!/bin/bash
# Bootstrap the diarize tool on a fresh machine: build the self-contained venv
# (pyannote.audio + mlx-whisper) and verify the runtime. Idempotent — safe to
# re-run; pass --force to rebuild the venv from scratch.
#
# Usage: $PAI_DIR/tools/diarize/setup.sh [--force]
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$DIR/venv"
PY_VERSION="3.12"

echo "▶ diarize setup — $DIR"

# 1. uv is required
if ! command -v uv >/dev/null 2>&1; then
  echo "✗ uv not found on PATH. Install it first: https://docs.astral.sh/uv/  (or: brew install uv)" >&2
  exit 1
fi

# 2. (re)create the venv
if [[ "${1:-}" == "--force" && -d "$VENV" ]]; then
  echo "  --force: removing existing venv"
  rm -rf "$VENV"
fi
if [[ -d "$VENV" ]]; then
  echo "  venv exists — reusing (pass --force to rebuild)"
else
  echo "  creating venv (python $PY_VERSION)…"
  # only-managed: use uv's own CPython, never a Homebrew or system Python that
  # happens to be on PATH, so the build is the same on every machine (reported
  # 2026-10-28: a Homebrew python@3.12 was picked up on a tester's account).
  uv venv --python "$PY_VERSION" --python-preference only-managed "$VENV"
fi

# 3. install deps — the FULL validated closure is frozen in requirements.lock
# (top-level combo MPS-verified 2026-07-01: torch 2.12.1 + pyannote.audio 4.0.7
# + mlx-whisper 0.4.3; closure frozen at the 2026-07-12 audit). Bump deliberately:
# change the top-level pins below, re-run with --force, re-verify step 4, then
# regenerate the lock: uv pip freeze --python "$VENV/bin/python" > "$DIR/requirements.lock"
if [[ -f "$DIR/requirements.lock" ]]; then
  echo "  installing from requirements.lock (full validated closure, ~mins first time)…"
  VIRTUAL_ENV="$VENV" uv pip install -r "$DIR/requirements.lock"
else
  echo "  ⚠ requirements.lock missing — installing top-level pins only (transitives may drift)…"
  VIRTUAL_ENV="$VENV" uv pip install "pyannote.audio==4.0.7" "mlx-whisper==0.4.3" "torch==2.12.1"
fi

# 4. verify runtime
echo "  verifying torch/mps + mlx-whisper…"
"$VENV/bin/python" - <<'PY'
import torch, mlx_whisper  # noqa: F401
assert torch.backends.mps.is_available(), "mps not available — Apple Silicon required"
print(f"  ✓ torch {torch.__version__}  mps=True  |  mlx-whisper import OK")
PY

# 5. runtime dependency: ffmpeg (the tool normalizes audio to 16k mono before inference)
if command -v ffmpeg >/dev/null 2>&1; then
  echo "  ✓ ffmpeg found ($(command -v ffmpeg))"
else
  echo "  ⚠ ffmpeg NOT on PATH — REQUIRED: the tool converts audio to 16 kHz mono via ffmpeg and will FAIL without it."
  echo "    Install: brew install ffmpeg"
fi

# 6. HF token + license reminder. The environment variable only: setup does not open
# files outside its own folder. When it runs, the diarize tool also reads an HF_TOKEN=
# line from ~/.claude/.env ($PAI_DIR/.env when PAI_DIR is set).
if [ -n "${HF_TOKEN:-}" ]; then
  echo "  ✓ HF_TOKEN set in the environment"
else
  echo "  ⚠ HF_TOKEN not set in this shell. Method D's pyannote models are gated and need it: export it, or put an HF_TOKEN= line in ~/.claude/.env, which the diarize tool reads when it runs. Method S (tracks-transcript) does not need it."
fi
# 7. model-cache integrity — byte-floors on the weight caches (2026-07-23
# three-chair spec). Caches lazy-download on FIRST RUN, so ABSENT is normal and
# passes; only a PRESENT-but-undersized cache (partial/corrupt download) fails
# loud, with the remedy named. Fail-loud exit 1 per house semantics (QA T6).
# NOTE: pyannote/speaker-diarization-3.1 is deliberately NOT floored — it is an
# 8 KB config-only dir; flooring it would false-fail (composite-model trap).
# Keep floors in step with MODEL_FLOORS_KB in diarize_transcript.py (the
# runtime companion that catches corruption at the moment it actually bites).
HF_HUB="${HF_HOME:-$HOME/.cache/huggingface}/hub"

check_model_floor() {  # <cache_dir_name> <min_KB> <human_name>
  local dir="$HF_HUB/$1" min="$2" name="$3" kb
  if [[ ! -d "$dir" ]]; then
    echo "  ℹ $name cache not present yet — downloads on first run (ok)"
    return 0
  fi
  # NOTE (as-built review, Engineer F4): du -sk counts blobs once + dir/symlink
  # overhead; the runtime check counts non-symlink file bytes only. Same floors,
  # slightly different byte sets — both conservative, divergence intentional.
  kb=$(du -sk "$dir" | awk '{print $1}')
  if (( kb < min )); then
    echo "  ✗ $name cache looks partial/corrupt: ${kb}KB < ${min}KB floor" >&2
    echo "    Remedy: rm -rf \"$dir\"  then re-run diarize-transcript (re-downloads)." >&2
    exit 1
  fi
  echo "  ✓ $name cache ok (${kb}KB)"
}

echo "  checking model-cache integrity…"
check_model_floor "models--pyannote--segmentation-3.0"               4000    "pyannote segmentation-3.0"
check_model_floor "models--pyannote--wespeaker-voxceleb-resnet34-LM" 20000   "pyannote wespeaker-embedding"
check_model_floor "models--mlx-community--whisper-large-v3-turbo"    1000000 "whisper-large-v3-turbo (default)"

cat <<EOF
  ℹ One-time: the token's Hugging Face account must accept the model licenses at
      https://huggingface.co/pyannote/speaker-diarization-3.1
      https://huggingface.co/pyannote/segmentation-3.0
      https://huggingface.co/pyannote/speaker-diarization-community-1
    (pyannote.audio 4.x loads parts of speaker-diarization-3.1 from community-1;
    without that licence Method D fails with a 403 GatedRepoError.)

✓ Setup complete. Test with:
    $DIR/tracks-transcript <dir-of-per-speaker-tracks> --out draft.md   # Method S, no token
    $DIR/diarize-transcript <audio> --out draft.md                      # Method D, needs HF_TOKEN
EOF
