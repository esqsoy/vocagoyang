# Independent review brief (Fable reviewers)

You are an independent reviewer of the Korean vocabulary game 보카고양 FABLE (repo /home/user/vocagoyang, current commit 158d28a = deployed a8bbbd3 + docs). Another model (Claude) wrote and applied these changes; a third reviewer (Codex "아스트라") already reviewed them at 921e8ff and its 23 fixes are applied. Your job: find **new** problems that are still in the current cards. Fresh eyes matter more than agreement.

## Read first
1. `/home/user/vocagoyang/PRINCIPLES.md`: sections 0–4 (especially 2-1 order control, 2-2 reading load and the 26.10.13 rule "never delete hedges when shortening", 2-5, 2-7, 2-9, 2-10 incl. dog→cat exceptions, 2-11 novel quotes incl. the 26.10.13 excerpt rule, 3 blank ambiguity) and 12 (spotlight grammar).
2. `/home/user/vocagoyang/pipeline/set-work/BRIEF.md` (how the cards were written).
3. `/home/user/vocagoyang/reviews/codex-20261013/README.md`: what 아스트라 found and its format. **Do not re-report its 23 findings or its "keep" judgments.**

## Your input
`slice{N}.json` in this folder: each card that changed since acfe20e, with the current fields (ko = meaning line, ex with {{BLANK}}, filled = ex with the answer filled in exactly as the game shows it, tr = Korean translation, c = note, meow = cat line) and `before` values of the changed fields. Read **every card in your slice**. Other cards of a set: `python3 pipeline/set-work/dump.py N` (run from /home/user/vocagoyang).

## What to look for (most important first)
1. **Wrong facts**: knowledge examples, etymology, pronunciation in Hangul, stress marks, British/US spelling claims, dates, numbers. Use WebSearch/WebFetch to check anything you are not certain of; cite a source URL.
2. **Wrong English**: ungrammatical or unnatural example, wrong collocation, the filled sentence showing a wrong form (the game appends the suffix after {{BLANK}} literally: life+s → "lifes" was a real bug).
3. **Wrong or over-absolute rules in notes (c)**: a note that overgeneralizes ("only", "always", missing "usually"), a "이 뜻에서는 X와 바꿔 쓸 수 있다" claim where X does not actually fit that sentence, or a contrast that is wrong.
4. **Mismatch inside one card**: tr does not match ex (e.g. ex says cat, tr says 개), note talks about something the example does not show, meaning line (ko) vs how the word is used in the sentence.
5. **Blank ambiguity (PRINCIPLES 3)**: another English word with the same letter count fits the sentence + meaning line equally well and the note does not mention it.
6. **Novel quotes** (note starts with author 『book』): the quoted text must match the Gutenberg original (verify with `NOVELS=/tmp/claude-0/-home-user-vocagoyang/6607e389-d1a5-5ab0-98ca-41fad42d433a/scratchpad/novels python3 pipeline/set-work/quote.py <book> "<sentence>"`, file names in that folder), the speaker/scene stated in the note must be right, the card sense must match the use in the quote, the Korean translation must be faithful.
7. **Korean**: unnatural or wrong Korean in tr/c/meow; tone rules (tr 반말 like "~해/~야", c short plain statements "~다", meow ends with "~고양").
8. **Content for children**: needlessly violent/dark examples where a milder one would teach the word as well.
9. Spotlight grammar sentences that are wrong or that blur the headword.

Do not report: things the principles deliberately chose (cat lines' humor, 고양이 over 개, notes removed only because they repeated the meaning line, reading-load trims that keep the meaning), style preferences without a teaching cost, or anything 아스트라 already reported. Known and accepted: 20 immigrant 4-line on Windows Chrome, buddhism/christianity frame, 23세트 sleep cards, 26세트 jail/academy cat lines, "강세 주의" without position on superb/absurd/ballet.

## Output (write exactly these files; do NOT modify anything in /home/user/vocagoyang)
1. `findings-{N}.json`: a JSON list. Each item:
   `{"id":"F{N}-01","set":..,"word":..,"si":..,"classification":"오류|보완|제안","confidence":"high|medium|low","title":"one line in Korean","current":{field:value…},"proposed":{field:value…},"evidence":"why, in Korean","sources":["url",…]}`
   오류 = factually/grammatically wrong or shows a wrong form; 보완 = true but misleading/incomplete with a real teaching cost; 제안 = optional.
2. `proposal-{N}.py`: the same fixes in the repo's E-list format (see BRIEF.md "산출물"), only for 오류 and 보완 with high/medium confidence. Run `python3 pipeline/set-work/validate.py <that file> --quiet` and fix what it flags (reading load, order control, 72-char notes, cat line).
3. Final message (to the coordinator, under 200 words): counts by classification, the 3 most important findings, anything you could not verify.

Quality bar: every 오류 must be something you checked, not a hunch. Prefer fewer, solid findings over many weak ones. If a slice is clean, say so.
