# IPA effect release build

Keep pronunciation data assembly before effect-map generation. Run these from the repository root when rebuilding all three editions:

```sh
python pipeline/assemble.py
python pipeline/assemble-mother-tongue-pronunciations.py
python pipeline/assemble-ebs-pronunciations.py
node pipeline/ipa-effects/alignment-check.cjs --write-report
node pipeline/ipa-effects/build-check.cjs
node pipeline/ipa-effects/build.cjs
node pipeline/ipa-effects/build.cjs --check
```

The existing game hooks are maintained in the HTML; this builder embeds only generated maps and the shared effect runtime/styles. It resolves Mother Tongue/EBS pronunciation `meanings` using the exact DATA Korean meaning, matching the game's `pronunciationEntry`. FABLE uses each card's existing IPA. A pronunciation label, at least one alternative containing IPA, or any exact-text difference between nonempty `speech` and the term forces whole-word display, matching `pronunciationEffectInfo`. This includes case and punctuation changes. Pronunciation alternatives do not receive separate effect entries.

The reported `alignedCards` and `wholeCards` match the pronunciation-data branch for every card. Layout can additionally choose whole-word display when a mapped segment wraps across rows or the rendered slot count differs. `forcedWholeCards` is the union of the three explicit conditions; `labeledCards`, `alternativeCards`, and `contextSpeechCards` are their individual counts and may overlap. The reasons table assigns one reason per whole-word card, prioritising label, alternatives, speech text, then alignment failure.

`build.cjs --dry-run` reports the same counts without modifying HTML. `--check` fails if any generated section is stale. Every run verifies idempotence and preserves the DATA and pronunciation assignments exactly. All three pages are validated before any page is written.

The runtime and map appear immediately after the opening tag of the main inline script containing DATA, so their variables are initialised before startup functions can call them. The shared stylesheet is inserted before the final closing style tag. Marker-delimited blocks are replaced on later builds:

```text
/* IPA_EFFECT_RUNTIME_START */ ... /* IPA_EFFECT_RUNTIME_END */
/* IPA_EFFECT_STYLES_START */ ... /* IPA_EFFECT_STYLES_END */
```

`IPA_EFFECT_MAPS` keys are the exact term, a tab, and the exact selected IPA. Aligned rows are `[start,end,ipa,flag,beat,weight]`, with flags 0 = ordinary, 1 = primary, 2 = secondary, 3 = silent. Whole-word fallbacks are intentionally omitted from the map and are rendered by the runtime from the original IPA. See [ALIGNMENT.md](ALIGNMENT.md) for the alignment contract and limitations.

## Playback and release validation

The existing browser voice selection and rate (.88) are unchanged. A request is scoped to its card; real SpeechSynthesis start/end events bound the effect. Internal syllable beats are estimates, with small in-memory timing caches; no audio assets or new network services are used. Manual navigation cancels speech immediately. Only the normal automatic reveal timer waits for unfinished speech. Missing start/end events have bounded deadlines, and replay/mute cannot discard the pending automatic advance. Copy input has no IPA overlay while typing. A completed copy uses the same revealed spelling, pronunciation, effect, and automatic delay as an initially correct answer; its original incorrect-attempt record is preserved. Review roses are unchanged.

The shared formatter preserves ˈ and ˌ and uses #ffd34d for both. Overlay and explanation tracking is .03em. Narrow/wrapped segments fall back to the intact IPA rather than crossing unrelated lines.

2026-09-29 release: FABLE 6,876 cards (6,076 mapped), Mother Tongue 6,498 cards (5,240 mapped), EBS 597 cards (466 mapped). All remaining cards display whole IPA. EBS has 545 authored pronunciation entries, selected by meaning where necessary. Four Mother Tongue IPA corrections are recorded in pronunciation-corrections.json.

Relevant checks:

```sh
node pipeline/ipa-effects/tests/conservation.test.cjs
node pipeline/ipa-effects/tests/advance.test.cjs
node pipeline/ipa-effects/tests/stress.test.cjs
node pipeline/ipa-effects/tests/host-hooks.test.cjs
node pipeline/test-mother-tongue-layout.cjs
node pipeline/test-mother-tongue-pronunciation-data.cjs
node pipeline/test-mother-tongue-pronunciation.cjs
node pipeline/test-ebs-pronunciation-data.cjs
node pipeline/test-textbook-ui.cjs
node pipeline/tests/session.test.cjs
```

Browser QA covers 320 px, 390 px and desktop widths, the reviewed photographic mapping, dotted IPA, heteronyms/context speech, long phrases and wrapped words.

2026-09-29 timing adjustment: reduce the normal reveal delay by 20%. Mother Tongue/EBS use 1,200 ms; FABLE keeps its explanation-length and retry-round rules, scaled to 80% (minimum no-note delay 1,760 ms, maximum 12 s, retry cap 4 s). Speech still finishes before automatic progression, while manual next remains unchanged. This replaced the original correct-answer timers; the subsequent copy-parity fix applies the same timers to completed copies.

2026-09-29 copy parity: a completed correction restarts pronunciation and IPA effects over canonical revealed slots, cancels any older error-reveal audio, and follows the course's normal reveal delay plus speech completion. Wrong-attempt counts, retry requirements, and perfect-streak eligibility remain unchanged.
