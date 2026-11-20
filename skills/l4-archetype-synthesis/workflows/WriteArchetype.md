# WriteArchetype Workflow

Craft a single L4 archetype card from a named behavioral cluster. Can be invoked from `SynthesizeArchetypes` (Step 11) or called directly when the user hands you a specific cluster to develop or revise.

---

## Step 0: Confirm Context

- **If called from within a SynthesizeArchetypes session:** inherit the data grounding, research grade, confidence ceiling, and domain confirmed in that workflow's Steps 3–4. The cluster definition, participant assignments, and Evidence Trail should already be in working form from Steps 5–7.
- **If called standalone:** ask the user for: project name, domain, research grade, confidence ceiling, the cluster's participant list, and the L2 themes that ground the cluster. Do not proceed without at least two independently-evidenced participants.

---

## When to Use

When you have a named behavioral cluster and need to write the card. Typical triggers:

- Called from `SynthesizeArchetypes` Step 11 for each derived archetype
- After `AuditArchetypeSet` flags a card for revision — the card needs a targeted rewrite, not a full re-synthesis
- When the user provides a cluster description and asks for a single archetype card

---

## The Critical Move at WriteArchetype

The move from a named cluster to a card is the move from an analytical claim ("these participants share a behavioral pattern") to a transmissible artifact — one that lets a designer who was never in the research sessions understand who this person is, what they do, and what the experience must do for them.

| State | Form | Risk |
|---|---|---|
| **Named cluster** | A group of participants with a shared behavioral pattern | The behavioral mode is in the synthesist's head, not on paper |
| **Archetype card** | A card that transmits the behavioral mode, its evidence, its design implications, and its observable indicators | Fabrication: the card sounds coherent but was not derived from the data |
| **Operationalized archetype** | A card that a designer, researcher, or strategist can apply without access to the original transcripts | Over-abstraction: the card is true but gives no actionable purchase |

---

## Grounding Check (Before Writing Anything)

Before writing a single field, run this check. It is the archetype-specific equivalent of the platzgeist check: is this behavioral mode genuinely present in the research, or is it a plausible-sounding type the synthesist constructed and then sought evidence to confirm?

Ask:

1. **Participant count:** Can you name two or more participants who independently exhibit this behavioral mode — without prompting from each other or from the synthesist's framing?
2. **Bottom-up emergence:** Did this mode emerge from behavioral accounts (what participants did), or was it posited top-down and then confirmed? If posited top-down, flag it as A priori hypothesizing in the Evidence Trail.
3. **Behavioral vs. attitudinal:** Is the evidence behavioral (what participants physically did, said spontaneously, avoided, or worked around) rather than attitudinal (what they said they prefer, value, or believe)? An archetype built on attitudinal evidence describes a preference cluster, not a behavioral mode.
4. **Negative cases exist:** Have you identified at least one participant who does not fit this cluster? A cluster with no negative cases either wasn't tested against contrary evidence or was over-fitted.

If the check fails on (1) or (3), do not write the card as a Full archetype — revise to Proto with the correct upgrade path, or collapse this cluster back into another.

---

## Writing Order

**Write in this sequence.** The order is not arbitrary — it prevents fabrication by grounding every element in behavioral evidence before moving to interpretation and implications.

### 1. Working name

Write a provisional name. It will be finalized in Step 5 after the evidence is laid out. Use a behavioral action label or a plain descriptor, whichever mode the set uses (see SKILL.md Core Concept 6). Mark it `[WORKING]` until finalized.

### 2. Evidence Trail

Write the Evidence Trail **before** the Behavioral Profile. This is the discipline that prevents the card from drifting into fabrication.

For each evidence entry:
- Name the L2 source theme
- Name the participant and field session(s)
- Name the LeCompte emergence type (Declaration, Frequency, Omission, Similarity, Co-occurrence, Corroboration/Triangulation, Sequence, A priori hypothesizing)
- Write one clause of behavioral evidence — what the participant did or said that grounds this archetype, not a paraphrase of the archetype's profile

**Name the negative cases.** For each participant whose behavior does not fit this cluster, note why — seed of another cluster, hybrid, or idiosyncratic. Under-fitting is preferable to fabrication.

Format: the Evidence Trail table from `ArchetypeFormat.md`.

### 3. Spectrum positions

With the Evidence Trail written, map the archetype across the four frog spectrums. Each position must be traceable to at least one entry in the Evidence Trail.

| Spectrum | Position | Behavioral evidence |
|---|---|---|
| Utility (Functional ↔ Emotional) | [position] | [one clause from evidence trail] |
| Swagger (Leader ↔ Follower) | [position] | [one clause] |
| Spontaneity (Routine ↔ Spontaneous) | [position] | [one clause] |
| Motivation (Self ↔ Validation) | [position] | [one clause] |

If a position cannot be evidenced from the Evidence Trail, note it as "Insufficient evidence — candidate position: [X]."

Document any custom dimensions added or substituted. Custom dimensions should only appear where the four spectrums genuinely do not capture a recurring axis of variation in the data.

### 4. Context triggers

Write both types. Neither is optional. If the data does not support one, say so explicitly rather than leaving the field empty.

**Situational triggers** — moment-level: time pressure, occasion type, functional vs. emotional mode sought. State what shifts and what evidence supports it.

**Developmental triggers** — phase-of-life: life events that activate or shift this behavioral mode durably. Not age ranges — life events (injury, return to sport, first major purchase, etc.). State the trigger and the evidence.

If no developmental triggers were surfaced in the research: "No developmental triggers identified in this dataset — see upgrade path in Confidence section."

### 5. Finalize name and one-line profile

Now that the evidence, spectrums, and triggers are written, finalize the name and write the one-line profile.

**Name finalization:**
- Is it behavioral (not demographic)?
- Does it use the same naming mode as the other archetypes in this set? (Consistency is required; mixing modes produces a fragmented set.)
- **First read:** could a reader with no project context say what kind of person this is from the name alone? If not, rewrite it from what the Evidence Trail shows the person does or wants. No figures of speech, wordplay, coined terms, or terms from the theory or the synthesis's working vocabulary.
- Is it distinct from the other archetype names?

**One-line profile:**
- Plain words, under the rules in `../l3-insight-synthesis/InsightFormat.md` → Plain Writing in the Body; the same rules apply to every section of the card
- Verb-forward — describes what the archetype *does*, not who they *are*
- Captures the behavioral mode, not a demographic snapshot
- Should work as a standalone sentence that orients a designer who has read nothing else

Remove the `[WORKING]` flag.

### 6. Key Indicators

Derive 3–5 KIs from the **behavioral specifics in the Evidence Trail** — not from the archetype's psychological profile or spectrum positions.

**KI observability test:** For each KI, ask: could a researcher in a store, a designer watching a session recording, or an analyst reading clickstream data apply this indicator without interpretation? If the indicator requires knowing what the participant was thinking or feeling, it is not a KI — it is a behavioral inference. Rewrite it as something observable.

**Observable (KI):** "Reaches for body-metaphors when asked why they're loyal — 'shin splints,' 'flying'" — detectable in a transcript or session recording.

**Not observable (not a KI):** "Has an inarticulate but deep brand loyalty" — this is a characterization, not an observable signal.

Format: a short bulleted list under `## Key Indicators` with an em-dash for any brief contextual note needed.

### 7. Design For (3–5 principles)

Derive from the behavioral profile, KIs, and Evidence Trail. Each principle:

- Names the design move (what the experience must do for this archetype)
- Names the behavioral rationale (why this archetype requires it, traced to evidence)
- Format: "**[Principle]** — [behavioral rationale from evidence]"

Test: if you removed the behavioral rationale and the principle still felt true, it is probably generic design guidance rather than archetype-specific. Add the rationale until removing it would diminish the principle.

### 8. Friction

What breaks the experience for this archetype — the conditions that produce disengagement, frustration, or abandonment. Each item traces to behavioral evidence.

Distinguish:
- **Significant friction:** described by participant but produced no workaround or exit
- **Extreme friction:** produced a workaround or purchase exit in the data

### 9. Leading Edge Signal

The edge-behavior participants in this cluster foreshadow what the mainstream archetype is heading toward (Chipchase Range of Distribution). Name:

- The specific behavior observed in 1–3 outlier participants
- What it implies for the mainstream archetype's near-future direction
- The design implication for this signal

If no leading-edge behavior was identified in this cluster: flag it explicitly rather than leaving the field empty or generic. A missing leading edge signal is an upgrade path item.

### 10. Journey Domains and Fluidity Note

**Journey domains:** In which purchase contexts or journey moments was this behavioral mode observed? List specifically.

**Fluidity note:** Is this archetype journey-specific or person-level? Person-level claims require cross-domain corroboration — name it if present. If journey-specific, say so explicitly and name the journey. Do not leave this ambiguous.

### 11. Confidence and Status

State:
- `Full` or `Proto` — must match the data gate declaration from SynthesizeArchetypes Step 4
- Confidence level: `High`, `Medium`, `Medium-Low`, or `Low`
- Rationale paragraph: reference the data gate outcome, research grade, participant count, and any data quality flags

If Proto: upgrade path must be specific — name the data gap, the participant threshold, and the research method needed.

### 12. YAML Frontmatter (Last)

Write last — it's the completeness check, not the starting point.

Required fields:
```
project:
archetype_id: ARCH-[NN]
synthesis_level: L4
archetype_status: [Full | Proto]
confidence: [High | Medium | Medium-Low | Low]
confidence_ceiling: <if capped by data quality — state why; omit if not applicable>
source_themes: [L2-T-NN, ...]
source_insights: [L3-NN, ...] (optional — populated during L3 coherence check)
journey_domains: [list]
synthesis_date: [YYYY-MM-DD]
domain: [brand/design | product/UX | organizational | policy/advocacy | other]   # domain registry: DomainScope.md | gate: ../ladder-core/config/synthesis-gates.yaml -> gates.domain_scope_confirmation
```

Optional cross-reference fields (populate when sibling L4 skills have run):
```
related_opportunity_areas: [OA-NN, ...]
related_value_propositions: [VP-NN, ...]
```

---

## Quality Check Before Finalizing

- [ ] Grounding check passed — 2+ independent participants; bottom-up emergence; behavioral (not attitudinal) evidence; negative cases named
- [ ] Name is behavioral, not demographic; consistent naming mode with the set; passes the first read (understood from the name alone, no figures of speech or coined terms)
- [ ] Card text follows Plain Writing in the Body (`../l3-insight-synthesis/InsightFormat.md`)
- [ ] One-line profile is verb-forward and describes behavioral mode, not demographic state
- [ ] Every spectrum position has a one-clause behavioral note traceable to the Evidence Trail
- [ ] Both situational and developmental trigger types addressed (or absence stated)
- [ ] 3–5 KIs present; each passes the observability test (researcher-detectable without interpretation)
- [ ] Evidence Trail cites L2 themes (not L3 summaries); emergence types named for every entry; negative cases documented
- [ ] Design For principles (3–5) each trace to a behavioral rationale from the evidence
- [ ] Friction entries trace to behavioral evidence; significance level indicated
- [ ] Leading edge signal present with named behavior, near-future implication, and design implication — or explicitly flagged as absent
- [ ] Journey domains listed; fluidity declared as journey-specific or person-level with evidence
- [ ] Confidence and Status: level assigned with rationale; Proto upgrade path is specific
- [ ] YAML frontmatter complete; `archetype_status` matches data gate; cross-reference fields populated if siblings have run

---

## Output

A formatted L4 archetype card ready for:
- Writing to `ARCH-[NN]_[Short_Name].md` in the project output directory
- Inclusion in the master `L4_Archetypes_[ProjectName].md` document
- Direct use in strategy presentation or client handoff
- Input to `AuditArchetypeSet` (the audit checks this card against five guardrails before L5 advancement)
