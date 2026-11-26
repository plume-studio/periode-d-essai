// ===== Mini-jeux (fenêtre au centre de l'écran) =====
const PX = 230, PY = 110, PW = 820, PH = 500;
function panel(g, title, hint) {
  g.fillStyle = 'rgba(10,8,16,.72)'; g.fillRect(0, 0, W, H);
  g.fillStyle = PAL.ink; g.fillRect(PX - 6, PY - 6, PW + 12, PH + 12);
  g.fillStyle = '#efe9df'; g.fillRect(PX, PY, PW, PH);
  g.fillStyle = PAL.ui; g.fillRect(PX, PY, PW, 54);
  g.fillStyle = PAL.yellow; g.font = 'bold 26px "Trebuchet MS",Verdana,sans-serif'; g.textAlign = 'left'; g.fillText(title, PX + 22, PY + 36);
  if (hint) { g.fillStyle = '#cfc8d8'; g.font = '17px "Trebuchet MS",Verdana,sans-serif'; g.textAlign = 'right'; g.fillText(hint, PX + PW - 20, PY + 34); }
  g.textAlign = 'left';
}
function txt(g, s, x, y, size = 20, col = PAL.ink, align = 'center', bold = true) {
  g.font = (bold ? 'bold ' : '') + size + 'px "Trebuchet MS",Verdana,sans-serif'; g.fillStyle = col; g.textAlign = align; g.fillText(s, x, y); g.textAlign = 'left';
}
function keycap(g, label, x, y, w = 40) {
  g.fillStyle = PAL.ink; g.fillRect(x, y, w, 36); g.fillStyle = '#f4f1ea'; g.fillRect(x + 2, y + 2, w - 4, 28); g.fillStyle = '#c9c2b6'; g.fillRect(x + 2, y + 28, w - 4, 4);
  txt(g, label, x + w / 2, y + 23, 17, PAL.ink);
}
function stars(g, n, x, y, s = 26) {
  for (let i = 0; i < 3; i++) { g.fillStyle = i < n ? PAL.yellow : '#7a7480'; starPath(g, x + i * (s + 8), y, s / 2); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke(); }
}
function starPath(g, cx, cy, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); }
function drawPerson(g, id, x, y, scale = 4, row = 0, frame = 0) {
  const im = IMG[CAST[id].img]; g.imageSmoothingEnabled = false; g.drawImage(im, frame * 32, row * 32, 32, 32, x, y, 32 * scale, 32 * scale);
}
const ARW = { up: '↑', down: '↓', left: '←', right: '→' };

// Base commune
function MGBase(o) {
  return Object.assign({
    t: 0, done: false, ok: false, stars: 3, endT: 0, result: null,
    finish(ok, st) { if (this.result) return; this.result = { ok, st }; this.endT = 1.4; ok ? Sound.play('win') : Sound.play('lose'); },
    step(dt) {
      this.t += dt;
      if (this.result) { this.endT -= dt; if (this.endT <= 0) { this.done = true; this.ok = this.result.ok; this.stars = this.result.st; } return; }
      this.update(dt);
    },
    render(g) {
      this.draw(g);
      if (this.result) {
        g.fillStyle = 'rgba(20,16,28,.82)'; g.fillRect(PX, PY + PH / 2 - 70, PW, 140);
        txt(g, this.result.ok ? (this.okTxt || 'BIEN JOUÉ !') : (this.koTxt || 'RATÉ… ON RECOMMENCE'), W / 2, PY + PH / 2 - 14, 40, this.result.ok ? PAL.yellow : '#ff7a6e');
        if (this.result.ok && !this.noStars) stars(g, this.result.st, W / 2 - 50, PY + PH / 2 + 34, 30);
      }
    }
  }, o);
}

// ---------- 1. Photocopieuse ----------
function MG_copie(p) {
  return MGBase({
    title: 'PHOTOCOPIES', n: p.n, sp: p.speed || 1, made: 0, miss: 0, jam: 0, mash: 0, cur: 0, dirc: 1, zone: .5, zw: p.zone || .16, sheets: [],
    hint: 'ESPACE dans le vert',
    update(dt) {
      if (this.jam >= 2) { if (hit('act')) { this.mash++; Sound.play('click'); Cam.shake = 0; } if (this.mash >= 12) { this.jam = 0; this.mash = 0; Sound.play('ok'); } return; }
      this.cur += this.dirc * dt * (.7 + this.sp * .45 + this.made * .02);
      if (this.cur > 1) { this.cur = 1; this.dirc = -1; } if (this.cur < 0) { this.cur = 0; this.dirc = 1; }
      if (hit('act')) {
        if (Math.abs(this.cur - this.zone) < this.zw / 2) { this.made++; Sound.play('paper'); this.sheets.push({ t: 0, x: rnd(-30, 30) }); this.zone = rnd(.15, .85); if (this.made >= this.n) this.finish(true, this.miss <= 1 ? 3 : this.miss <= 3 ? 2 : 1); }
        else { this.miss++; this.jam++; Sound.play(this.jam >= 2 ? 'jam' : 'bad'); }
      }
      this.sheets.forEach(s => s.t += dt); this.sheets = this.sheets.filter(s => s.t < 1);
    },
    draw(g) {
      panel(g, this.title, this.hint);
      // machine
      const mx = W / 2 - 150, my = PY + 110; g.drawImage(SPR.copier, mx, my, 300, 375 * .85);
      this.sheets.forEach(s => { g.fillStyle = '#fff'; g.strokeStyle = PAL.ink; g.lineWidth = 2; const y = my + 240 - s.t * 160, x = W / 2 + s.x + s.t * 120; g.fillRect(x - 30, y, 60, 76); g.strokeRect(x - 30, y, 60, 76); });
      // barre
      const bx = PX + 60, by = PY + PH - 70, bw = PW - 120;
      g.fillStyle = PAL.ink; g.fillRect(bx - 4, by - 4, bw + 8, 36); g.fillStyle = '#bbb3a8'; g.fillRect(bx, by, bw, 28);
      g.fillStyle = PAL.green; g.fillRect(bx + (this.zone - this.zw / 2) * bw, by, this.zw * bw, 28);
      g.fillStyle = PAL.ink; g.fillRect(bx + this.cur * bw - 3, by - 10, 6, 48);
      txt(g, this.made + ' / ' + this.n, PX + PW - 90, PY + 100, 34, PAL.ink);
      if (this.jam >= 2) {
        g.fillStyle = 'rgba(216,67,59,.92)'; g.fillRect(PX + 140, PY + 170, PW - 280, 120);
        txt(g, 'BOURRAGE !', W / 2, PY + 220, 40, '#fff'); txt(g, 'Tape ESPACE à fond', W / 2, PY + 256, 20, '#fff', 'center', false);
        g.fillStyle = '#fff'; g.fillRect(PX + 200, PY + 270, (PW - 400) * this.mash / 12, 10);
      }
    }
  });
}
// ---------- 2. Café / arrosage ----------
function MG_cafe(p) {
  const cups = p.cups.map(c => ({ lo: c === 'petit' ? .3 : c === 'moyen' ? .52 : .72, w: p.tight || .12, kind: c }));
  return MGBase({
    title: p.plant ? 'ARROSAGE' : 'CAFÉ', cups, i: 0, fill: 0, rate: 0, holding: false, score: 0, flash: 0, plant: p.plant,
    hint: 'Maintiens ESPACE, lâche dans la zone',
    update(dt) {
      const c = this.cups[this.i]; this.flash = Math.max(0, this.flash - dt);
      if (keys.act) { this.holding = true; this.rate = Math.min(.75, this.rate + dt * .9); this.fill += this.rate * dt; if (Math.random() < .3) Sound.play('pour'); if (this.fill > 1) { this.fill = 0; this.rate = 0; this.holding = false; Sound.play('bad'); this.flash = 1; this.score -= .5; } }
      else if (this.holding) {
        this.holding = false; this.rate = 0;
        if (this.fill >= c.lo && this.fill <= c.lo + c.w) { this.score += 1 - Math.abs(this.fill - (c.lo + c.w / 2)) / c.w; Sound.play('ok'); this.i++; this.fill = 0; if (this.i >= this.cups.length) this.finish(true, this.score / this.cups.length > .7 ? 3 : this.score / this.cups.length > .4 ? 2 : 1); }
        else { Sound.play('bad'); this.flash = 1; this.fill = 0; this.score -= .3; }
      }
    },
    draw(g) {
      panel(g, this.title, this.hint);
      const c = this.cups[Math.min(this.i, this.cups.length - 1)];
      const cx = W / 2, top = PY + 120, h = 300, w = this.plant ? 220 : 180;
      if (this.plant) { // pot
        g.fillStyle = '#3f8a46'; for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(cx + (k - 3) * 22, top - 10 - Math.abs(k - 3) * -6, 14, 50, (k - 3) * .3, 0, 7); g.fill(); }
      } else { g.drawImage(SPR.coffee, cx - 260, top + 10, 112, 184); }
      g.fillStyle = PAL.ink; g.fillRect(cx - w / 2 - 6, top, w + 12, h + 6);
      g.fillStyle = this.plant ? '#a8693f' : '#f4f4f0'; g.fillRect(cx - w / 2, top, w, h);
      g.fillStyle = this.plant ? '#5a3a1f' : '#5b3520'; g.fillRect(cx - w / 2, top + h * (1 - this.fill), w, h * this.fill);
      if (!this.plant) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(cx - w / 2 + 10, top + h * (1 - this.fill), 12, h * this.fill); }
      g.fillStyle = 'rgba(95,179,106,.45)'; g.fillRect(cx - w / 2, top + h * (1 - c.lo - c.w), w, h * c.w);
      g.fillStyle = PAL.green; g.fillRect(cx - w / 2 - 20, top + h * (1 - c.lo - c.w), 14, 3); g.fillRect(cx - w / 2 - 20, top + h * (1 - c.lo), 14, 3);
      if (this.holding) { g.fillStyle = this.plant ? '#6bb7ff' : '#5b3520'; g.fillRect(cx - 6, PY + 60, 12, top - PY - 60 + h * (1 - this.fill)); }
      if (this.flash) { g.fillStyle = 'rgba(216,67,59,' + this.flash * .4 + ')'; g.fillRect(PX, PY + 54, PW, PH - 54); }
      txt(g, (this.plant ? 'Plante ' : 'Tasse ') + Math.min(this.i + 1, this.cups.length) + ' / ' + this.cups.length, PX + PW - 120, PY + 110, 26);
      if (!this.plant) txt(g, c.kind === 'petit' ? 'SERRÉ' : c.kind === 'moyen' ? 'NORMAL' : 'ALLONGÉ', PX + PW - 120, PY + 150, 28, '#5b3520');
    }
  });
}
// ---------- 3. Classement ----------
const FCOL = [{ c: '#d8433b', k: 'left' }, { c: '#3d72c4', k: 'up' }, { c: '#5fb36a', k: 'right' }, { c: '#f2c94c', k: 'down' }];
function MG_classement(p) {
  return MGBase({
    title: 'CLASSEMENT', n: p.n, sp: p.speed || 1, done_: 0, err: 0, cur: null, fly: [],
    hint: 'Flèche de la bonne couleur',
    spawn() { this.cur = { col: irnd(0, 3), y: 0 }; },
    update(dt) {
      if (!this.cur) this.spawn();
      this.cur.y += dt * (.22 + this.sp * .1 + this.done_ * .012);
      for (const d of ['left', 'up', 'right', 'down']) if (hit(d)) {
        if (FCOL[this.cur.col].k === d) { this.fly.push({ col: this.cur.col, y: this.cur.y, t: 0 }); this.done_++; Sound.play('paper'); this.cur = null; if (this.done_ >= this.n) this.finish(true, this.err === 0 ? 3 : this.err === 1 ? 2 : 1); }
        else { this.err++; Sound.play('bad'); this.cur = null; if (this.err >= 3) this.finish(false, 0); }
        break;
      }
      if (this.cur && this.cur.y >= 1) { this.err++; Sound.play('bad'); this.cur = null; if (this.err >= 3) this.finish(false, 0); }
      this.fly.forEach(f => f.t += dt * 3); this.fly = this.fly.filter(f => f.t < 1);
    },
    draw(g) {
      panel(g, this.title, this.hint);
      const cxs = [PX + 150, PX + 320, PX + 490, PX + 660];
      FCOL.forEach((f, i) => { // armoires
        const x = cxs[i] - 50, y = PY + PH - 150; g.fillStyle = PAL.ink; g.fillRect(x - 3, y - 3, 106, 126); g.fillStyle = '#c9ced3'; g.fillRect(x, y, 100, 120);
        g.fillStyle = f.c; g.fillRect(x + 10, y + 10, 80, 24); keycap(g, ARW[f.k], x + 30, y + 60);
      });
      const fold = (x, y, c) => { g.fillStyle = PAL.ink; g.fillRect(x - 46, y - 32, 92, 64); g.fillStyle = c; g.fillRect(x - 43, y - 29, 86, 58); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x - 43, y - 29, 30, 8); g.fillStyle = '#fff'; g.fillRect(x - 25, y - 8, 50, 26); };
      if (this.cur) fold(W / 2, PY + 90 + this.cur.y * 220, FCOL[this.cur.col].c);
      this.fly.forEach(f => fold(lerp(W / 2, cxs[f.col], f.t), lerp(PY + 90 + f.y * 220, PY + PH - 120, f.t), FCOL[f.col].c));
      g.fillStyle = 'rgba(216,67,59,.35)'; g.fillRect(PX, PY + 312, PW, 4);
      txt(g, this.done_ + ' / ' + this.n, PX + 80, PY + 100, 30);
      for (let i = 0; i < 3; i++) txt(g, '✖', PX + PW - 120 + i * 32, PY + 100, 28, i < this.err ? PAL.red : '#bbb');
    }
  });
}
// ---------- 4. Réunion (rester éveillé) ----------
function MG_reunion(p) {
  return MGBase({
    title: 'RÉUNION', dur: p.dur || 40, sleep: .15, rate: p.rate || .1, ask: null, askT: rnd(4, 7), strikes: 0, z: [],
    hint: 'ESPACE : cligner · ↑ : hocher la tête', speaker: p.speaker || 'gerard',
    update(dt) {
      this.sleep += dt * (this.rate + this.t / this.dur * .06);
      if (hit('act')) { this.sleep = Math.max(0, this.sleep - .13); Sound.play('click'); }
      this.askT -= dt;
      if (!this.ask && this.askT <= 0) { this.ask = { t: p.askTime || 1.4 }; Sound.play('blip'); }
      if (this.ask) {
        this.ask.t -= dt;
        if (hit('up')) { this.ask = null; this.askT = rnd(3, 6); Sound.play('ok'); }
        else if (this.ask.t <= 0) { this.ask = null; this.askT = rnd(3, 6); this.strikes++; Sound.play('bad'); if (this.strikes >= 3) { this.koTxt = 'TU AS L\'AIR AILLEURS…'; this.finish(false, 0); } }
      }
      if (this.sleep >= 1) { this.koTxt = 'TU T\'ES ENDORMI !'; Sound.play('snore'); this.finish(false, 0); }
      if (this.t >= this.dur) this.finish(true, this.strikes === 0 ? 3 : this.strikes === 1 ? 2 : 1);
    },
    draw(g) {
      panel(g, this.title, this.hint);
      g.save(); g.beginPath(); g.rect(PX, PY + 54, PW, PH - 54); g.clip();
      g.fillStyle = '#d3cecb'; g.fillRect(PX, PY + 54, PW, PH); g.fillStyle = '#777a82'; g.fillRect(PX, PY + 380, PW, 200);
      // écran de projection avec un graphique absurde
      g.fillStyle = PAL.ink; g.fillRect(PX + 380, PY + 80, 360, 230); g.fillStyle = '#fff'; g.fillRect(PX + 386, PY + 86, 348, 218);
      g.strokeStyle = PAL.red; g.lineWidth = 5; g.beginPath();
      for (let i = 0; i <= 10; i++) g.lineTo(PX + 410 + i * 30, PY + 270 - (Math.sin(i * 1.7 + this.t) * 50 + i * 8));
      g.stroke(); txt(g, 'SYNERGIE Q3', PX + 560, PY + 122, 22, PAL.ink);
      drawPerson(g, this.speaker, PX + 150, PY + 120, 7, Math.floor(this.t) % 6 === 0 ? 2 : 0, Math.floor(this.t * 4) % 4);
      if (this.ask) { g.fillStyle = '#fff'; g.fillRect(PX + 260, PY + 90, 150, 60); g.fillStyle = PAL.ink; g.fillRect(PX + 260, PY + 150, 20, 10); txt(g, 'HEIN ?', PX + 335, PY + 130, 26, PAL.red); keycap(g, '↑', PX + 315, PY + 160); }
      // table
      g.fillStyle = '#6b4330'; g.fillRect(PX, PY + 420, PW, 90); g.fillStyle = '#7d5038'; g.fillRect(PX, PY + 420, PW, 10);
      // paupières
      const e = clamp(this.sleep, 0, 1) * (PH - 54) / 2;
      g.fillStyle = '#120e10'; g.fillRect(PX, PY + 54, PW, e); g.fillRect(PX, PY + PH - e, PW, e);
      g.restore();
      txt(g, Math.max(0, Math.ceil(this.dur - this.t)) + ' s', PX + PW - 70, PY + 100, 30, PAL.ink);
      for (let i = 0; i < 3; i++) txt(g, '✖', PX + 40 + i * 32, PY + 100, 26, i < this.strikes ? PAL.red : '#bbb');
      // jauge de sommeil
      g.fillStyle = PAL.ink; g.fillRect(PX + 40, PY + 120, 24, 200); g.fillStyle = '#7b6cc4'; const sh = clamp(this.sleep, 0, 1) * 196; g.fillRect(PX + 42, PY + 318 - sh, 20, sh);
      txt(g, 'Zzz', PX + 52, PY + 345, 18, '#7b6cc4');
    }
  });
}
// ---------- 5. Saisie (flèches qui défilent) ----------
function MG_saisie(p) {
  const seq = []; let x = 900; const dirs = ['left', 'up', 'right', 'down'];
  for (let i = 0; i < p.n; i++) { seq.push({ d: pick(dirs), x, st: 0 }); x += rnd(110, 170) / (p.speed || 1) * 1.1; }
  return MGBase({
    title: p.slides ? 'PRÉSENTATION' : 'SAISIE TABLEUR', seq, sp: 230 * (p.speed || 1), err: 0, good: 0, maxErr: p.maxErr || 5, hitX: 120, slides: p.slides,
    hint: 'La flèche quand elle passe dans le cadre',
    update(dt) {
      this.seq.forEach(a => a.x -= this.sp * dt);
      const live = this.seq.find(a => a.st === 0);
      for (const d of dirs) if (hit(d)) {
        if (live && Math.abs(live.x - this.hitX) < 46) { if (live.d === d) { live.st = 1; this.good++; Sound.play('type'); } else { live.st = 2; this.err++; Sound.play('bad'); } }
        else { this.err++; Sound.play('bad'); }
      }
      this.seq.forEach(a => { if (a.st === 0 && a.x < this.hitX - 46) { a.st = 2; this.err++; Sound.play('bad'); } });
      if (this.err >= this.maxErr) this.finish(false, 0);
      else if (this.seq.every(a => a.st)) this.finish(true, this.err === 0 ? 3 : this.err <= 2 ? 2 : 1);
    },
    draw(g) {
      panel(g, this.title, this.hint);
      if (this.slides) { g.fillStyle = '#fff'; g.fillRect(PX + 120, PY + 80, 580, 200); g.strokeStyle = PAL.ink; g.lineWidth = 4; g.strokeRect(PX + 120, PY + 80, 580, 200); txt(g, 'Diapo ' + (Math.floor(this.good / 4) + 1) + ' : ' + ['NOS VALEURS', 'LE CHIFFRE', 'LA VISION', 'MERCI'][Math.floor(this.good / 4) % 4], W / 2, PY + 190, 34); }
      else { // grille de tableur
        g.fillStyle = '#fff'; g.fillRect(PX + 20, PY + 70, PW - 40, 230); g.strokeStyle = '#c8d4c0'; g.lineWidth = 1;
        for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(PX + 20, PY + 70 + i * 26); g.lineTo(PX + PW - 20, PY + 70 + i * 26); g.stroke(); }
        for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(PX + 20 + i * 96, PY + 70); g.lineTo(PX + 20 + i * 96, PY + 300); g.stroke(); }
        const filled = this.good; for (let i = 0; i < filled && i < 60; i++) { g.fillStyle = '#2b2a2c'; g.fillRect(PX + 30 + (i % 8) * 96, PY + 80 + Math.floor(i / 8) * 26, 40 + (i * 37) % 40, 8); }
      }
      const ly = PY + 340; g.fillStyle = PAL.ink; g.fillRect(PX, ly, PW, 100); g.fillStyle = '#3a3542'; g.fillRect(PX, ly + 4, PW, 92);
      g.strokeStyle = PAL.yellow; g.lineWidth = 4; g.strokeRect(PX + this.hitX - 42, ly + 8, 84, 84);
      g.save(); g.beginPath(); g.rect(PX, ly, PW, 100); g.clip();
      this.seq.forEach(a => { if (a.x > -50 && a.x < PW + 50) { g.globalAlpha = a.st ? .25 : 1; keycapBig(g, ARW[a.d], PX + a.x - 32, ly + 18, a.st === 2 ? PAL.red : a.st === 1 ? PAL.green : '#f4f1ea'); g.globalAlpha = 1; } });
      g.restore();
      for (let i = 0; i < this.maxErr; i++) txt(g, '✖', PX + PW - 40 - i * 30, PY + 476, 22, i < this.err ? PAL.red : '#bbb');
      txt(g, this.seq.filter(a => a.st).length + ' / ' + this.seq.length, PX + 70, PY + 476, 22);
    }
  });
}
function keycapBig(g, l, x, y, col) { g.fillStyle = PAL.ink; g.fillRect(x, y, 64, 64); g.fillStyle = col; g.fillRect(x + 3, y + 3, 58, 52); txt(g, l, x + 32, y + 44, 38, PAL.ink); }
// ---------- 6. Standard téléphonique (mémoire) ----------
function MG_standard(p) {
  const order = ['left', 'up', 'right', 'down'], cols = ['#d8433b', '#3d72c4', '#5fb36a', '#f2c94c'];
  return MGBase({
    title: 'STANDARD', target: p.len, seq: [irnd(0, 3), irnd(0, 3)], phase: 'show', si: 0, st: 0, inp: 0, lit: -1, litT: 0, strikes: 0, okRounds: 0,
    hint: 'Répète les lignes avec les flèches',
    update(dt) {
      this.litT -= dt; if (this.litT <= 0) this.lit = -1;
      if (this.phase === 'show') {
        this.st -= dt;
        if (this.st <= 0) { if (this.si < this.seq.length) { this.lit = this.seq[this.si]; this.litT = .42; this.st = .62; this.si++; Sound.play('ring'); } else { this.phase = 'in'; this.inp = 0; } }
      } else {
        for (let i = 0; i < 4; i++) if (hit(order[i])) {
          this.lit = i; this.litT = .2;
          if (this.seq[this.inp] === i) { this.inp++; Sound.play('click'); if (this.inp >= this.seq.length) { if (this.seq.length >= this.target) this.finish(true, this.strikes === 0 ? 3 : this.strikes === 1 ? 2 : 1); else { this.seq.push(irnd(0, 3)); this.phase = 'show'; this.si = 0; this.st = .8; Sound.play('ok'); } } }
          else { this.strikes++; Sound.play('bad'); if (this.strikes >= 3) this.finish(false, 0); else { this.phase = 'show'; this.si = 0; this.st = 1; } }
        }
      }
    },
    draw(g) {
      panel(g, this.title, this.hint);
      const pos = [[-170, 0], [0, -110], [170, 0], [0, 110]];
      g.fillStyle = PAL.ink; g.fillRect(W / 2 - 280, PY + 110, 560, 330); g.fillStyle = '#3a3542'; g.fillRect(W / 2 - 274, PY + 116, 548, 318);
      pos.forEach(([dx, dy], i) => {
        const x = W / 2 + dx - 60, y = PY + 245 + dy - 40; g.fillStyle = PAL.ink; g.fillRect(x - 4, y - 4, 128, 88);
        g.fillStyle = this.lit === i ? '#fff' : cols[i]; g.fillRect(x, y, 120, 80); txt(g, ARW[order[i]], x + 60, y + 54, 40, PAL.ink);
      });
      txt(g, this.phase === 'show' ? 'ÉCOUTE…' : 'À TOI !', W / 2, PY + 255, 22, '#fff');
      txt(g, 'Appels : ' + (this.seq.length - 1) + ' / ' + (this.target - 1), PX + 110, PY + 100, 20);
      for (let i = 0; i < 3; i++) txt(g, '✖', PX + PW - 120 + i * 32, PY + 100, 26, i < this.strikes ? PAL.red : '#bbb');
    }
  });
}
// ---------- 7. Réseau (tuyaux à pivoter) ----------
const ROT = m => ((m << 1) | (m >> 3)) & 15;
function MG_reseau(p) {
  const N = p.size || 5, grid = [];
  // chemin aléatoire de gauche à droite
  let path; for (let tries = 0; tries < 200; tries++) {
    path = [[0, irnd(0, N - 1)]]; const seen = new Set([path[0].join()]);
    let ok = false;
    for (let s = 0; s < 80; s++) {
      const [x, y] = path[path.length - 1]; if (x === N - 1 && s > N) { ok = true; break; }
      const opts = [[1, 0], [0, 1], [0, -1], [1, 0], [-1, 0]].map(([a, b]) => [x + a, y + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N && !seen.has(a + ',' + b));
      if (!opts.length) break; const n = pick(opts); path.push(n); seen.add(n.join());
    }
    if (ok) break;
  }
  const bit = (a, b) => b[0] > a[0] ? 2 : b[0] < a[0] ? 8 : b[1] > a[1] ? 4 : 1;
  for (let y = 0; y < N; y++) { grid.push([]); for (let x = 0; x < N; x++) grid[y].push(pick([5, 3, 7, 5, 6, 11])); }
  path.forEach((c, i) => { let m = 0; if (i === 0) m |= 8; else m |= bit(c, path[i - 1]); if (i === path.length - 1) m |= 2; else m |= bit(c, path[i + 1]); grid[c[1]][c[0]] = m; });
  const src = path[0][1], dst = path[path.length - 1][1];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const r = irnd(0, 3); for (let k = 0; k < r; k++) grid[y][x] = ROT(grid[y][x]); }
  return MGBase({
    title: p.hack ? 'PIRATAGE' : 'RÉSEAU', hint: 'Flèches : bouger · ESPACE : pivoter', N, grid, src, dst, cx: 0, cy: src, moves: 0, lit: new Set(), hack: p.hack,
    flow() {
      const L = new Set(); if (!(this.grid[this.src][0] & 8)) return L; const st = [[0, this.src]]; L.add('0,' + this.src);
      while (st.length) {
        const [x, y] = st.pop(), m = this.grid[y][x];
        [[1, 0, -1, 4], [2, 1, 0, 8], [4, 0, 1, 1], [8, -1, 0, 2]].forEach(([b, dx, dy, ob]) => { if (!(m & b)) return; const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= this.N || ny >= this.N) return; if (!(this.grid[ny][nx] & ob)) return; const k = nx + ',' + ny; if (!L.has(k)) { L.add(k); st.push([nx, ny]); } });
      }
      return L;
    },
    update(dt) {
      if (hit('left')) this.cx = Math.max(0, this.cx - 1); if (hit('right')) this.cx = Math.min(this.N - 1, this.cx + 1);
      if (hit('up')) this.cy = Math.max(0, this.cy - 1); if (hit('down')) this.cy = Math.min(this.N - 1, this.cy + 1);
      if (hit('act')) { this.grid[this.cy][this.cx] = ROT(this.grid[this.cy][this.cx]); this.moves++; Sound.play('click'); }
      this.lit = this.flow();
      if (this.lit.has((this.N - 1) + ',' + this.dst) && (this.grid[this.dst][this.N - 1] & 2)) this.finish(true, this.t < 40 ? 3 : this.t < 80 ? 2 : 1);
    },
    draw(g) {
      panel(g, this.title, this.hint);
      const cs = Math.min(76, 380 / this.N), ox = W / 2 - cs * this.N / 2, oy = PY + 90 + (380 - cs * this.N) / 2;
      g.fillStyle = this.hack ? '#0d1a12' : '#20222a'; g.fillRect(ox - 70, oy - 10, cs * this.N + 140, cs * this.N + 20);
      const on = this.hack ? '#5dff8a' : PAL.yellow, off = '#5a5f6c';
      for (let y = 0; y < this.N; y++) for (let x = 0; x < this.N; x++) {
        const m = this.grid[y][x], X = ox + x * cs, Y = oy + y * cs, c = this.lit.has(x + ',' + y) ? on : off, h = cs / 2, tk = cs * .2;
        g.fillStyle = '#2c2f38'; g.fillRect(X + 2, Y + 2, cs - 4, cs - 4); g.fillStyle = c;
        g.fillRect(X + h - tk / 2, Y + h - tk / 2, tk, tk);
        if (m & 1) g.fillRect(X + h - tk / 2, Y, tk, h); if (m & 4) g.fillRect(X + h - tk / 2, Y + h, tk, h);
        if (m & 8) g.fillRect(X, Y + h - tk / 2, h, tk); if (m & 2) g.fillRect(X + h, Y + h - tk / 2, h, tk);
      }
      g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(ox + this.cx * cs + 2, oy + this.cy * cs + 2, cs - 4, cs - 4);
      g.fillStyle = on; g.fillRect(ox - 60, oy + this.src * cs + cs / 2 - 14, 50, 28); g.fillStyle = PAL.green; g.fillRect(ox + this.N * cs + 10, oy + this.dst * cs + cs / 2 - 14, 50, 28);
      txt(g, this.hack ? 'ACCÈS' : 'SERVEUR', ox + this.N * cs + 35, oy + this.dst * cs + cs / 2 - 20, 14, '#fff');
    }
  });
}
// ---------- 8. Crochetage ----------
function MG_crochet(p) {
  const pins = []; for (let i = 0; i < p.pins; i++) pins.push({ ph: rnd(0, 6), sp: rnd(2.2, 3.4) * (p.speed || 1), set: false });
  return MGBase({
    title: 'CROCHETAGE', hint: 'ESPACE quand la goupille est dans l\'or', pins, i: 0, miss: 0,
    h(pn) { return (Math.sin(pn.ph) + 1) / 2; },
    update(dt) {
      this.pins.forEach(pn => { if (!pn.set) pn.ph += dt * pn.sp; });
      if (hit('act')) {
        const pn = this.pins[this.i]; const v = this.h(pn);
        if (v > .78) { pn.set = true; this.i++; Sound.play('click'); Sound.play('ok'); if (this.i >= this.pins.length) this.finish(true, this.miss === 0 ? 3 : this.miss <= 2 ? 2 : 1); }
        else { this.miss++; Sound.play('bad'); if (this.i > 0) { this.i--; this.pins[this.i].set = false; } }
      }
    },
    draw(g) {
      panel(g, this.title, this.hint);
      const n = this.pins.length, ox = W / 2 - n * 55;
      g.fillStyle = '#c9a43a'; g.fillRect(ox - 40, PY + 140, n * 110 + 80, 260); g.fillStyle = '#a98626'; g.fillRect(ox - 40, PY + 380, n * 110 + 80, 20);
      this.pins.forEach((pn, i) => {
        const x = ox + i * 110 + 20, top = PY + 160, v = pn.set ? 1 : this.h(pn);
        g.fillStyle = '#5a4a1a'; g.fillRect(x, top, 70, 200);
        g.fillStyle = 'rgba(242,201,76,.6)'; g.fillRect(x, top, 70, 200 * .22);
        g.fillStyle = i === this.i ? '#fff' : pn.set ? PAL.green : '#bbb'; g.fillRect(x + 12, top + 200 - v * 200, 46, 26);
        g.fillStyle = PAL.ink; g.fillRect(x + 12, top + 226 - v * 200, 46, 4);
      });
      g.fillStyle = '#888'; g.fillRect(ox - 120, PY + 390, n * 110 + 60, 10);
    }
  });
}
// ---------- 9. Coffre (digicode) ----------
function MG_coffre(p) {
  return MGBase({
    title: 'COFFRE-FORT', hint: 'Tape le code (chiffres ou flèches + ESPACE) · ÉCHAP : partir', code: p.code, inp: '', cx: 1, cy: 1, flash: 0, noStars: true, okTxt: 'CLIC !',
    update(dt) {
      this.flash = Math.max(0, this.flash - dt);
      if (hit('left')) this.cx = Math.max(0, this.cx - 1); if (hit('right')) this.cx = Math.min(2, this.cx + 1);
      if (hit('up')) this.cy = Math.max(0, this.cy - 1); if (hit('down')) this.cy = Math.min(3, this.cy + 1);
      let d = null; for (let i = 0; i < 10; i++) if (hit('d' + i)) d = '' + i;
      if (hit('act')) { const k = this.key(this.cx, this.cy); if (k === '←') this.inp = this.inp.slice(0, -1); else if (k !== '') d = k; }
      if (hit('back')) this.inp = this.inp.slice(0, -1);
      if (hit('esc')) { this.done = true; this.ok = false; this.cancel = true; return; }
      if (d !== null) { this.inp += d; Sound.play('click'); if (this.inp.length >= 4) { if (this.inp === this.code) this.finish(true, 3); else { Sound.play('bad'); this.flash = 1; this.inp = ''; } } }
    },
    key(x, y) { return y < 3 ? '' + (y * 3 + x + 1) : ['←', '0', ''][x]; },
    draw(g) {
      panel(g, this.title, this.hint);
      g.fillStyle = PAL.ink; g.fillRect(W / 2 - 160, PY + 76, 320, 400); g.fillStyle = '#4a4e57'; g.fillRect(W / 2 - 154, PY + 82, 308, 388);
      g.fillStyle = this.flash ? '#5a1a1a' : '#0f2a18'; g.fillRect(W / 2 - 120, PY + 100, 240, 60);
      txt(g, (this.inp + '____').slice(0, 4).split('').join(' '), W / 2, PY + 143, 40, this.flash ? '#ff6a6a' : '#5dff8a');
      for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) {
        const k = this.key(x, y); if (k === '') continue; const X = W / 2 - 110 + x * 76, Y = PY + 184 + y * 70;
        g.fillStyle = PAL.ink; g.fillRect(X, Y, 64, 58); g.fillStyle = (this.cx === x && this.cy === y) ? PAL.yellow : '#d9d6d2'; g.fillRect(X + 3, Y + 3, 58, 48); txt(g, k, X + 32, Y + 38, 28);
      }
    }
  });
}
const MINIGAMES = { copie: MG_copie, cafe: MG_cafe, classement: MG_classement, reunion: MG_reunion, saisie: MG_saisie, standard: MG_standard, reseau: MG_reseau, crochet: MG_crochet, coffre: MG_coffre };
