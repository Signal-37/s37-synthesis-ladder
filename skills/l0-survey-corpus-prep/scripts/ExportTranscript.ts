// ExportTranscript: converts Claude Code session logs (JSONL) into the tool-neutral
// transcript format AuditRound.ts consumes: { calls: [{ ref, file, text }] }.
//
// Input: one or more JSONL paths (a session log, plus optionally its subagent logs).
// Each Read tool_use is paired with its tool_result by id. The read-ref is built as
// "read <basename> @ lines <a>-<b>", where a = the input's offset (default 1) and
// b = the last line number actually returned, derived from the result's own line-number
// prefixes when present, falling back to offset + limit - 1.
//
// Non-Read tool uses are ignored. tool_result content may be a plain string or an array
// of content blocks (only text blocks are read). tool_results with is_error: true are
// skipped entirely: an errored read never happened, and its fallback ref (offset..offset+
// limit-1) can otherwise collide with a later successful read's ref.

import { readFileSync } from "node:fs";

export interface TranscriptCall {
  ref: string;
  file: string;
  text: string;
}

export interface Transcript {
  calls: TranscriptCall[];
}

interface ToolUse {
  id: string;
  name: string;
  input: any;
}

interface ToolResult {
  tool_use_id: string;
  content: any;
  is_error: boolean;
}

function extractToolUses(obj: any): ToolUse[] {
  const content = obj?.message?.content;
  if (!Array.isArray(content)) return [];
  return content.filter((item: any) => item?.type === "tool_use").map((item: any) => ({ id: item.id, name: item.name, input: item.input }));
}

function extractToolResults(obj: any): ToolResult[] {
  const content = obj?.message?.content;
  if (!Array.isArray(content)) return [];
  return content
    .filter((item: any) => item?.type === "tool_result")
    .map((item: any) => ({ tool_use_id: item.tool_use_id, content: item.content, is_error: item.is_error === true }));
}

function resultContentToText(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c: any) => (typeof c === "string" ? c : c?.text ?? "")).join("");
  }
  return "";
}

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

interface LineRange {
  first: number;
  last: number;
}

function deriveLineRange(text: string, offset: number, limit: number | undefined): LineRange {
  // Read tool output is typically prefixed with a `cat -n` style line number per line,
  // e.g. "   401\tsome text". When present, the lowest and highest such numbers are
  // authoritative: "a" is the smallest line-number prefix ACTUALLY RETURNED, not just the
  // requested offset (which may differ, e.g. when offset is 0 -- the tool treats that as 1).
  const lines = text.split("\n");
  let minLineNum = Infinity;
  let maxLineNum = 0;
  for (const line of lines) {
    const m = /^\s*(\d+)\t/.exec(line);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n < minLineNum) minLineNum = n;
      if (n > maxLineNum) maxLineNum = n;
    }
  }
  if (maxLineNum > 0) return { first: minLineNum, last: maxLineNum };

  const fallbackFirst = offset > 0 ? offset : 1;
  if (limit !== undefined) return { first: fallbackFirst, last: fallbackFirst + limit - 1 };
  const nonEmptyLines = lines.filter((l) => l.length > 0);
  return { first: fallbackFirst, last: fallbackFirst + Math.max(nonEmptyLines.length - 1, 0) };
}

export function exportTranscript(jsonlContents: string[]): Transcript {
  const calls: TranscriptCall[] = [];
  const pendingReads = new Map<string, { filePath: string; offset: number; limit?: number }>();

  for (const content of jsonlContents) {
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    for (const line of lines) {
      let obj: any;
      try {
        obj = JSON.parse(line);
      } catch {
        continue;
      }

      for (const use of extractToolUses(obj)) {
        if (use.name === "Read") {
          pendingReads.set(use.id, {
            filePath: use.input?.file_path ?? "",
            offset: use.input?.offset ?? 1,
            limit: use.input?.limit,
          });
        }
      }

      for (const result of extractToolResults(obj)) {
        const pending = pendingReads.get(result.tool_use_id);
        if (!pending) continue;
        pendingReads.delete(result.tool_use_id);
        if (result.is_error) continue; // an errored read never happened
        const text = resultContentToText(result.content);
        const { first, last } = deriveLineRange(text, pending.offset, pending.limit);
        calls.push({
          ref: `read ${basename(pending.filePath)} @ lines ${first}-${last}`,
          file: pending.filePath,
          text,
        });
      }
    }
  }

  return { calls };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function mainCli() {
  const paths = process.argv.slice(2);
  if (paths.includes("--help")) {
    console.log("Usage:\n  bun ExportTranscript.ts <session.jsonl> [subagent.jsonl ...]\n  bun ExportTranscript.ts --help");
    process.exit(0);
  }
  if (paths.length === 0) {
    throw new Error("usage: ExportTranscript.ts <session.jsonl> [subagent.jsonl ...]");
  }
  const contents = paths.map((p) => readFileSync(p, "utf8"));
  const transcript = exportTranscript(contents);
  console.log(JSON.stringify(transcript, null, 2));
}

if (import.meta.main) {
  mainCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
