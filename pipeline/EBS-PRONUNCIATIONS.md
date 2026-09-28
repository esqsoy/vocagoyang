# EBS pronunciation sidecar — 2026-09-29

`ebs-pronunciations.json` covers all **597 cards / 545 exact terms** in the existing 4 lessons and 48 exercises. Every term and Korean meaning was reviewed. The vocabulary DATA, example text, answer alternatives, spelling, sequence and exercise boundaries are unchanged.

The runtime shape matches Mother Tongue: `ipa`, `speech`, optional `label`, `meanings`, and `alternatives`. Provenance and `reviewedMeanings` remain in the source sidecar and are omitted from shipped runtime data. The complete DATA digest protects against accidental content edits during this pronunciation rollout.

## Source and editorial decisions

- Reuse previously authored FABLE and Mother Tongue IPA after checking the EBS meaning. Do not copy Mother Tongue's unrelated meaning keys or alternate parts of speech.
- CMUdict supplies broad American pronunciation for remaining dictionary words; its existing license is embedded by the assembler. Proper-name/default-form traps such as CMU's `vegan` and `primer` are overridden.
- Phrases are reviewed component/citation readings. They do not prescribe all reductions or linking in connected speech.
- `rerank` is a productive `re-` + `rank` composition. `evaluatively` follows Cambridge's American `evaluative` + `/li/`. Regular derivatives/compositions are explicitly identified instead of presented as independent recordings. `redirection` corrects the CMU conversion's misplaced r-colored vowel using [redirect](https://dictionary.cambridge.org/us/pronunciation/english/redirect).
- `~` and `...` remain in original card keys and input; only the speech text omits them. British spellings `maximise` and `minimise` remain unchanged.
- Browser TTS reads text, not IPA. Heteronym context improves selection but cannot force a particular voice's pronunciation. `affect` uses “flat affect”; the introductory-book `primer` uses “a reading primer”. These context words are neither new cards nor accepted answer alternatives.

## Meaning-sensitive checks

| EBS card | Selected IPA |
|---|---|
| affect 정서 | /ˈæfɛkt/ |
| conduct 행동 | /ˈkɑndʌkt/ |
| contrast 대조 | /ˈkɑntræst/ |
| construct 구성 개념·개념 / 구성하다 | /ˈkɑnstrʌkt/ / /kənˈstrʌkt/ |
| approximate 어림잡다 / 대략적인 | /əˈprɑksəˌmeɪt/ / /əˈprɑksəmət/ |
| legitimate 정당화하다 / 정당한 | /lɪˈdʒɪtəˌmeɪt/ / /lɪˈdʒɪtəmət/ |
| attribute 속성·자질 | /ˈætrɪˌbjut/ |
| discount 고려하지 않다·무시하다 | /dɪsˈkaʊnt/ |
| primer 입문서 | /ˈprɪmɚ/ |
| overshoot 지나치게 가다 | /ˌoʊvɚˈʃut/ |

Additional original dictionary checks cover [separable](https://dictionary.cambridge.org/us/dictionary/english/separable), [counterintuitive](https://dictionary.cambridge.org/us/dictionary/english/counterintuitive), [subjectively](https://dictionary.cambridge.org/pronunciation/english/subjectively), [idealization](https://dictionary.cambridge.org/us/pronunciation/english/idealization), [positivity](https://dictionary.cambridge.org/us/pronunciation/english/positivity), [neurobiological](https://dictionary.cambridge.org/us/dictionary/english/neurobiological), [interworking](https://dictionary.cambridge.org/us/dictionary/english/interworking), [misclassify](https://dictionary.cambridge.org/us/dictionary/english/misclassify), [veg](https://dictionary.cambridge.org/us/pronunciation/english/veg), and [vegan](https://dictionary.cambridge.org/us/pronunciation/english/vegan). Each entry records its own source; normalizing Cambridge's /e/ to /ɛ/, omitting length marks and flap detail, or composing a regular derivative is editorial broad-IPA normalization.

[Cambridge affect](https://dictionary.cambridge.org/pronunciation/english/affect), [Cambridge approximate](https://dictionary.cambridge.org/us/pronunciation/english/approximate), [Merriam-Webster legitimate](https://www.merriam-webster.com/dictionary/legitimate), and [Cambridge overshoot](https://dictionary.cambridge.org/us/dictionary/english/overshoot) support the semantic distinctions above.

Four separately authorized Mother Tongue IPA corrections accompany this review; no Mother Tongue vocabulary is changed:

| Term | Previous | Corrected / selected American form |
|---|---|---|
| [derive](https://dictionary.cambridge.org/us/pronunciation/english/derive) | dɚˈaɪv | dɪˈraɪv |
| [circulation](https://dictionary.cambridge.org/us/dictionary/english/circulation) | ˈsɝkjəˌleɪʃən | ˌsɝkjəˈleɪʃən |
| [recognizable](https://dictionary.cambridge.org/us/dictionary/english/recognizable) | ˌrɛkəɡˈnaɪzəbəl | ˈrɛkəɡˌnaɪzəbəl |
| [concrete](https://dictionary.cambridge.org/us/dictionary/english/concrete) | kənˈkrit | ˈkɑnkrit |

The first fixes an r-colored-vowel conversion. The next two fix reversed primary/secondary stress. The last selects Cambridge's first-listed American noun/adjective form; the full-vowel form /kɑnˈkrit/ is also an accepted American variant. EBS's `derive from` and `be derived from` use the same corrected base as `derive`.

## Build and checks

```text
python pipeline/assemble-ebs-pronunciations.py
python pipeline/assemble-ebs-pronunciations.py --check
node pipeline/test-ebs-pronunciation-data.cjs
```

For a non-mutating preview use `--output path/to/preview.html`. `build_page(page, source=None)` is also available to a parent release builder. Before embedding, `node pipeline/test-ebs-pronunciation-data.cjs --source-only` validates the sidecar, unchanged DATA, every semantic selection, and normalized speech.
