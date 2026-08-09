/* Trailer capture harness — dev tool, never shipped in the portal build.
   Loaded manually into index.html?headless=1&demo=1.
   Builds a choreographed run (big cascade + top-tier birth) and records the canvas. */
(() => {
  "use strict";
  const cv = document.getElementById("c");
  const D = Game.demo;
  const TIERS = D.tiers();

  const wait = ms => new Promise(res => {
    const t0 = performance.now();
    const mc = new MessageChannel();
    mc.port1.onmessage = () => { if (performance.now() - t0 >= ms) res(); else mc.port2.postMessage(0); };
    mc.port2.postMessage(0);
  });

  const r = t => TIERS[t].f * D.layout().cw;

  /* deterministic RNG so a choreography that dry-runs well records identically */
  function seedRandom(s) {
    let a = s >>> 0;
    Math.random = () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Seed a board that looks like a run in progress and hides a merge ladder.
     ladder: tiers stacked bottom->top at ladderX; partners: same-tier catchers on the floor. */
  function seed(cfg) {
    Game.reset(); // never inherit state (a previous take may have ended in game-over)
    const L = D.layout();
    D.clear();
    const ladderX = L.x0 + cfg.ladderXf * L.cw;
    // ladder, bottom to top
    let y = L.yFloor;
    for (const t of cfg.ladder) {
      const rr = r(t);
      y -= rr;
      D.spawn(t, ladderX, y);
      y -= rr;
    }
    // floor partners to the right of the ladder
    let px = ladderX + r(cfg.ladder[0]);
    for (const t of cfg.partners) {
      const rr = r(t);
      px += rr - (cfg.squeeze || 0);
      D.spawn(t, px, L.yFloor - rr);
      px += rr;
    }
    // decorative small pieces on the left so the board reads as a real run
    for (const d of (cfg.decor || [])) {
      D.spawn(d[0], L.x0 + d[1] * L.cw, L.yFloor - r(d[0]) - d[2] * L.cw);
    }
    D.setScore(cfg.score || 0);
    return { ladderX, L };
  }

  /* Advance the sim by exactly one 60Hz frame.
     The clock is monotonic across takes: rewinding it would hand Game.tick a
     negative dt and wreck the physics. */
  let clock = performance.now();
  function frame() { clock += 1000 / 60; Game.tick(clock); }

  /* Choreography: returns a list of {at, fn} keyed by frame index. */
  function script(cfg) {
    seedRandom(cfg.seed || 1234);
    const { ladderX, L } = seed(cfg);
    const cx = (L.x0 + L.x1) / 2;
    const acts = [];
    const add = (at, fn) => acts.push({ at, fn });

    // warm-up drops: aim glides, then release — teaches the one gesture
    let f = 24;
    for (const w of cfg.warmups) {
      const from = L.x0 + w.from * L.cw, to = L.x0 + w.to * L.cw;
      const glide = 26;
      for (let i = 0; i <= glide; i++) {
        add(f + i, () => Game.setAim(from + (to - from) * (i / glide), true));
      }
      add(f + glide + 2, () => { if (w.tier !== undefined) D.setNext(w.tier); });
      add(f + glide + 6, () => { Game.setAim(to, false); Game.drop(); });
      f += w.gap;
    }

    // the money shot: glide over the ladder and drop the trigger piece
    const glide2 = 34;
    const startX = L.x0 + cfg.triggerFrom * L.cw;
    for (let i = 0; i <= glide2; i++) {
      add(f + i, () => Game.setAim(startX + (ladderX - startX) * (i / glide2), true));
    }
    add(f + glide2 + 2, () => D.setNext(cfg.trigger));
    add(f + glide2 + 10, () => { Game.setAim(ladderX, false); Game.drop(); });
    const cascadeAt = f + glide2 + 10;

    // tail: one relaxed drop after the fireworks
    if (cfg.tail) {
      const tf = cascadeAt + cfg.tail.delay;
      const tx = L.x0 + cfg.tail.x * L.cw;
      for (let i = 0; i <= 24; i++) add(tf + i, () => Game.setAim(cx + (tx - cx) * (i / 24), true));
      add(tf + 26, () => { Game.setAim(tx, false); Game.drop(); });
    }
    return { acts, cascadeAt };
  }

  /* Dry run: no recording, just report what the choreography produced. */
  async function dry(cfg) {
    const { acts, cascadeAt } = script(cfg);
    const total = cfg.frames;
    let maxCombo = 0, peakTier = 0;
    const byFrame = new Map();
    for (const a of acts) {
      if (!byFrame.has(a.at)) byFrame.set(a.at, []);
      byFrame.get(a.at).push(a.fn);
    }
    const shots = new Set(cfg.shots || []);
    for (let i = 0; i < total; i++) {
      const fns = byFrame.get(i);
      if (fns) for (const fn of fns) fn();
      frame();
      const h = D.hud();
      if (h.combo > maxCombo) maxCombo = h.combo;
      if (h.maxTierRun > peakTier) peakTier = h.maxTierRun;
      if (shots.has(i)) {
        const off = document.createElement("canvas");
        off.width = Math.round(cv.width / 2); off.height = Math.round(cv.height / 2);
        off.getContext("2d").drawImage(cv, 0, 0, off.width, off.height);
        await fetch("/shot?name=" + (cfg.shotName || "dry") + "_" + String(i).padStart(4, "0"),
          { method: "POST", body: off.toDataURL("image/jpeg", 0.85) });
      }
    }
    return { maxCombo, peakTier, score: Game.score, state: Game.state, cascadeAt, frames: total,
      bodies: Game.creatures.length, warn: +D.hud().warn.toFixed(2) };
  }

  /* Real capture: same choreography, paced in real time, pushed into MediaRecorder. */
  async function record(cfg, name) {
    const { acts } = script(cfg);
    const byFrame = new Map();
    for (const a of acts) {
      if (!byFrame.has(a.at)) byFrame.set(a.at, []);
      byFrame.get(a.at).push(a.fn);
    }
    const stream = cv.captureStream(0);
    const track = stream.getVideoTracks()[0];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9" : "video/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12_000_000 });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    const done = new Promise(res => { rec.onstop = res; });
    rec.start();

    const step = 1000 / 60;
    let i = 0, maxCombo = 0, peakTier = 0, sawOver = false;
    let next = performance.now();
    while (i < cfg.frames) {
      const now = performance.now();
      if (now >= next) {
        const fns = byFrame.get(i);
        if (fns) for (const fn of fns) fn();
        frame();
        track.requestFrame();
        const h = D.hud();
        if (h.combo > maxCombo) maxCombo = h.combo;
        if (h.maxTierRun > peakTier) peakTier = h.maxTierRun;
        if (Game.state !== "play") sawOver = true;
        i++;
        next += step;
        if (now - next > 250) next = now + step; // never spiral after a hitch
      } else {
        await wait(1);
      }
    }
    rec.stop();
    await done;
    const outcome = { maxCombo, peakTier, sawOver, score: Game.score };
    // only keep a take that actually delivered the choreography
    const good = peakTier >= (cfg.wantTier || 0) && maxCombo >= (cfg.wantCombo || 0) && !sawOver;
    if (!good && !cfg.keepBad) return { rejected: true, ...outcome };
    const blob = new Blob(chunks, { type: "video/webm" });
    const res = await fetch("/upload?name=" + name + ".webm", { method: "POST", body: blob });
    return { status: res.status, bytes: blob.size, frames: i, seconds: +(i / 60).toFixed(1), ...outcome };
  }

  window.Trailer = { seed, dry, record, r, layout: () => D.layout() };
})();
