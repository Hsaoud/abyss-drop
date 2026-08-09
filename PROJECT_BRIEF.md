# ABYSS DROP — Project Brief (quality bible)

Hybrid-casual physics merge-drop (Suika-style), deep-sea bioluminescent theme.
Single-file vanilla-JS HTML5 Canvas PWA. Zero dependencies, zero build step, zero external requests.
Benchmark references: **Suika Game** (physics feel, danger-line tension, scoring) and **2048** (exact animation values).

## Core loop
Drag to aim, release to drop a sea creature into the container. Two same-tier creatures touching merge
into the next tier at their midpoint (cascades chain). Run ends when a creature stays above the danger
line for 2000ms continuously (1500ms immunity for freshly dropped pieces). No timer. Instant restart.

## Merge chain (11 tiers)
plankton → krill → glow shrimp → jellyfish → seahorse → pufferfish → anglerfish → octopus → sea turtle → manta ray → whale.
Two whales merging = both pop, +100 bonus, celebration. Spawnable tiers: 0–4 only.
Scoring: resulting tier t awards triangular number T(t+1): 3,6,10,15,21,28,36,45,55,66. Cascades pay superlinearly.

## Quality bar per area (from research — these are the check criteria)

### Game feel / juice
- Damped-spring scale on every creature (squash k≈0.2 on landing: scaleX 1+k, scaleY 1−k, spring back 150–250ms).
- Merge pop = 2048 curve: next tier spawns at collision midpoint scaling 0 → 1.2 → 1.0 over 200ms. ALL feedback in the 100–200ms band.
- Trauma-based screen shake (shake = trauma², noise-driven x/y/rot, linear decay; big merge +0.3–0.5 trauma; subtle overall).
- Floating score text at merge point (600ms float+fade) + combo counter reset when board settles.
- Haptics: navigator.vibrate 10–20ms drop / 30ms merge / [30,40,60] combo; feature-detect, degrade silently.

### Visuals
- Dark abyss palette, additive-blend glow halos, radial-gradient bloom per creature (OLED-optimal).
- One-shot radial particle bursts (8–20) on merges/landings, magnitude ∝ tier.
- Faces on ALL creatures: blink on idle, widen pre-merge/danger, celebrate on cascade.
- Penner easing (easeOutBack for UI pops); nothing > 200ms except score floats and the 1200ms-delayed / 800ms game-over fade.
- DPR-aware canvas (cap 2), ctx from getContext('2d', {alpha:false, desynchronized:true}), sprite-cache creature bodies.

### Audio
- Zero asset files, Web Audio synthesis only.
- Merge pop pitch rises one pentatonic step (C E G A D) per chain position: freq × 2^(semitones/12). ±5% random detune per play.
- iOS-safe unlock: one shared AudioContext resumed on first touchend + silent buffer; re-resume on visibilitychange.
- Mute/pause routed through the ad facade (portal requirement).

### UX / onboarding & retention
- Playable in <10s: opens directly into gameplay, zero menus, zero text tutorial.
- Engineered quick win: first two drops guaranteed to merge.
- Always visible: score, best, next-piece preview, evolution chain.
- Danger line: 2000ms continuous-violation grace + 1500ms fresh-drop immunity, pulsing warning; game-over overlay delayed ~1200ms then 800ms fade (player sees the losing board).
- One-tap instant restart; light meta: daily challenge seed, best streaks, unlockable themes. Targets: D1 ≥ 30%, D7 ≥ 12%, sessions 5–9 min.

### Performance & mobile robustness
- Fixed-timestep physics accumulator (60Hz, substeps) + render interpolation; clamp dt; hard pause on visibilitychange.
- Custom circle solver: 4–8 relaxation iterations, substepping (no tunneling), mass-weighted positional correction, velocity caps, restitution 0.2 / friction 0.5. NEVER explodes/jitters.
- Pointer Events + suppression kit: touch-action:none (canvas), touch-action:manipulation (body), overscroll-behavior:none, -webkit-user-select/touch-callout:none, user-scalable=no.
- viewport-fit=cover + env(safe-area-inset-*); Screen Wake Lock (try/catch, re-request on visibilitychange).
- Payload ≤ 8MB (Poki bar), ZERO external network requests, adblock/incognito-safe (try/catch localStorage).

### Monetization hooks (ship inert)
- AdService facade: showInterstitial(placement), showRewarded(placement, onReward), gameplayStart/Stop, pause+mute callbacks.
  NullAdapter default; runtime detection of Poki SDK, CrazyGames SDK, Google H5 adBreak/adConfig. 100% playable under adblock.
- Rewarded slots: continue-after-overflow (clear top of board), 2x end score. Granted free when NullAdapter (standalone UX).
- Interstitials: run-end/restart only, max 2/session, ≥2–3 min apart, never mid-gameplay.
- Local IAP catalog + entitlements behind a feature flag (remove-ads, themes) in try/catch localStorage.
- Web Monetization link tag.

## Deployment
1. NOW: free HTTPS hosting (GitHub Pages) + manifest + SW = installable PWA (Android auto-prompt; iOS 26 A2HS standalone by default).
2. NOW: CrazyGames submission package prepared (ZIP ≤50MB, no outbound links, adblock-safe).
3. USER: CrazyGames dev account + submit (primary channel, ~55–60% ad share). Later: Poki, Google Play via TWA/Bubblewrap ($25).
Revenue expectation (honest): $200–$2,000/month for a genuinely polished title on portals.

## The filled loop-prompt (what the critic workflow executes)
> Build **Abyss Drop (mobile merge-drop game)** at the level of **Suika Game / 2048**. Utterly perfect,
> **bioluminescent deep-sea premium look**, every single thing at **top-1%-casual** quality, from **game feel**
> to **visuals, audio, UX/onboarding, performance, monetization hooks**. Fan out sub-agents per area; each area
> is checked by a separate, really harsh critic sub-agent **against the concrete criteria above**; if not
> top-1%, keep going. Don't stop until each critic is utterly wowed vs the reference. Blind side-by-side
> screenshot comparison vs the reference at the end. Stack: **single-file HTML5 Canvas vanilla JS PWA**.
