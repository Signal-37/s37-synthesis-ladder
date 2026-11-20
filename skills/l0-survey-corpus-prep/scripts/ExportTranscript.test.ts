import { describe, expect, test } from "bun:test";
import { exportTranscript } from "./ExportTranscript.ts";

function jsonl(objs: any[]): string {
  return objs.map((o) => JSON.stringify(o)).join("\n") + "\n";
}

function assistantToolUse(id: string, name: string, input: any) {
  return { type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id, name, input }] } };
}

function userToolResult(toolUseId: string, content: any) {
  return { type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: toolUseId, content }] } };
}

test("pairs a Read tool_use with its tool_result by id and derives lines from cat -n prefixes", () => {
  const log = jsonl([
    assistantToolUse("toolu_1", "Read", { file_path: "/x/wait-times.md", offset: 10, limit: 5 }),
    userToolResult("toolu_1", "10\t[r1] first row\n11\t[r2] second row\n12\t[r3] third row\n"),
  ]);
  const { calls } = exportTranscript([log]);
  expect(calls.length).toBe(1);
  expect(calls[0].ref).toBe("read wait-times.md @ lines 10-12");
  expect(calls[0].file).toBe("/x/wait-times.md");
  expect(calls[0].text).toContain("[r2] second row");
});

test("defaults offset to 1 when the Read input omits it", () => {
  const log = jsonl([
    assistantToolUse("toolu_1", "Read", { file_path: "/x/wait-times.md" }),
    userToolResult("toolu_1", "1\t[r1] first row\n2\t[r2] second row\n"),
  ]);
  const { calls } = exportTranscript([log]);
  expect(calls[0].ref).toBe("read wait-times.md @ lines 1-2");
});

test("falls back to offset + limit - 1 when the returned text has no line-number prefixes", () => {
  const log = jsonl([
    assistantToolUse("toolu_1", "Read", { file_path: "/x/wait-times.md", offset: 5, limit: 3 }),
    userToolResult("toolu_1", "no prefixes on this text at all"),
  ]);
  const { calls } = exportTranscript([log]);
  expect(calls[0].ref).toBe("read wait-times.md @ lines 5-7");
});

test("handles array tool_result content (text blocks), not just string content", () => {
  const log = jsonl([
    assistantToolUse("toolu_1", "Read", { file_path: "/x/wait-times.md", offset: 1 }),
    userToolResult("toolu_1", [{ type: "text", text: "1\t[r1] first row\n2\t[r2] second row\n" }]),
  ]);
  const { calls } = exportTranscript([log]);
  expect(calls[0].ref).toBe("read wait-times.md @ lines 1-2");
});

test("ignores non-Read tool uses", () => {
  const log = jsonl([
    assistantToolUse("toolu_1", "Bash", { command: "ls" }),
    userToolResult("toolu_1", "some directory listing"),
    assistantToolUse("toolu_2", "Read", { file_path: "/x/wait-times.md", offset: 1 }),
    userToolResult("toolu_2", "1\t[r1] first row\n"),
  ]);
  const { calls } = exportTranscript([log]);
  expect(calls.length).toBe(1);
  expect(calls[0].ref).toContain("wait-times.md");
});

test("combines calls from multiple JSONL inputs (a session log plus a subagent log)", () => {
  const sessionLog = jsonl([
    assistantToolUse("toolu_1", "Read", { file_path: "/x/a.md", offset: 1 }),
    userToolResult("toolu_1", "1\t[r1] a row\n"),
  ]);
  const subagentLog = jsonl([
    assistantToolUse("toolu_2", "Read", { file_path: "/x/b.md", offset: 1 }),
    userToolResult("toolu_2", "1\t[r2] b row\n"),
  ]);
  const { calls } = exportTranscript([sessionLog, subagentLog]);
  expect(calls.map((c) => c.file).sort()).toEqual(["/x/a.md", "/x/b.md"]);
});

test("uses the file basename in the ref, not the full path", () => {
  const log = jsonl([
    assistantToolUse("toolu_1", "Read", { file_path: "/deep/nested/path/to/wait-times.md", offset: 1 }),
    userToolResult("toolu_1", "1\t[r1] a row\n"),
  ]);
  const { calls } = exportTranscript([log]);
  expect(calls[0].ref).toBe("read wait-times.md @ lines 1-1");
});

function userToolResultError(toolUseId: string, content: any) {
  return { type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: toolUseId, content, is_error: true }] } };
}

test("eng S6: tool_results with is_error: true are skipped, not turned into a call with a fallback ref", () => {
  const log = jsonl([
    assistantToolUse("toolu_1", "Read", { file_path: "/x/holds.md", offset: 20, limit: 10 }),
    userToolResultError("toolu_1", "<tool_use_error>File content (35000 tokens) exceeds maximum allowed tokens</tool_use_error>"),
    assistantToolUse("toolu_2", "Read", { file_path: "/x/holds.md", offset: 20, limit: 5 }),
    userToolResult("toolu_2", "20\t[r20] a real row\n"),
  ]);
  const { calls } = exportTranscript([log]);
  expect(calls.length).toBe(1);
  expect(calls[0].ref).toBe("read holds.md @ lines 20-20");
});

test("eng minor: the ref's first line number is the smallest prefix actually returned, not the raw offset — offset 0 falls back to 1", () => {
  const log = jsonl([
    assistantToolUse("toolu_1", "Read", { file_path: "/x/a.md", offset: 0, limit: 3 }),
    userToolResult("toolu_1", "no prefixes here"),
  ]);
  const { calls } = exportTranscript([log]);
  expect(calls[0].ref).toBe("read a.md @ lines 1-3");
});

test("eng minor: when the tool returns fewer lines than requested (near EOF), the ref's last line reflects what was actually returned", () => {
  const log = jsonl([
    assistantToolUse("toolu_1", "Read", { file_path: "/x/a.md", offset: 10, limit: 20 }),
    userToolResult("toolu_1", "12\t[r12] a row\n13\t[r13] the last row\n"),
  ]);
  const { calls } = exportTranscript([log]);
  expect(calls[0].ref).toBe("read a.md @ lines 12-13");
});

test("arch M12: --help prints usage and exits 0", () => {
  const res = Bun.spawnSync(["bun", "ExportTranscript.ts", "--help"], { cwd: import.meta.dir });
  expect(res.exitCode).toBe(0);
  expect(res.stdout.toString()).toContain("Usage");
});
