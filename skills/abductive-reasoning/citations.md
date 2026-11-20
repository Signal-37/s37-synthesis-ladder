# abductive-reasoning — Citations

Full bibliographic record for all sources referenced in this skill. Organized by topic area. Each entry notes where the source is applied.

> **Attribution rule (2026-09-23):** a claim about what an author wrote either carries a checked locator or is phrased as general credit ("after X"), with the skill's own applications marked as such. Entries marked "checked" were read against the source on the date given; entries marked "restated to general credit" were not.
>
> **Epistemic status:** Author, work, and year entries may be cited directly. Finer-grained locators — page numbers, section references (e.g. §5.161–5.196), figure/diagram pages, journal volume/issue, DOIs — are `[model knowledge — verify]` unless a dated verification note on the entry says otherwise. Never quote a specific page, section, or verbatim passage from this file as verified fact in a client-facing output without checking it against the source first.

---

## I. Foundation: Abductive Logic and Inference Theory

**Peirce, C. S. (1931–1958).** *Collected Papers of Charles Sanders Peirce* (Vols. 1–8). C. Hartshorne, P. Weiss, & A. Burks (Eds.). Harvard University Press.
- The 1903 Harvard Lectures on Pragmatism, Lectures VI–VII (CP 5.161–5.196; abduction proper at 5.171–5.174 and 5.188–5.196). Peirce distinguishes abduction from induction and deduction (5.161, 5.171: abduction "is the only logical operation which introduces any new idea") and gives its form at 5.189: "The surprising fact, C, is observed; / But if A were true, C would be a matter of course, / Hence, there is reason to suspect that A is true." Surprise is the starting premise. This skill's formula ("surprising observation + background knowledge → best explanation") adapts that form: "background knowledge" and "best explanation" are the skill's glosses, and the second comes from the later inference-to-the-best-explanation literature (Harman, Lipton, Thagard); Peirce's conclusion is only that there is "reason to suspect." *(Checked against the source 2026-09-23.)*
- *Applied in:* SKILL.md (Form 1), ObservationToHypothesis (Step 1 trigger)

---

**Harman, G. H. (1965).** "The Inference to the Best Explanation." *Philosophical Review*, 74(1), 88–95.
- The paper that named "inference to the best explanation" (IBE) and argued for treating inductive inference in its terms. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* ObservationToHypothesis (Step 4 evaluation rationale)

---

**Lipton, P. (2004).** *Inference to the Best Explanation* (2nd ed.). Routledge.
- Book-length defense of IBE, known for distinguishing an explanation's "loveliness" (how much understanding it gives) from its "likeliness." *This skill's use:* the idea that a hypothesis must be good enough on its own, not just the best of the set, before it is selected. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* ObservationToHypothesis (Step 4 — the seven-virtue evaluation table there (scope, precision, mechanism, unification, simplicity, coherence, fruitfulness) is adapted from the IBE literature, principally Lipton, with virtues also standard across Thagard and the broader tradition; it is not a verbatim enumerated list from Lipton)

---

**van Fraassen, B. C. (1980).** *The Scientific Image.* Oxford University Press.
- Credited with the "bad lot" objection to IBE: the best of the hypotheses considered may still be wrong if the set was poor. Whether the objection is stated in this book or in his *Laws and Symmetry* (1989) is not checked. *This skill's use:* generating a diverse hypothesis set matters as much as evaluating it. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* ObservationToHypothesis (Step 3 — diversity requirement and bad lot prevention)

---

**Thagard, P. (1989).** "Explanatory Coherence." *Behavioral and Brain Sciences*, 12(3), 435–467.
- ECHO ("Explanatory Coherence by Harmany Optimization," Thagard's pun on Harman, p. 443) computational model. Treats hypothesis evaluation (inference to the best explanation) as constraint satisfaction: pairwise local coherence relations among hypotheses and evidence combine into global coherence, so a hypothesis's acceptability "potentially depends on its relation to a whole complex of hypotheses and data" (p. 463). A hypothesis is accepted "if it coheres better overall than its competitors" (p. 435). Thagard notes Peirce used "abduction" only for forming hypotheses, not evaluating them (pp. 435, 459). DOI: 10.1017/S0140525X00057046. *(Checked against the source 2026-09-23.)*
- *Applied in:* ObservationToHypothesis (Step 4 — Thagard coherence check appended to Lipton evaluation)

---

**Magnani, L. (2010).** *Abductive Cognition: The Epistemological and Eco-Cognitive Dimensions of Hypothetical Reasoning.* Cognitive Systems Monographs, Vol. 3. Springer. https://doi.org/10.1007/978-3-642-03631-6
- Extended treatment of abduction; the skill draws on its distinction between selective abduction (choosing among known hypotheses) and creative abduction (generating new ones), on manipulative abduction (thinking through action, such as sketching and modeling), and on the withdrawal of hypotheses. *This skill's use:* the withdrawal gate in ObservationToHypothesis and the negation-as-failure mode in ReasoningChain are the skill's operationalizations. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* SKILL.md (manipulative abduction note), ObservationToHypothesis (Step 3 — creative vs. selective mode check), ReasoningChain (Step 5 — negation as failure as a named failure mode)

---

## II. Design Abduction

**Kolko, J. (2010).** "Abductive Thinking and Sensemaking: The Drivers of Design Synthesis." *Design Issues*, 26(1), 15–28. MIT Press. https://doi.org/10.1162/desi.2010.26.1.15
- Connects Peirce's abduction to design synthesis: "Design synthesis is fundamentally a way to apply abductive logic within the confines of a design problem." *This skill's use:* abduction as the move at each level transition of the synthesis ladder (the ladder is the package author's framework, not Kolko's). *(Checked against the article PDF 2026-09-23.)*
- *Applied in:* SKILL.md (Based On), KnowledgeFunnelMapping (synthesis levels)

---

**Kolko, J. (2011).** *Exposing the Magic of Design: A Practitioner's Guide to the Methods and Theory of Synthesis.* Oxford University Press.
- Practical synthesis methodology grounded in Kolko's consulting and teaching practice. Ch. 3 (Abductive Reasoning, p. 23) is the primary design-abduction reference. The Section Three introduction (pp. 59–62, ahead of Ch. 6 proper, which begins p. 63) introduces the Three Chasms across the DIKW progression — Figure 6.1 and Table 6.1. The chasm-crossing methods span Ch. 6–8: affinity and flow diagramming (Ch. 6, Chasm 1); concept mapping, ecosystem mapping, and customer-journey mapping (Ch. 7, Chasm 2); reframing and insight combination (Ch. 8, Chasm 3). *(Locators verified against the book PDF 2026-07-11 — correcting an earlier attribution of concept/ecosystem mapping to "Ch. 4," which the book's own TOC contradicts.)*
- *Applied in:* SKILL.md (Based On), KnowledgeFunnelMapping (Three Chasms companion model)

---

**Dorst, K. (2011).** "The core of 'design thinking' and its application." *Design Studies*, 32(6), 521–532. https://doi.org/10.1016/j.destud.2011.07.006
- Sets out design reasoning in terms of WHAT (the object), HOW (the working principle) and VALUE, and distinguishes deduction, induction, and two kinds of abduction by which of these are known. Abduction-2, where only the value is known and both the object and the working principle must be found, is the distinctive challenge of design; frames make it workable. *(Primary text not checked; corroborated by a secondary reading summary, Learning Environments Design Reading Series, pressbooks.pub, 2026-09-23.)*
- *Applied in:* SKILL.md (Form 2 / Dorst's prospective abduction), ObservationToHypothesis (Step 0 — mode selection, prospective path), KnowledgeFunnelMapping (Mystery zone abduction type), FrameCreation workflow

---

**Dorst, K. (2015).** *Frame Innovation: Create New Thinking by Design.* MIT Press.
- Full elaboration of Frame Creation as a **9-step process**, shown as Figure 4.1 on p. 75: (1) Archaeology, (2) Paradox, (3) Context, (4) Field, (5) Themes, (6) Frames, (7) Futures, (8) Transformation, (9) Integration; each step described pp. 74–79. Paradox defined as "two or more conflicting statements" that are each true or valid but "cannot be combined for logical or pragmatic reasons" (p. 51). Frame formulation: "If the problem situation is approached as if it is … , then …" (p. 78). Futures step: frames judged by whether they put the work "on the right track," their "fruitfulness," and a "fledgling version of the value proposition for all of the parties involved" (pp. 78–79). Kings Cross (Sydney) is the recurring worked example in chapters 2–3; the book carries nineteen case studies (Preface, p. xvi; p. 2). Scope boundary (this skill's reading, not Dorst's term): Steps 1–7 are the design-based abductive/synthesis work; Steps 8–9 are feasibility, transformation agenda and organizational integration (pp. 79–80), outside the design synthesis mandate. *(All locators verified against the book PDF 2026-09-23. Removed that day as unsupported by the book: "most anonymized," and an unsourced claim that secondary sources cite ten steps.)*
- *Applied in:* FrameCreation workflow (primary source for the step structure)

---

**Dorst, K. (2015).** "Frame Creation and Design in the Expanded Field." *She Ji: The Journal of Design, Economics, and Innovation*, 1(1), 22–33. https://doi.org/10.1016/j.sheji.2015.07.003
- Argues that frame creation is the key design practice other fields can adopt, with design developing into an "expanded field" of practice; framing practices "can play an invaluable, even crucial role in organizational problem solving" (p. 26). Lays out the nine steps in a table (p. 26, spelled "Archeology") and groups them as groundwork (the first four) and exploration of the frames' implications for stakeholders (the rest, p. 27). *(Checked against the source 2026-09-23.)*
- *Applied in:* background only; no workflow cites it.

---

**Dorst, K. (2018).** "Mixing Practices to Create Transdisciplinary Innovation: A Design-Based Approach." *Technology Innovation Management Review*, 8(8), 60–65.
- Argues conceptually, with two brief examples (Kings Cross; a Design–Law exchange at UTS), that frame creation plus a four-layer model of practices lets practices be mixed across disciplines. Summarizes the nine steps (Figure 1, p. 62): "The first four steps lay the groundwork; the latter steps explore the implications of the potential frames and proposed solution directions" (p. 61). It does not separate Steps 8–9; FrameCreation's 1–7 scope boundary is this skill's own reading. DOI: 10.22215/timreview/1179. *(Checked against the source 2026-09-23.)*
- *Applied in:* background only. *(An earlier version credited this article with a 1–7 / 8–9 "organizational embedding" split it does not make.)*

---

**Goldschmidt, G. (2014).** "Linkographic evidence for concurrent divergent and convergent thinking in solution-oriented design sessions." *Design Studies*, 35(4), 401–424.
- Linkographic protocol study of design sessions showing divergent and convergent thinking occurring together, move by move. *This skill's use:* design abduction as many small leaps during sketching rather than one large one. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* SKILL.md (manipulative abduction context), ObservationToHypothesis (creative abduction note)

---

## III. Sensemaking and Naturalistic Decision Making

**Martin, R. (2009).** *The Design of Business: Why Design Thinking is the Next Competitive Advantage.* Harvard Business Press.
- Source of the Knowledge Funnel (Mystery → Heuristic → Algorithm) and of the argument that design thinking works at the mystery end, where abductive reasoning is needed. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* SKILL.md (Based On), KnowledgeFunnelMapping (primary model)

---

**Klein, G. A. (1993).** "A Recognition-Primed Decision (RPD) Model of Rapid Decision Making." In G. A. Klein, J. Orasanu, R. Calderwood, & C. E. Zsambok (Eds.), *Decision Making in Action: Models and Methods* (pp. 138–147). Ablex.
- The recognition-primed decision (RPD) model: experienced decision makers recognize a situation as a familiar type, which suggests a workable course of action without comparing many options. *This skill's use:* an anomaly that breaks recognition as the analogue of Peirce's surprising fact. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* ReasoningChain (data-frame lens, entering frames field)

---

**Klein, G., Phillips, J. K., Rall, E. L., & Peluso, D. A. (2007).** "A Data-Frame Theory of Sensemaking." In R. R. Hoffman (Ed.), *Expertise Out of Context: Proceedings of the Sixth International Conference on Naturalistic Decision Making* (pp. 113–155). Lawrence Erlbaum Associates.
- The data-frame theory: sensemaking as fitting data into a frame and a frame around data, with the frame elaborated, questioned, or replaced as data accumulate. *This skill's use:* reframing, when anomalies can no longer be absorbed by elaborating the current frame, corresponds to abduction-2. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* ReasoningChain (Why This Matters section, entering frames, frame status fields), FrameCreation workflow

---

**Weick, K. E. (1995).** *Sensemaking in Organizations.* Sage.
- Properties of organizational sensemaking, among them that it is driven by plausibility rather than accuracy, is retrospective, and is enactive. *This skill's use:* a reasoning chain needs to be plausible enough to act on, and the research questions asked shape the data available. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* ReasoningChain (plausibility threshold for the chain document)

---

## IV. Cognitive Bias in Abductive Reasoning

**Hallihan, G. M., & Shu, L. H. (2013).** "Considering Confirmation Bias in Design and Design Research." *Journal of Integrated Design and Process Science*, 17(4), 19–36. https://doi.org/10.3233/jid-2013-0019
- Considers confirmation bias in design and design research. *This skill's use:* the confirmation-bias item in the ObservationToHypothesis bias checkpoint (favoring supporting evidence, underweighting outlier participants). *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* ObservationToHypothesis (Step 5 — bias checkpoint, confirmation bias item)

---

**Tversky, A., & Kahneman, D. (1974).** "Judgment under Uncertainty: Heuristics and Biases." *Science*, 185(4157), 1124–1131.
- The landmark synthesis that named representativeness, availability, and anchoring-and-adjustment and their biases, drawing on the authors' and others' earlier experiments. Anchoring: estimates adjusted from an initial value, including one "suggested by the formulation of the problem," are "typically insufficient" (p. 1128). Availability: people judge frequency and probability by how easily instances come to mind, and salience and recency raise that ease (p. 1127). *This skill's application, not theirs:* the client brief can act as an anchor, and vivid or recent fieldwork stories can take too much weight among hypotheses. *(Checked against the source 2026-09-23.)*
- *Applied in:* ObservationToHypothesis (Step 5 — availability bias and brief anchoring items)

---

**Croskerry, P. (2002).** "Achieving Quality in Clinical Decision Making: Cognitive Strategies and Detection of Bias." *Academic Emergency Medicine*, 9(11), 1184–1204.
- Cognitive forcing strategies in clinical decision making: deliberate checks that interrupt automatic pattern completion. *This skill's use:* diagnosis as an analogue of design synthesis, and the bias checkpoint as a forcing strategy; the designer-client parallel is the skill's. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* ObservationToHypothesis (Step 5 — motivated reasoning item and general bias checkpoint rationale)

---

## V. Qualitative Research Methodology

**Timmermans, S., & Tavory, I. (2012).** "Theory Construction in Qualitative Research: From Grounded Theory to Abductive Analysis." *Sociological Theory*, 30(3), 167–186. https://doi.org/10.1177/0735275112457914
- Argues that grounded theory's commitment to letting theory emerge inductively, "rather than imposing analytic frameworks a priori," is in part why it has produced little theoretical innovation (p. 167). Abductive analysis as the correction: surprising observations "depend on a theoretically sensitized observer" (p. 173), so researchers bring existing theory to the data. Names three processes: revisiting, defamiliarization, and alternative casing (p. 167; pp. 176–177). Defamiliarization: inscription (field notes, transcripts, coding) creates "semantic distance from the taken for granted" (p. 177). Alternative casing: working a small data excerpt through different theoretical frameworks, "trying to find as many possible ways to understand the data as can be found" (p. 177). *(Checked against the source 2026-09-23.)*
- *Applied in:* ObservationToHypothesis (Step 1 — surprise test, informed by pp. 169, 173; Step 3 — alternative casing)

---

**Tavory, I., & Timmermans, S. (2014).** *Abductive Analysis: Theorizing Qualitative Research.* University of Chicago Press.
- Book-length treatment of abductive analysis, developing the processes the 2012 article names: revisiting, defamiliarization, and alternative casing (see the 2012 entry for those, checked). *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* ObservationToHypothesis (Step 3 alternative casing; Step 3 diversity requirement rationale)

---

**Ragin, C. C. (1992).** "Introduction: Cases of 'What Is a Case?'" In C. C. Ragin & H. S. Becker (Eds.), *What Is a Case? Exploring the Foundations of Social Inquiry* (pp. 1–17). Cambridge University Press.
- "Casing": deciding what an observation is a case *of*. Timmermans & Tavory cite Ragin and Becker (1992) for it (2012, p. 177). *This skill's use:* naming the category each hypothesis treats an observation as. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* ObservationToHypothesis (Step 3 — alternative casing technique, theoretical category naming)

---

## VI. Mental Models

**Johnson-Laird, P. N. (1983).** *Mental Models: Towards a Cognitive Science of Language, Inference, and Consciousness.* Cambridge University Press.
- Mental models as the structures through which people reason about the world. *This skill's use:* the mental model as the "background knowledge" in its abductive formula, setting what counts as surprising. *(Restated 2026-09-23 to general credit; source not checked.)*
- *Applied in:* SKILL.md (Based On — insight and mental models)

---

## VII. Critical and Secondary Sources (Frame Creation)

**Weedon, S. (2019).** "The Core of Kees Dorst's Design Thinking: A Literature Review." *Journal of Business and Technical Communication*. https://doi.org/10.1177/1050651919854077
- Literature review presenting Dorst's work as a framework for design thinking. Per its abstract, it covers three areas: Dorst's conception of design problems and how it differs from earlier design paradigms, his approach to design thinking and his problem-framing method, and the method's availability for technical communication work. *(Restated 2026-09-23 to the abstract: the earlier entry credited Weedon with a claim, limited evidence of transfer to non-designers, that the abstract does not make. The teachability of frame generation, the step from themes to frames, is this skill's own caveat, carried in FrameCreation's Known Limitations, not Weedon's.)*
- *Applied in:* FrameCreation workflow (limitations section)

---

**Lee, J.-J. (2020).** "Frame Failures and Reframing Dialogues in the Public Sector Design Projects." *International Journal of Design*, 14(1), 81–94. *(Pages added 2026-09-23, checked against the journal's article page.)*
- Documents specific types of frame failure in university-government collaboration contexts: clients unable to detach from original frames; new frames rejected because they could not be mapped onto existing organizational structures; frames that were intellectually coherent but organizationally threatening. Identifies three practitioner responses to frame failure: frame mitigation, frame simulation, frame familiarization.
- *Applied in:* FrameCreation workflow (frame evaluation, failure conditions)

---

**Huh, J. (2016).** "Visual Anatomy of Frame Creation in Abductive Reasoning by way of the Semiotic Square." *Archives of Design Research*, 29(2), 47–63. https://aodr.org/xml/06443/06443.pdf *(Corrected 2026-09-23 against the paper: the entry had issue 29(3) and a shortened title. An earlier version was presented at IASDR 2015.)*
- Visual mapping of the abductive logic within Frame Creation. Useful for understanding the structural relationship between themes, frames, and the abductive inference operation in Step 6.
- *Applied in:* FrameCreation workflow (themes-to-frames operation)

---

## Citation Format Note

Citations use Chicago author-date style throughout. Where DOIs are available they are included. Page ranges given for book chapters. Second and later editions noted. Works without confirmed publication details (e.g., specific Peirce passages) reference standard scholarly editions.

---

*Last updated: 2026-06-03*
*Sources added 2026-06-03: Dorst 2011, Dorst 2015 (MIT Press), Dorst 2015 (She Ji), Dorst 2018 (TIM Review), Magnani 2010, Lipton 2004, van Fraassen 1980, Thagard 1989, Klein 1993, Klein et al. 2007, Weick 1995, Timmermans & Tavory 2012, Tavory & Timmermans 2014, Hallihan & Shu 2013, Tversky & Kahneman 1974, Croskerry 2002, Goldschmidt 2014, Ragin 1992, Weedon 2019, Lee 2020, Huh 2016*
*Sources carried from prior versions: Peirce (Collected Papers), Harman 1965, Kolko 2010, Kolko 2011, Martin 2009, Johnson-Laird 1983*
*Correction noted: Dorst's Frame Creation is 9 steps — Figure 4.1, Frame Innovation 2015, p. 75, verified against the book PDF 2026-09-23.*
