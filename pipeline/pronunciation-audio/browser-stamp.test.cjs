'use strict';
// Real FABLE DOM + native MP3 playback, in new isolated browser contexts.
// Preparation seeds only progress/missed-word records and existing lesson state.
// No invented cards, fake Audio, mocked media events, or playback substitutions.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '../..');

const server = http.createServer((req, res) => {
  const target = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!target.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  try {
    const bytes = fs.readFileSync(target);
    res.writeHead(200, {
      'Content-Type': target.endsWith('.mp3') ? 'audio/mpeg' : target.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600',
    });
    res.end(bytes);
  } catch { res.writeHead(404); res.end(); }
});

async function freshPage(browser, base) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage(), errors = [], requests = [];
  page.setDefaultTimeout(10000);
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.url().includes('/assets/pronunciation/')) requests.push(r.url()); });
  await page.addInitScript(() => {
    window.audioTrace = [];
    window.nativeTrace = [];
    window.audioElements = [];
    const NativeAudio = window.Audio;
    // This wrapper returns the REAL browser HTMLAudioElement unchanged.
    window.Audio = function (...args) {
      const audio = new NativeAudio(...args), id = audioElements.length;
      audioElements.push(audio);
      for (const type of ['playing', 'ended', 'error', 'pause']) {
        audio.addEventListener(type, () => audioTrace.push({ id, type, src: audio.currentSrc, at: performance.now() }));
      }
      return audio;
    };
    window.Audio.prototype = NativeAudio.prototype;
    const speak = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = utterance => {
      if (utterance.text.trim()) nativeTrace.push({ text: utterance.text, at: performance.now() });
      return speak(utterance);
    };
  });
  await page.goto(base + '/vocagoyangfable.html');
  await page.waitForSelector('.lessonbtn');
  assert.equal(requests.length, 0, 'Home must not fetch the pronunciation library');
  return { context, page, errors, requests };
}

async function preparePendingStamp(page, mode) {
  return page.evaluate(mode => {
    state.unlockAll = true;
    state.levelB1 = false;
    state.muted = false;
    const candidates = [];
    // Group exactly the current set's real cards, as the production review does.
    for (const L of state.lessons) {
      if (L.kind === 'saved') continue;
      const groups = new Map();
      for (const e of visEx(L)) for (const w of e.words) {
        const key = msHead(w);
        if (!key) continue;
        const row = groups.get(key) || { key, term: w.term || w.word || w.en, ipas: new Set() };
        row.ipas.add(String(w.ipa || '').trim());
        groups.set(key, row);
      }
      for (const r of groups.values()) {
        const ipas = [...r.ipas], entries = ipas.map(ipa => exceptionAudioEntry({ term: r.term, ipa })).filter(Boolean);
        if (!entries.length) continue;
        if (mode === 'single' && ipas.length === 1 && ipas[0]) {
          candidates.push({ L, ...r, ipas, entry: entries[0] });
        } else if (mode === 'multiple' && ipas.length > 1 && ipas.every(Boolean)) {
          candidates.push({ L, ...r, ipas, entry: entries[0] });
        }
      }
    }
    if (mode === 'single') candidates.sort((a, b) => Number(b.entry.duration) - Number(a.entry.duration));
    else candidates.sort((a, b) => Number(b.term === 'contract') - Number(a.term === 'contract'));
    const picked = candidates[0];
    if (!picked) throw new Error('No real ' + mode + '-IPA stamp candidate');
    if (mode === 'single' && Number(picked.entry.duration) < 0.8) throw new Error('Recording is too short for the close/transition regression');
    const L = picked.L;
    localStorage.setItem(msMissKey, JSON.stringify({ [picked.key]: 2 }));
    stWrite({});
    for (const e of visEx(L)) setRec(L.id, e.title, {});
    state.li = state.lessons.indexOf(L);
    renderHome();
    show('home');
    const rows = stMissList(L, null);
    if (rows.length !== 1 || rows[0].term !== picked.term) throw new Error('Missed-word seed did not produce one real row');
    return {
      set: L.id, lesson: L.lesson, term: picked.term, ipas: picked.ipas,
      rowIPA: rows[0].ipa, duration: Number(picked.entry.duration), src: picked.entry.src,
    };
  }, mode);
}

async function openReview(page, fixture) {
  const banner = page.locator('#stBanner');
  await banner.waitFor({ state: 'visible' });
  assert((await banner.innerText()).includes(fixture.set));
  await banner.click();
  await page.locator('#stSheet.show').waitFor({ state: 'visible' });
  const rows = page.locator('#stSheetList .st-row');
  assert.equal(await rows.count(), 1);
  assert.equal(await rows.first().getAttribute('data-t'), fixture.term);
  assert.equal(await rows.first().getAttribute('data-ipa'), fixture.rowIPA);
  return rows.first();
}

async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  let browser;
  const reports = [];
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });

    // Last real missed row -> stamp. The transition must let the MP3 finish.
    {
      const t = await freshPage(browser, base), { page } = t;
      const fixture = await preparePendingStamp(page, 'single');
      await (await openReview(page, fixture)).click();
      await page.waitForFunction(() => audioTrace.some(e => e.type === 'playing'));
      await page.locator('#stFx.show').waitFor({ state: 'visible' });
      await page.waitForFunction(() => audioTrace.some(e => e.type === 'ended'));
      const result = await page.evaluate(() => ({
        audio: audioTrace, tts: nativeTrace, sheetOpen: stSheetOpen,
        remainingRows: document.querySelectorAll('#stSheetList .st-row').length,
        stamped: stHas(state.lessons[state.li]), ownerReleased: exceptionAudioOwner === null,
      }));
      assert.equal(result.audio.filter(e => e.type === 'playing').length, 1);
      assert.equal(result.audio.filter(e => e.type === 'ended').length, 1);
      assert.equal(result.audio.filter(e => e.type === 'error').length, 0);
      const playing = result.audio.find(e => e.type === 'playing'), ended = result.audio.find(e => e.type === 'ended');
      assert.equal(playing.id, ended.id);
      assert(playing.src.endsWith(new URL(fixture.src, base + '/').pathname + new URL(fixture.src, base + '/').search));
      assert(ended.at > playing.at, 'Real media must end after playing');
      assert.equal(result.tts.length, 0, 'A selected exception must not also speak TTS');
      assert.equal(result.sheetOpen, false);
      assert.equal(result.remainingRows, 0);
      assert.equal(result.stamped, true);
      assert.equal(result.ownerReleased, true);
      assert.deepEqual(t.errors, []);
      reports.push({ case: 'last-row-mp3-through-stamp', fixture, actualMP3: true, result, requests: t.requests });
      await t.context.close();
    }

    // Closing while the last row is playing must cancel both media and timers.
    {
      const t = await freshPage(browser, base), { page } = t;
      const fixture = await preparePendingStamp(page, 'single');
      await (await openReview(page, fixture)).click();
      await page.waitForFunction(() => !!exceptionAudioOwner?.started);
      const before = await page.evaluate(() => ({ id: audioTrace.find(e => e.type === 'playing').id, playing: audioTrace.filter(e => e.type === 'playing').length }));
      await page.locator('#stSheetClose').click();
      const immediate = await page.evaluate(id => ({
        ownerReleased: exceptionAudioOwner === null, paused: audioElements[id].paused,
        sheetOpen: stSheetOpen, reviewCleared: stReview === null,
      }), before.id);
      assert.deepEqual(immediate, { ownerReleased: true, paused: true, sheetOpen: false, reviewCleared: true });
      // Beyond the real clip's watchdog as well as the 260+250ms stamp delay.
      await page.waitForTimeout(Math.min(6500, Math.max(2000, fixture.duration * 1000 + 1500)) + 200);
      const after = await page.evaluate(() => ({
        playing: audioTrace.filter(e => e.type === 'playing').length,
        ended: audioTrace.filter(e => e.type === 'ended').length,
        tts: nativeTrace, stampCount: document.querySelectorAll('#stFx').length,
        stamped: stHas(state.lessons[state.li]), ownerReleased: exceptionAudioOwner === null,
      }));
      assert.equal(after.playing, before.playing, 'Cancelled playback must not resurrect');
      assert.equal(after.ended, 0, 'Cancelled native media must not run to completion');
      assert.equal(after.tts.length, 0, 'Cancellation must not turn into TTS fallback');
      assert.equal(after.stampCount, 0, 'Closing must invalidate the delayed stamp');
      assert.equal(after.stamped, false);
      assert.equal(after.ownerReleased, true);
      assert.deepEqual(t.errors, []);
      reports.push({ case: 'manual-close-cancels-last-row', fixture, immediate, after });
      await t.context.close();
    }

    // A row combining actual noun/verb IPAs must not choose either recording.
    {
      const t = await freshPage(browser, base), { page } = t;
      const fixture = await preparePendingStamp(page, 'multiple');
      assert(fixture.ipas.length > 1);
      assert.equal(fixture.rowIPA, '');
      await (await openReview(page, fixture)).click();
      await page.waitForFunction(() => nativeTrace.length > 0);
      await page.locator('#stFx.show').waitFor({ state: 'visible' });
      await page.waitForTimeout(300);
      const result = await page.evaluate(() => ({ audio: audioTrace, tts: nativeTrace, ownerReleased: exceptionAudioOwner === null }));
      assert.equal(result.tts.length, 1);
      assert.equal(result.tts[0].text, fixture.term, 'Ambiguous review keeps the existing whole-word TTS text');
      assert.equal(result.audio.filter(e => e.type === 'playing').length, 0);
      assert.equal(t.requests.length, 0, 'Ambiguous row must not fetch either exception recording');
      assert.equal(result.ownerReleased, true);
      assert.deepEqual(t.errors, []);
      reports.push({ case: 'multiple-ipa-keeps-tts', fixture, result });
      await t.context.close();
    }

    // Ordinary exercise review: last-row auto-next must lose to manual next.
    {
      const t = await freshPage(browser, base), { page } = t;
      await page.evaluate(() => {
        state.unlockAll = true; state.levelB1 = false; state.muted = true; state.progress = {};
        msMarkSeen(10000);
        state.li = state.lessons.findIndex(L => L.lesson === 0);
        openExercise(0);
        const s = state.session;
        s.words.forEach(w => { w.passed = true; });
        s.words[0].wrongEver = true; s.words[0].errors = 1;
        s.firstSeen = s.words.length; s.firstCorrect = s.words.length - 1;
        finishExercise();
      });
      await page.locator('#sumScreen.active').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#sumWrong .wrow').count(), 1);
      assert.equal(await page.locator('#sumWrong .st-row').count(), 0, 'This is ordinary exercise review, not stamp review');
      await page.locator('#sumWrong .wrow').click();
      await page.locator('#nextEx').click();
      const immediate = await page.evaluate(() => {
        window.stampTestNextSession = state.session;
        return { exercise: state.ei, title: state.session.exercise.title };
      });
      assert.equal(immediate.exercise, 1);
      await page.waitForTimeout(1000);
      const after = await page.evaluate(() => ({
        exercise: state.ei, title: state.session.exercise.title,
        sameSession: state.session === window.stampTestNextSession,
        screen: document.querySelector('.screen.active')?.id,
      }));
      assert.equal(after.exercise, immediate.exercise);
      assert.equal(after.title, immediate.title);
      assert.equal(after.sameSession, true, 'Stale review timeout must not replace the new session');
      assert.equal(after.screen, 'gameScreen');
      assert.deepEqual(t.errors, []);
      reports.push({ case: 'ordinary-review-manual-next-race', immediate, after });
      await t.context.close();
    }
    console.log(JSON.stringify(reports, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
