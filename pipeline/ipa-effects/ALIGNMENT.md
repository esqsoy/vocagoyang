# Build-time spelling and IPA cues

`alignment.cjs` exports `align(term, ipa)` and is used only by the release builder.
It does not generate pronunciations and does not run in the game.

The return value is `{mode, parts, basis? , reason?}`. Each part has:

- `start`, `end`: zero-based, half-open **ASCII letter-slot** range. Spaces and punctuation do not count as slots.
- `ipa`: the original supplied IPA symbols for this part; primary and secondary stress marks are retained.
- `stress`, `secondary`, `silent`: explicit booleans.
- `beat`: a zero-based approximate syllable cue. All parts with the same beat must light together.
- `weight`: a suggested beat weight. Silent parts always have zero weight. For shared beats use the maximum weight, not the sum.

Aligned mode requires a complete path through known spelling-to-sound correspondences that consumes the entire spelling and supplied IPA. Dynamic programming runs at build time only. No proportional or equal-letter-count split is used. The few near-equal paths with different vowel ranges fall back. A grapheme that crosses an explicit stress boundary also falls back; for example the x in `experience` can span /k/ and /s/ on opposite sides of the marked boundary.

After alignment, syllable cues use explicit IPA syllable dots and stress positions first and familiar onset clusters for the unmarked boundaries. These are teaching cues, not measured phoneme times or a claim that English orthographic syllabification has one unique answer. The app should continue to describe internal timing as approximate. Monosyllables use one audible beat.

Whole mode shows the original full IPA across the answer area. It makes no claim about where a particular phone belongs. Unknown rules, missing component boundaries, punctuation-bearing terms, and ambiguous alignments take this path. A fallback is intentional coverage, not a missing pronunciation effect. A different speech override must also force whole mode in the release builder/runtime even if a spelling path exists.

The six previously approved mappings are explicit overrides: `official`, `list`, `photographic`, `doubt`, `knot`, and `receipt`. The visual chunks of `list`, `doubt`, and `knot` share beat zero. The final /t/ of `receipt` belongs to its second beat. The /f/ written by ph remains in photographic's approved `graph` segment.

No source word, IPA, meaning, example, or exercise order is changed by this module. IPA syllable dots and interword spaces are separators; the conservation check ignores only those separators when comparing aligned chunks to the source.

Run `node pipeline/ipa-effects/alignment-check.cjs --write-report` to audit FABLE, the Mother Tongue pronunciation dictionary, and EBS when its dictionary is present. The report contains exact counts, every conservative fallback, and evenly spaced aligned samples for inspection. Tests verify full spelling/IPA conservation, ranges, beat monotonicity, stress flags, silent timing, reviewed overrides, determinism, and fallback behavior.
