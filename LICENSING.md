# Licensing

Copyright (c) 2026 J. Scott King. Ruled 2026-08-08.

Licences here are assigned **by artifact type, not by subject area** — content gets a content
licence, code gets a code licence. Creative Commons recommends against using CC licences for
software (no patent grant, no warranty terms written for code, and CC BY-SA does not compose with
common open-source licences), so a single licence across a package that contains both would be
wrong in one direction or the other.

## The map

This is the portable edition: the skills install as folders side by side, and the shared files, the checkers and the diarize tool sit in the `ladder-core` skill. `skills/ladder-core/LICENSING.md` repeats the map for that folder, and the licence texts are copied into it, so the terms install with the skills.


| What | Licence | File |
|---|---|---|
| **Method content** — all `.md`: the ladder, rung skills, doctrine, gates, prompts, maps, READMEs | **CC BY-SA-4.0** | `LICENSE` |
| **Code** — `.ts`, `.py`, `.sh`, and build/config files, *except* `skills/ladder-core/scripts/diarize/` | **Apache-2.0** | `LICENSE-CODE` |
| **`skills/ladder-core/scripts/diarize/`** — the transcription and diarization pipeline | **AGPL-3.0** | `skills/ladder-core/scripts/diarize/LICENSE` |

Where a file could be read either way, the licence follows the file's **function**, not its
extension. Configuration and lockfiles that exist to make code run are code.

**Clarified 2026-09-22 (Scott):** every file under `skills/ladder-core/scripts/diarize/` is AGPL-3.0, its `README.md` and
`CHANGELOG.md` included. The path row is more specific than the `.md` row and governs: the folder is
one unit, and its documentation's function is to operate the tool. This clarifies the 2026-08-08
map; it does not change the terms.

## Why each

**Content — CC BY-SA-4.0.** Share-alike keeps derivative method packs open: the ladder can be
extended, but an extension cannot be closed. Note what this does *not* do — it does not restrict
commercial use. A team running these methods internally is unconstrained, because internal use is
not distribution. The constraint applies only to redistributing derivatives.

**Code — Apache-2.0.** Installers and validators, including the two checkers. These are
utilities with low free-ride risk that are more useful the more widely they spread. Apache rather
than MIT for the explicit patent grant, which costs adoption nothing.

**`skills/ladder-core/scripts/diarize/` — AGPL-3.0.** This is the one component with a specific and plausible free-ride:
running it as a hosted service — upload a recording, receive a diarized transcript — without
contributing anything back. AGPL's §13 network clause forecloses exactly that, and no permissive
licence does. The cost is accepted knowingly: some organisations decline AGPL by policy, and for
those the answer is a separate grant from the copyright holder rather than a weaker public licence.

## Retained rights, and what that means for you

The copyright holder is **J. Scott King, individually.** These public licences are **non-exclusive**,
so they do not exhaust his rights: he can grant different terms directly, in parallel with these.

**If a licence here does not work for your situation — an AGPL policy bar, a need to incorporate the
method content into a work you cannot license share-alike — that is a conversation, not a dead end.**
Ask. The public licence is the floor, not the ceiling.

## Attribution

CC BY-SA-4.0 requires attribution. `NOTICE.md` carries the authorship and provenance record —
including what this work was influenced by, and the line between influence and authorship. Attribution
means crediting **J. Scott King**; the influences named in `NOTICE.md` are cited sources, not
co-authors, and crediting them as authors of this work would misstate it.

## Version and scope

These terms attach to **this package as distributed**, identified by the version and date it carries.
Public licences are irrevocable for the copies released under them: a copy received under these terms
stays under these terms. Later releases may carry different terms, and the version stamp is what makes
that unambiguous — always cite the version you received.

## Releases

Append-only. This section is the authoritative record of which release shipped under which terms —
the pair to cite is the version and date carried by the `VERSION` file in this package. Copies
distributed before versioning began (August 2026) are unversioned and carried no public licence
grant.

A third case sits between those two. Copies built **after these terms were adopted but before the
first versioned release** carry no `VERSION` file, because the version scheme deliberately does not
stamp a number before there is a release to number. They are pre-release builds, identified by the
build date in their archive filename, **and the grant stated in this document applies to them.** The
absence of a `VERSION` file marks a copy as pre-release; it does not withhold the licence.

- **v1.0**, built 2026-10-22: the terms in this document as of that date. Method content CC BY-SA-4.0 (`LICENSE`); code Apache-2.0 (`LICENSE-CODE`); `skills/ladder-core/scripts/diarize/` AGPL-3.0.
- **v1.0.1**, built 2026-10-23: terms unchanged from v1.0; fixes only (see `CHANGELOG.md`).
- **v1.0.2**, built 2026-10-26: terms unchanged from v1.0; fixes only (see `CHANGELOG.md`).
- **v1.1**, built 2026-10-26: terms unchanged from v1.0; content added (see `CHANGELOG.md`).
- **v1.1.1**, built 2026-10-27: terms unchanged from v1.0; fixes only (see `CHANGELOG.md`).
- **v1.1.2**, built 2026-10-28: terms unchanged from v1.0; fixes only (see `CHANGELOG.md`).
- **v1.1.3**, built 2026-11-01: terms unchanged from v1.0; fixes only (see `CHANGELOG.md`).
- **v1.2**, built 2026-11-03: terms unchanged from v1.0; content added (see `CHANGELOG.md`).
- **v1.2.1**, built 2026-11-05: terms unchanged from v1.0; documents only (see `CHANGELOG.md`).
- **v1.3**, built 2026-11-17: terms unchanged from v1.0; content added (see `CHANGELOG.md`).
- **v1.3.1**, built 2026-11-18: terms unchanged from v1.0; fixes only (see `CHANGELOG.md`).
- **v1.3.2**, built 2026-11-18: terms unchanged from v1.0; documents only (see `CHANGELOG.md`).
- **v1.3.3**, built 2026-11-20: terms unchanged from v1.0; fixes only (see `CHANGELOG.md`).
