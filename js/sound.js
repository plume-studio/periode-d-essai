// ===== Sons synthétisés (aucun fichier) =====
const Sound = (() => {
  let ac = null, master = null, musicGain = null, muted = false, musicOn = false, musicMode = 'day', nextT = 0, step = 0;
  function unlock() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination);
      musicGain = ac.createGain(); musicGain.gain.value = .16; musicGain.connect(master);
    } catch (e) { ac = null; }
  }
  function tone(f, d, type = 'square', v = .2, slide = 0, delay = 0, dest) {
    if (!ac || muted) return;
    const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + d + .02);
  }
  function noise(d, v = .2, hp = 800, delay = 0) {
    if (!ac || muted) return;
    const t = ac.currentTime + delay, b = ac.createBuffer(1, ac.sampleRate * d, ac.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  const S = {
    blip: () => tone(880, .06, 'square', .08),
    talk: () => tone(rnd(300, 520), .04, 'square', .05),
    ok: () => { tone(660, .08, 'square', .12); tone(990, .12, 'square', .12, 0, .08); },
    bad: () => { tone(200, .25, 'sawtooth', .15, -80); },
    win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .18, 'square', .12, 0, i * .1)),
    lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, .25, 'triangle', .2, 0, i * .16)),
    clue: () => [784, 988, 1318].forEach((f, i) => tone(f, .2, 'triangle', .18, 0, i * .09)),
    paper: () => noise(.12, .15, 2000),
    jam: () => { noise(.3, .25, 300); tone(90, .3, 'sawtooth', .15); },
    pour: () => noise(.08, .05, 600),
    alarm: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 700 : 900, .18, 'square', .1, 0, i * .2); },
    spotted: () => { tone(1200, .1, 'square', .15); tone(1500, .2, 'square', .15, 0, .1); },
    click: () => tone(1400, .03, 'square', .06),
    door: () => { tone(160, .15, 'triangle', .2, -60); noise(.1, .1, 400); },
    ring: () => { for (let i = 0; i < 6; i++) tone(1100 + (i % 2) * 200, .06, 'square', .08, 0, i * .07); },
    snore: () => tone(110, .5, 'sawtooth', .08, 40),
    type: () => tone(rnd(1800, 2400), .02, 'square', .04),
    step: () => noise(.03, .03, 1500),
  };
  // ---- Musique : petite boucle "ascenseur" (jour) / basse tendue (nuit) ----
  const DAY = { ch: [[261, 329, 392, 493], [220, 277, 329, 415], [293, 349, 440, 523], [196, 246, 293, 349]], bass: [130, 110, 146, 98], bpm: 96 };
  const NIGHT = { ch: [[220, 261, 311], [207, 246, 293], [196, 233, 277], [207, 246, 293]], bass: [55, 52, 49, 52], bpm: 72 };
  function schedule() {
    if (!ac || !musicOn) return;
    const M = musicMode === 'night' ? NIGHT : DAY, beat = 60 / M.bpm / 2;
    while (nextT < ac.currentTime + .3) {
      const bar = Math.floor(step / 8) % 4, s = step % 8, t0 = nextT - ac.currentTime;
      if (!muted) {
        if (s % 4 === 0) tone(M.bass[bar], beat * 3.5, 'triangle', .5, 0, t0, musicGain);
        if (musicMode === 'day') {
          if (s === 2 || s === 6) M.ch[bar].forEach(f => tone(f, beat * 1.2, 'sine', .12, 0, t0, musicGain));
          if ([0, 3, 5, 7].includes(s) && Math.random() < .6) tone(M.ch[bar][irnd(0, 3)] * 2, beat * .9, 'triangle', .1, 0, t0, musicGain);
        } else {
          if (s === 0) M.ch[bar].forEach(f => tone(f, beat * 7, 'sine', .07, 0, t0, musicGain));
          if (s === 4 && Math.random() < .5) tone(M.ch[bar][2] * 2, beat * 2, 'triangle', .07, 0, t0, musicGain);
        }
      }
      nextT += beat; step++;
    }
  }
  setInterval(schedule, 100);
  return {
    unlock, play: n => { try { S[n] && S[n](); } catch (e) { } },
    music(mode) { musicMode = mode; if (!musicOn && ac) { musicOn = true; nextT = ac.currentTime + .1; } if (!mode) musicOn = false; },
    toggle() { muted = !muted; return muted; }, get muted() { return muted; }
  };
})();
