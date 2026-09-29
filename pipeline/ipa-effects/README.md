# IPA effect release build

The current display contract is [UI_STANDARD.md](../../UI_STANDARD.md). See [HANDOFF.md](../../HANDOFF.md) for local versus published state. Historical release notes below describe their dated implementation, not the publication status of later work.

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

Revealed answer words are now the shared replay controls in all three editions. Click/tap or Enter/Space replays the existing voice plus IPA animation; it neither advances the card nor retriggers scoring/hearts. Correction input stays editable and becomes a replay control only after completion. Replay runs above the invisible input overlay, and preserves the speech-completion gate for automatic advance. Inline IPA has been removed from explanation panels; FABLE commentary remains, while Mother Tongue's short notes appear in the cat's speech. `node pipeline/test-answer-replay.cjs` covers these interactions.

Mother Tongue embeds its headword input inside the original excerpt. Revealing an inflected or separated source form selects whole-IPA display at runtime, since the spoken headword's letter map must not be applied to different visible spelling. This is an additional display fallback and does not change the dictionary-based map counts below.

The existing browser voice selection and rate (.88) are unchanged. A request is scoped to its card; real SpeechSynthesis start/end events bound the effect. Internal syllable beats are estimates, with small in-memory timing caches; no audio assets or new network services are used. Manual navigation cancels speech immediately. Only the normal automatic reveal timer waits for unfinished speech. Missing start/end events have bounded deadlines, and replay/mute cannot discard the pending automatic advance. Copy input has no IPA overlay while typing. A completed copy uses the same revealed spelling, pronunciation, IPA effect, and automatic delay as an initially correct answer; its original incorrect-attempt record is preserved. Review roses are unchanged.

The shared formatter preserves ˈ and ˌ and uses #ffd34d for both. Overlay tracking is .01em; static IPA is no longer displayed in explanation panels. Both stress levels use 1.14em, including whole-IPA fallback. Aligned segments share the available answer width and a single scale factor, so a dense stressed segment cannot shrink independently below its neighbours. If this would require a scale below .86, or a segment wraps, the intact IPA is shown instead. The previous halo/ray intensities, glyph colors and fade-in are restored. All segments pop from 1 to 1.06 and back; this bounded range keeps the 1.14 stress hierarchy intact even between beats. The base font-size clamp is reduced by about 8% to clamp(23px,6.25vw,31px).

2026-09-29 release: FABLE 6,876 cards (6,076 mapped), Mother Tongue 6,498 cards (5,240 mapped), EBS 597 cards (466 mapped). All remaining cards display whole IPA. EBS has 545 authored pronunciation entries, selected by meaning where necessary. Four Mother Tongue IPA corrections are recorded in pronunciation-corrections.json.

Relevant checks:

```sh
node pipeline/ipa-effects/tests/conservation.test.cjs
node pipeline/ipa-effects/tests/advance.test.cjs
node pipeline/ipa-effects/tests/stress.test.cjs
node pipeline/ipa-effects/tests/layout.test.cjs
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

2026-09-29 combined feedback: restored the original heart burst for correct answers and completed copies alongside pronunciation. Heart sizing, speed, opacity and combo behaviour are unchanged. IPA is at z-index 41 above the existing effect layer at 40, so the heart outline cannot cover the phonetic symbols. Replay taps only replay pronunciation; they do not retrigger the answer heart.

2026-09-29 feedback refinement, approved for publication: corrected copy completion no longer triggers a heart. Initially correct answers keep their heart; completed copies retain pronunciation, IPA animation and normal advancement. Review roses remain unchanged. Unstressed IPA halo/ray intensity is now 22%/18% of the existing level, with primary and secondary stress retaining their original light and yellow color. Progress bars use solid #9b59cd instead of the pale gradient, while time bars keep #b8a2d4 and their existing danger color. Set/lesson labels use the existing white ink color. The user chose to retain the original page background; no alternative background palette is included.
