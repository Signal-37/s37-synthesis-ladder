# Contributing

Thank you for wanting to help. For now we take issues, not pull requests. The ladder has one author, J. Scott King, and changes go through him. The files here are also built from the author's working copy, so a change made directly in this package would be overwritten at the next build.

## Opening an issue

Useful issues say:

- which skill, rung or file;
- the agent and the model you ran it with, and the operating system;
- what kind of material you ran it on (interview transcripts, a conversation, a survey export), what came back, and what you expected, with anything sensitive removed or replaced;
- for the L0 skills, which method you used (separate tracks or diarization) and what `verify.sh` reports;
- whether you can reproduce it.

The most useful reports are the ones where the ladder let something through that it should have stopped: a finding with no evidence behind it, a theme resting on fewer participants than its gate requires, an insight stated as fact, a transcript marked resolved with speakers still in question.

## Text you propose

If an issue includes text you'd like us to use, you certify the [Developer Certificate of Origin](https://developercertificate.org/): that you wrote it, or have the right to contribute it, under the ladder's licences. `LICENSING.md` says which files take which licence: CC BY-SA 4.0 for method content, Apache-2.0 for code, AGPL-3.0 for the diarize tool.

Add a line to the issue:

```
Signed-off-by: Your Name <you@example.com>
```

## Security problems

Don't open a public issue for a vulnerability. Report it privately, as `SECURITY.md` says.
