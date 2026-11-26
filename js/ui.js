// ===== Identité visuelle « PÉRIODE D'ESSAI » : polices, menu, interface =====
const FF = { disp: "'Anton', Impact, sans-serif", ui: "'Space Grotesk', 'Trebuchet MS', sans-serif", mono: "'JetBrains Mono', Menlo, monospace", type: "'Special Elite', 'Courier New', monospace" };
const UI = { bg: '#0e0c12', panel: 'rgba(15,13,21,.88)', line: 'rgba(255,255,255,.10)', text: '#f4efe6', mute: '#8f889c', acc: '#f5c84c', red: '#e0443a', vio: '#a98bff', paper: '#f2ece0', ink: '#1a171f', green: '#7ed492' };
const TITLE = "PÉRIODE D'ESSAI";

function tx(g, s, x, y, o = {}) {
  const size = o.size || 18, f = o.f || 'ui', w = o.w || (f === 'disp' || f === 'type' ? 400 : 700);
  g.font = w + ' ' + size + 'px ' + FF[f]; g.textAlign = o.align || 'left'; g.textBaseline = 'alphabetic';
  if ('letterSpacing' in g) g.letterSpacing = (o.ls || 0) + 'px';
  if (o.sh) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillText(s, x, y + (o.sh === true ? 3 : o.sh)); }
  g.fillStyle = o.col || UI.text; g.fillText(s, x, y);
  const m = g.measureText(s).width; if ('letterSpacing' in g) g.letterSpacing = '0px'; g.textAlign = 'left'; return m;
}
function tw(g, s, o = {}) { const size = o.size || 18, f = o.f || 'ui', w = o.w || (f === 'disp' || f === 'type' ? 400 : 700); g.font = w + ' ' + size + 'px ' + FF[f]; if ('letterSpacing' in g) g.letterSpacing = (o.ls || 0) + 'px'; const m = g.measureText(s).width; if ('letterSpacing' in g) g.letterSpacing = '0px'; return m; }
// compatibilité avec l'ancien code
function T_(g, s, x, y, size = 20, col = '#fff', align = 'left', bold = true, shadow = true) { tx(g, s, x, y, { size, col, align, w: bold ? 700 : 500, sh: shadow ? 2 : 0 }); }
function txt(g, s, x, y, size = 20, col = PAL.ink, align = 'center', bold = true) { tx(g, s, x, y, { size, col, align, w: bold ? 700 : 500 }); }
function rr(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
function rrect(g, x, y, w, h, r, fill, line) { rr(g, x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = 2; g.stroke(); } }
function panelBox(g, x, y, w, h, o = {}) {
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
  rr(g, x, y, w, h, o.r || 12); g.fillStyle = o.fill || UI.panel; g.fill(); g.restore();
  rr(g, x + .5, y + .5, w - 1, h - 1, o.r || 12); g.strokeStyle = o.line || UI.line; g.lineWidth = 1.5; g.stroke();
  if (o.stripe) { g.save(); rr(g, x, y, w, h, o.r || 12); g.clip(); g.fillStyle = o.stripe; g.fillRect(x, y, 4, h); g.restore(); }
}
function keycap(g, label, x, y, w, h = 36) {
  const fs = h * .46; if (!w) w = Math.max(h, tw(g, label, { f: 'mono', size: fs }) + h * .6);
  rr(g, x, y + 3, w, h - 3, 7); g.fillStyle = '#9d9585'; g.fill();
  rr(g, x, y, w, h - 4, 7); g.fillStyle = '#f4efe6'; g.fill();
  tx(g, label, x + w / 2, y + (h - 4) / 2 + fs * .36, { f: 'mono', size: fs, col: UI.ink, align: 'center' }); return w;
}
function stamp(g, s, x, y, o = {}) {
  const size = o.size || 40, rot = o.rot || -.14, col = o.col || UI.red;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = o.alpha || .9;
  const w = tw(g, s, { f: 'disp', size, ls: 3 }) + size * .7, h = size * 1.35;
  g.strokeStyle = col; g.lineWidth = Math.max(3, size / 11); rr(g, -w / 2, -h / 2, w, h, 6); g.stroke();
  rr(g, -w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 4); g.lineWidth = 1.5; g.stroke();
  tx(g, s, 0, size * .36, { f: 'disp', size, col, align: 'center', ls: 3 });
  g.restore();
}
// grain + vignette
const FX = {};
function fxInit() {
  FX.grain = mk(256, 256, g => { const d = g.createImageData(256, 256); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = Math.random() < .5 ? 22 : 0; } g.putImageData(d, 0, 0); });
  FX.vig = mk(W, H, g => { const r = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = r; g.fillRect(0, 0, W, H); });
  FX.bars = []; for (let i = 0; i < 46; i++) FX.bars.push(Math.random() < .35 ? 3 : Math.random() < .5 ? 2 : 1);
}
function drawGrain(g, a = .5) { if (!FX.grain) return; g.save(); g.globalAlpha = a; const ox = Math.floor(Math.random() * 256), oy = Math.floor(Math.random() * 256); for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) g.drawImage(FX.grain, x, y); g.restore(); }

// ---------- Panneau des mini-jeux ----------
function panel(g, title, hint) {
  g.fillStyle = 'rgba(8,7,12,.78)'; g.fillRect(0, 0, W, H);
  g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; g.shadowOffsetY = 14; rr(g, PX - 8, PY - 8, PW + 16, PH + 16, 18); g.fillStyle = '#17141e'; g.fill(); g.restore();
  g.save(); rr(g, PX, PY, PW, PH, 12); g.clip();
  g.fillStyle = '#efe9df'; g.fillRect(PX, PY, PW, PH);
  g.fillStyle = '#17141e'; g.fillRect(PX, PY, PW, 56); g.fillStyle = UI.acc; g.fillRect(PX, PY + 56, PW, 3);
  g.restore();
  tx(g, title, PX + 24, PY + 41, { f: 'disp', size: 30, col: UI.text, ls: 1.5 });
  if (hint) tx(g, hint.toUpperCase(), PX + PW - 22, PY + 34, { f: 'mono', size: 12, col: UI.mute, align: 'right', ls: 1 });
}

// ---------- Rendu principal ----------
function draw() {
  G.fade += (G.fadeTarget - G.fade) * .12; if (Math.abs(G.fade - G.fadeTarget) < .01) G.fade = G.fadeTarget;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  if (!FX.grain) fxInit();
  if (G.state === 'title') { drawTitle(); drawToasts(); return; }
  if (G.state === 'end') { drawEnd(); return; }
  ctx.fillStyle = '#121016'; ctx.fillRect(0, 0, W, H);
  drawWorld(ctx, g => { worldOverlay(g); drawSmoke(g); });
  if (World.night) drawDarkness(); else drawTimeTint();
  ctx.drawImage(FX.vig, 0, 0);
  drawWorldUI(true);
  G.hudIn = lerp(G.hudIn || 0, ['cut', 'accuse', 'talk', 'choice'].includes(G.state) ? 0 : 1, .12);
  if (G.hudIn > .02) { ctx.save(); ctx.globalAlpha = G.hudIn; drawHUD(); ctx.restore(); }
  drawWorldUI(false);
  if (G.state === 'cut' && !G.cardShow) drawLetterbox(1);
  if (G.cardShow) drawCard();
  if (G.state === 'mini' && G.mg) G.mg.render(ctx);
  if (G.state === 'book') drawBook();
  if (G.state === 'report') drawReport();
  if (G.state === 'fired') drawFired();
  if (G.state === 'pause') drawPause();
  if (G.state === 'accuse') drawAccuse();
  if (G.state === 'talk') drawTalk();
  if (G.state === 'choice') drawChoice();
  drawScreenFX();
  if (G.clueCard && G.state !== 'book') drawClueToast();
  if (!['report', 'fired', 'pause', 'book'].includes(G.state)) drawToasts();
  drawGrain(ctx, .35);
  if (G.fade > 0) { ctx.fillStyle = 'rgba(8,6,12,' + G.fade + ')'; ctx.fillRect(0, 0, W, H); }
}
function drawLetterbox(a) {
  G.lbox = lerp(G.lbox || 0, a, .12); const h = 56 * G.lbox;
  ctx.fillStyle = '#060509'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h);
}

// ---------- Bulles, invites ----------
function bubble(g, x, y, text, col = '#fff', name) {
  const w = Math.max(44, tw(g, text, { size: 18 }) + 28), h = 36;
  const bx = clamp(x - w / 2, 8, W - w - 8), by = y - h - 16;
  g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 4;
  rr(g, bx, by, w, h, 10); g.fillStyle = col; g.fill();
  g.beginPath(); g.moveTo(x - 8, by + h - 1); g.lineTo(x + 8, by + h - 1); g.lineTo(x, by + h + 10); g.closePath(); g.fill(); g.restore();
  tx(g, text, bx + w / 2, by + 24, { size: 18, col: UI.ink, align: 'center' });
  if (name) { const nw = tw(g, name, { f: 'mono', size: 11, ls: 1.5 }) + 14; rr(g, bx + 8, by - 13, nw, 18, 5); g.fillStyle = UI.ink; g.fill(); tx(g, name, bx + 15, by + 0, { f: 'mono', size: 11, col: UI.acc, ls: 1.5 }); }
}
function drawWorldUI(markers) {
  const g = ctx;
  if (markers) {
    if (G.state === 'play' || G.state === 'cut') G.tasks.forEach(t => {
      if (t.done || t.failed || !t.target || (t.from && G.time < t.from - 10)) return;
      const tg = t.target(); if (!tg) return; const [sx, sy] = toScreen(tg[0], tg[1]);
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return;
      const bob = Math.sin(TT * 4 + tg[0]) * 4, cy = sy - 72 + bob;
      g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 8;
      g.fillStyle = t.clue ? UI.vio : UI.acc; g.beginPath(); g.moveTo(sx, cy + 26); g.lineTo(sx - 9, cy + 12); g.lineTo(sx + 9, cy + 12); g.fill();
      g.beginPath(); g.arc(sx, cy, 17, 0, 7); g.fill(); g.restore();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(sx, cy, 13, 0, 7); g.fill();
      drawIcon(g, t.icon, sx - 10, cy - 10, 20);
    });
    return;
  }
  World.ents.forEach(e => { if (e.bubble && !e.hidden) { const [sx, sy] = toScreen(e.x, e.y - 30); const alarm = e.bubble === '!' || e.bubble === '?!' || e.bubble === '?'; bubble(g, sx, sy, e.bubble, alarm ? '#ffd9d2' : '#fff', alarm || e.id === 'player' ? null : (CAST[e.id] && CAST[e.id].name.toUpperCase())); } });
  const p = player(); if (!p) return;
  const [px, py] = toScreen(p.x, p.y);
  if (G.carry && G.state === 'play') { g.fillStyle = UI.ink; g.beginPath(); g.arc(px, py - 86, 19, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(px, py - 86, 16, 0, 7); g.fill(); drawIcon(g, G.carry.icon, px - 11, py - 97, 22); if (G.carry.n > 1) tx(g, '×' + G.carry.n, px + 20, py - 78, { f: 'mono', size: 15, sh: 2 }); }
  if (G.state !== 'play') return;
  if (G.hold) {
    const pr = G.hold.p, c = G.hold.it.sneaky ? UI.vio : UI.acc;
    g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.arc(px, py - 84, 22, 0, 7); g.stroke();
    g.strokeStyle = c; g.lineCap = 'round'; g.beginPath(); g.arc(px, py - 84, 22, -Math.PI / 2, -Math.PI / 2 + pr * Math.PI * 2); g.stroke(); g.lineCap = 'butt';
  } else if (G.near) {
    const it = G.near, lab = it.label.toUpperCase(), sneak = it.sneaky;
    const lw = tw(g, lab, { size: 15, ls: 1 }), extra = it.hold ? tw(g, 'MAINTENIR', { f: 'mono', size: 10, ls: 1 }) + 12 : 0;
    const w = lw + 62 + extra, x = clamp(px - w / 2, 8, W - w - 8), y = py - 118;
    panelBox(g, x, y, w, 38, { r: 9, fill: sneak ? 'rgba(40,26,66,.94)' : 'rgba(15,13,21,.94)', line: sneak ? UI.vio : 'rgba(245,200,76,.6)' });
    keycap(g, 'E', x + 7, y + 6, 26, 28);
    if (it.hold) { tx(g, 'MAINTENIR', x + 42, y + 24, { f: 'mono', size: 10, col: sneak ? UI.vio : UI.acc, ls: 1 }); }
    tx(g, lab, x + 42 + extra, y + 25, { size: 15, ls: 1 });
  }
}

// ---------- HUD ----------
function drawHUD() {
  const g = ctx, list = G.tasks.filter(t => !t.hidden || (typeof t.hidden === 'function' && !t.hidden()));
  // fondu si le joueur passe dessous
  const pp = player(); let fadeL = 1, fadeR = 1;
  if (pp) { const [sx, sy] = toScreen(pp.x, pp.y); if (sx < 330 && sy < (G.tasksMin ? 200 : 190 + list.filter(t => !t.done).length * 30 + 50)) fadeL = .25; if (sx > W - 360 && sy < 150) fadeR = .28; }
  G.hudL = lerp(G.hudL || 1, fadeL, .15); G.hudR = lerp(G.hudR || 1, fadeR, .15);
  g.save(); g.globalAlpha = G.hudL;
  // carte jour / heure
  panelBox(g, 20, 18, 300, 112, { stripe: G.night ? UI.vio : UI.acc });
  tx(g, G.night ? 'NUIT' : DAYNAMES[G.day - 1], 40, 64, { f: 'disp', size: 38, ls: 1.5 });
  tx(g, G.night ? '22:00' : fmtTime(G.time).replace('h', ':'), 302, 62, { f: 'mono', size: 30, col: G.night ? UI.vio : UI.acc, align: 'right' });
  const gr = GRADES[G.day - 1].toUpperCase(), gw = tw(g, gr, { size: 11, ls: 1.5 }) + 18;
  rr(g, 40, 80, gw, 22, 11); g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1.5; g.stroke(); tx(g, gr, 49, 95, { size: 11, col: '#d8d1e2', ls: 1.5 });
  tx(g, 'JOUR ' + G.day + '/5', 302, 95, { f: 'mono', size: 11, col: UI.mute, align: 'right', ls: 1 });
  if (!G.night) { g.fillStyle = 'rgba(255,255,255,.09)'; g.fillRect(40, 114, 262, 3); g.fillStyle = UI.acc; g.fillRect(40, 114, 262 * clamp((G.time - 540) / 540, 0, 1), 3); }
  // liste compacte : seulement ce qui reste à faire (T pour replier)
  const by = 140, todo = list.filter(t => !t.done || (t.doneAt && TT - t.doneAt < 1.6));
  list.forEach(t => { if (t.done && !t.doneAt) t.doneAt = TT; });
  const nd = list.filter(t => t.done).length;
  const head = (G.night ? 'CE SOIR' : 'À FAIRE') + '  ' + nd + '/' + list.length;
  const hw = tw(g, head, { f: 'mono', size: 11, ls: 2 }) + 58;
  rr(g, 20, by, hw, 24, 12); g.fillStyle = 'rgba(15,13,21,.72)'; g.fill();
  tx(g, head, 34, by + 16, { f: 'mono', size: 11, col: UI.mute, ls: 2 });
  keycap(g, 'T', 20 + hw - 26, by + 3, 20, 20);
  if (!G.tasksMin) {
    let y = by + 30;
    todo.forEach(t => {
      const late = t.from && G.time < t.from, a = t.done ? clamp(1.6 - (TT - t.doneAt), 0, 1) * .8 : t.failed ? .5 : late ? .6 : 1; g.globalAlpha = G.hudL * a;
      const lab = t.label + (t.count ? '  ' + (t.prog || 0) + '/' + t.count : ''), timeS = late ? fmtTime(t.from).replace('h', ':') : '';
      const w = tw(g, lab, { size: 14, w: 500 }) + 58 + (late ? tw(g, timeS, { f: 'mono', size: 10 }) + 16 : 0);
      rr(g, 20, y, w, 26, 13); g.fillStyle = 'rgba(15,13,21,.62)'; g.fill();
      g.fillStyle = t.clue ? UI.vio : t.failed ? UI.red : UI.acc; g.beginPath(); g.arc(33, y + 13, 3.5, 0, 7); g.fill();
      drawIcon(g, t.icon, 42, y + 5, 16);
      const lw = tx(g, lab, 64, y + 18, { size: 14, w: 500, col: t.failed ? '#ff8f84' : t.clue ? '#d9cbff' : UI.text });
      if (t.done) { g.fillStyle = UI.acc; g.fillRect(64, y + 13, lw, 1.5); }
      if (late) tx(g, timeS, 64 + lw + 10, y + 17, { f: 'mono', size: 10, col: UI.acc });
      y += 30;
    });
  }
  g.restore();
  // stats à droite
  g.save(); g.globalAlpha = G.hudR;
  const rx = W - 320; panelBox(g, rx, 18, 300, 112);
  drawIcon(g, 'star', rx + 20, 32, 22); tx(g, '' + G.rep, rx + 50, 51, { f: 'mono', size: 22, col: UI.acc });
  tx(g, 'RÉPUTATION', rx + 50, 66, { f: 'mono', size: 9, col: UI.mute, ls: 2 });
  drawIcon(g, 'search', rx + 166, 32, 22); tx(g, G.clues.length + '/' + CLUE_TOTAL(), rx + 196, 51, { f: 'mono', size: 22, col: UI.vio });
  tx(g, 'INDICES', rx + 196, 66, { f: 'mono', size: 9, col: UI.mute, ls: 2 });
  g.fillStyle = UI.line; g.fillRect(rx + 20, 78, 260, 1);
  drawIcon(g, 'eye', rx + 20, 88, 20); tx(g, 'SOUPÇON', rx + 48, 103, { f: 'mono', size: 10, col: UI.mute, ls: 2 });
  for (let i = 0; i < 10; i++) { const on = G.susp / 10 > i; g.fillStyle = on ? (i >= 7 ? UI.red : i >= 4 ? '#f08a3c' : '#c8c0d6') : 'rgba(255,255,255,.1)'; rr(g, rx + 130 + i * 15, 92, 11, 14, 2); g.fill(); }
  if (G.susp > 66 && Math.sin(TT * 10) > 0) { rr(g, rx, 18, 300, 112, 12); g.strokeStyle = UI.red; g.lineWidth = 2; g.stroke(); }
  if (!G.night && G.warnings) { for (let i = 0; i < 3; i++) { rr(g, rx + 20 + i * 92, 140, 84, 22, 6); g.fillStyle = i < G.warnings ? UI.red : 'rgba(255,255,255,.08)'; g.fill(); } tx(g, 'AVERTISSEMENTS', rx + 150, 176, { f: 'mono', size: 10, col: '#ff8f84', align: 'center', ls: 2 }); }
  g.restore();
  // bas d'écran
  if (p0() && G.state === 'play') { const r = roomAt(p0().x, p0().y).name.toUpperCase(); const w = tw(g, r, { f: 'mono', size: 12, ls: 4 }) + 30; rr(g, W / 2 - w / 2, H - 40, w, 26, 13); g.fillStyle = 'rgba(15,13,21,.7)'; g.fill(); tx(g, r, W / 2, H - 22, { f: 'mono', size: 12, col: '#cfc8d8', align: 'center', ls: 4 }); }
  let kx = 20; kx += keycap(g, 'TAB', kx, H - 44, 0, 28) + 8; kx += tx(g, 'CARNET', kx, H - 24, { f: 'mono', size: 11, col: UI.mute, ls: 1.5 }) + 18;
  kx += keycap(g, 'ÉCHAP', kx, H - 44, 0, 28) + 8; tx(g, 'PAUSE', kx, H - 24, { f: 'mono', size: 11, col: UI.mute, ls: 1.5 });
}
function p0() { return player(); }

// ---------- Carton de titre (cinématiques) ----------
function drawCard() {
  const c = G.cardShow, g = ctx, a = clamp(c.t * 2.5, 0, 1);
  g.fillStyle = 'rgba(8,7,12,' + (.92 * a) + ')'; g.fillRect(0, 0, W, H);
  const h = 70 * ease(a); g.fillStyle = '#000'; g.fillRect(0, 0, W, h); g.fillRect(0, H - h, W, h);
  g.save(); g.globalAlpha = a;
  const isDay = DAYNAMES.includes(c.title);
  tx(g, isDay ? 'GRIBOUILLE & FILS  ·  JOUR ' + (DAYNAMES.indexOf(c.title) + 1) + ' / 5' : TITLE, W / 2, H / 2 - 96, { f: 'mono', size: 14, col: UI.mute, align: 'center', ls: 5 });
  const ty = H / 2 + 40 - (1 - a) * 20;
  tx(g, c.title, W / 2, ty, { f: 'disp', size: c.title.length > 12 ? 92 : 132, col: isDay ? UI.text : UI.acc, align: 'center', ls: 4, sh: 5 });
  g.fillStyle = UI.acc; g.fillRect(W / 2 - 40 * a, ty + 26, 80 * a, 4);
  if (c.sub) tx(g, c.sub, W / 2, ty + 74, { f: 'type', size: 24, col: '#e9e1d2', align: 'center' });
  g.restore();
}
// ---------- Notifications ----------
function drawToasts() {
  G.toasts.forEach((t, i) => {
    const life = 3 - t.t, a = clamp(Math.min(life * 5, t.t * 2.5), 0, 1), y = 150 + i * 52 - (1 - a) * 16;
    ctx.save(); ctx.globalAlpha = a;
    const w = tw(ctx, t.text, { size: 18 }) + 52, x = W / 2 - w / 2;
    panelBox(ctx, x, y - 30, w, 42, { r: 10, fill: 'rgba(15,13,21,.95)', stripe: t.col });
    tx(ctx, t.text, W / 2 + 4, y - 3, { size: 18, col: UI.text, align: 'center' });
    ctx.restore();
  });
}
// ---------- Indices ----------
function clueFrame(g, id, x, y, w, h, sel) {
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = sel ? 22 : 10; g.shadowOffsetY = 6;
  rr(g, x, y, w, h, 6); g.fillStyle = '#25212d'; g.fill(); g.restore();
  if (sel) { rr(g, x - 3, y - 3, w + 6, h + 6, 8); g.strokeStyle = UI.acc; g.lineWidth = 3; g.stroke(); }
  g.save(); rr(g, x, y, w, h, 6); g.clip(); drawClueArt(g, id, x, y, w, h - 34); g.fillStyle = '#17141e'; g.fillRect(x, y + h - 34, w, 34); g.restore();
  const C = CLUES[id]; tx(g, C.t.toUpperCase(), x + w / 2, y + h - 12, { size: w < 140 ? 10 : 12, col: UI.text, align: 'center', ls: 1 });
  g.fillStyle = UI.red; g.beginPath(); g.arc(x + w / 2, y + 4, 6, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.arc(x + w / 2 - 2, y + 2, 2, 0, 7); g.fill();
}
function drawClueToast() {
  const c = G.clueCard, g = ctx, a = clamp(Math.min(3.2 - c.t, c.t) * 4, 0, 1), y = lerp(H + 40, H / 2 - 130, ease(a));
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(8,7,12,' + .5 * a + ')'; g.fillRect(0, 0, W, H);
  tx(g, 'NOUVEL INDICE', W / 2, y - 26, { f: 'mono', size: 15, col: UI.vio, align: 'center', ls: 6 });
  clueFrame(g, c.id, W / 2 - 100, y, 200, 236, true);
  tx(g, CLUES[c.id].s, W / 2, y + 276, { f: 'type', size: 19, col: UI.text, align: 'center' });
  g.restore();
}
function drawBook() {
  const g = ctx; g.fillStyle = 'rgba(8,7,12,.88)'; g.fillRect(0, 0, W, H);
  g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; rr(g, 60, 70, W - 120, H - 130, 10); g.fillStyle = '#5c3e24'; g.fill(); g.restore();
  rr(g, 74, 84, W - 148, H - 158, 6); g.fillStyle = '#b48555'; g.fill();
  g.save(); rr(g, 74, 84, W - 148, H - 158, 6); g.clip(); for (let i = 0; i < 520; i++) { g.fillStyle = i % 3 ? 'rgba(90,55,25,.16)' : 'rgba(255,230,190,.08)'; g.fillRect((i * 97) % (W - 160) + 80, (i * 53) % (H - 170) + 88, 3, 2); } g.restore();
  tx(g, "CARNET D'ENQUÊTE", 100, 52, { f: 'disp', size: 40, ls: 2 });
  tx(g, G.clues.length + ' / ' + CLUE_TOTAL() + ' INDICES', W - 100, 50, { f: 'mono', size: 14, col: UI.vio, align: 'right', ls: 3 });
  if (!G.clues.length) { tx(g, 'Rien pour l\'instant…', W / 2, H / 2, { f: 'type', size: 28, col: UI.ink, align: 'center' }); return; }
  const cw = 168, ch = 196, cols = 6, gx = (W - 148 - cols * cw) / (cols + 1), rows = 2, row0 = Math.max(0, Math.floor((G.bookSel || 0) / cols) - rows + 1);
  G.clues.forEach((id, i) => { const r = Math.floor(i / cols) - row0; if (r < 0 || r >= rows) return; const x = 74 + gx + (i % cols) * (cw + gx), y = 104 + r * (ch + 18) + ((i * 7) % 5); clueFrame(g, id, x, y, cw, ch, i === G.bookSel); });
  if (Math.ceil(G.clues.length / cols) > row0 + rows) tx(g, '▼  ↓ SUITE', W / 2, H - 66, { f: 'mono', size: 12, col: UI.ink, align: 'center', ls: 2 });
  if (row0 > 0) tx(g, '▲  ↑', W / 2, 96, { f: 'mono', size: 12, col: UI.ink, align: 'center', ls: 2 });
  const C = CLUES[G.clues[G.bookSel || 0]];
  if (C) { panelBox(g, 140, H - 52, W - 280, 40, { r: 8, fill: UI.paper, line: 'rgba(0,0,0,.2)' }); tx(g, C.s, W / 2, H - 25, { f: 'type', size: 18, col: UI.ink, align: 'center' }); }
}
// ---------- Bilan ----------
function paperSheet(g, x, y, w, h, rot) {
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
  g.fillStyle = UI.paper; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
  g.fillStyle = 'rgba(0,0,0,.05)'; for (let i = 0; i < h; i += 28) g.fillRect(-w / 2 + 30, -h / 2 + 90 + i, w - 60, 1);
  g.restore();
}
function drawReport() {
  const g = ctx, a = clamp(G.reportT * 2, 0, 1); g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(8,7,12,.86)'; g.fillRect(0, 0, W, H);
  const x = W / 2 - 300, y = 70 + (1 - ease(a)) * 40, w = 600, h = 560;
  paperSheet(g, x, y, w, h, -.012);
  g.save(); g.translate(W / 2, y + h / 2); g.rotate(-.012); g.translate(-W / 2, -(y + h / 2));
  tx(g, 'GRIBOUILLE & FILS — RESSOURCES HUMAINES', x + 40, y + 50, { f: 'mono', size: 12, col: '#6b6474', ls: 2 });
  tx(g, 'ÉVALUATION DU ' + DAYNAMES[G.day - 1], x + 40, y + 104, { f: 'disp', size: 46, col: UI.ink, ls: 1 });
  g.fillStyle = UI.ink; g.fillRect(x + 40, y + 120, w - 80, 3);
  const st = G.dayStars, avg = st.length ? st.reduce((a, b) => a + b, 0) / st.length : 3;
  const rows = [['Missions accomplies', G.tasks.filter(t => t.done && !t.clue).length + ' / ' + G.tasks.filter(t => !t.clue).length], ['Indices trouvés', G.clues.length + ' / ' + CLUE_TOTAL()], ['Réputation', '' + G.rep], ['Avertissements', '' + G.warnings]];
  rows.forEach((r, i) => { tx(g, r[0], x + 40, y + 168 + i * 40, { f: 'type', size: 22, col: UI.ink }); tx(g, r[1], x + w - 40, y + 168 + i * 40, { f: 'mono', size: 20, col: UI.ink, align: 'right' }); });
  tx(g, 'Note du jour', x + 40, y + 350, { f: 'type', size: 22, col: UI.ink }); stars(g, Math.round(avg), x + w - 160, y + 342, 30);
  const night = DAYS[G.day].night && !G.nightDone;
  if (G.reportT > .6) { const s = clamp((G.reportT - .6) * 4, 0, 1); g.save(); g.globalAlpha = a * s; const sc = 1 + (1 - s) * .6; g.translate(x + w / 2, y + 450); g.scale(sc, sc);
    if (night) stamp(g, 'HEURES SUP\'', 0, 0, { size: 44, col: '#5b45c9', rot: -.1 }); else if (G.day < 5) stamp(g, 'PROMU : ' + GRADES[G.day].toUpperCase(), 0, 0, { size: 36, rot: -.08 }); else stamp(g, 'DOSSIER CLOS', 0, 0, { size: 44 }); g.restore(); }
  g.restore();
  if (G.reportT > 1) { const kx = W / 2 - 80; keycap(g, 'E', kx, H - 52, 34, 32); tx(g, 'CONTINUER', kx + 46, H - 30, { f: 'mono', size: 14, col: UI.text, ls: 3 }); }
  g.restore();
}
function drawFired() {
  const g = ctx; g.fillStyle = 'rgba(30,6,8,.88)'; g.fillRect(0, 0, W, H);
  const x = W / 2 - 280, y = 110, w = 560, h = 420;
  paperSheet(g, x, y, w, h, .015);
  tx(g, G.caught ? 'RAPPORT DE SÉCURITÉ' : 'LETTRE DE LICENCIEMENT', x + 40, y + 60, { f: 'mono', size: 14, col: '#6b6474', ls: 3 });
  tx(g, 'Motif :', x + 40, y + 130, { f: 'type', size: 22, col: UI.ink });
  tx(g, G.firedReason || '', x + 40, y + 170, { f: 'type', size: 24, col: UI.ink });
  tx(g, 'La direction.', x + w - 40, y + 240, { f: 'type', size: 20, col: '#555', align: 'right' });
  stamp(g, G.caught ? 'REPÉRÉ' : 'VIRÉ', W / 2, y + 330, { size: 78, rot: -.16 });
  const kx = W / 2 - 80; keycap(g, 'E', kx, H - 92, 34, 32); tx(g, 'RÉESSAYER', kx + 46, H - 70, { f: 'mono', size: 14, col: UI.text, ls: 3 });
}
function drawPause() {
  const g = ctx; g.fillStyle = 'rgba(8,7,12,.82)'; g.fillRect(0, 0, W, H);
  tx(g, 'PAUSE', 120, 230, { f: 'disp', size: 110, ls: 4 }); g.fillStyle = UI.acc; g.fillRect(124, 256, 70, 5);
  const opts = ['Reprendre', 'Son : ' + (Sound.muted ? 'coupé' : 'activé'), 'Menu principal'];
  G.pY = lerp(G.pY || 0, G.menu, .25);
  rr(g, 108, 300 + G.pY * 58, 420, 46, 8); g.fillStyle = UI.acc; g.fill();
  opts.forEach((s, i) => { tx(g, '0' + (i + 1), 126, 330 + i * 58, { f: 'mono', size: 13, col: G.menu === i ? UI.ink : UI.mute }); tx(g, s.toUpperCase(), 168, 332 + i * 58, { size: 24, col: G.menu === i ? UI.ink : '#cfc8d8', ls: 2 }); });
  panelBox(g, 700, 170, 470, 380);
  tx(g, 'COMMANDES', 730, 214, { f: 'mono', size: 13, col: UI.mute, ls: 4 });
  [['ZQSD', 'Se déplacer'], ['E', 'Agir · parler · valider'], ['ESPACE', 'Agir (mini-jeux)'], ['TAB', 'Carnet d\'enquête'], ['M', 'Couper le son'], ['ÉCHAP', 'Pause']].forEach(([k, l], i) => { keycap(g, k, 730, 238 + i * 48, 0, 34); tx(g, l, 860, 262 + i * 48, { size: 17, w: 500 }); });
}

// ---------- Écran titre ----------
function drawTitleBG(g) {
  G.titleT = (G.titleT || 0) + 1 / 60;
  if (World.layer) {
    const vw = W / WS, span = MW * T - vw;
    Cam.x = span / 2 + Math.sin(TT * .045) * span / 2; Cam.y = 110 + Math.sin(TT * .07) * 70;
    drawWorld(g); g.fillStyle = 'rgba(12,14,34,.62)'; g.fillRect(0, 0, W, H);
  } else { g.fillStyle = UI.bg; g.fillRect(0, 0, W, H); }
  const lg = g.createLinearGradient(0, 0, W, 0); lg.addColorStop(0, 'rgba(10,9,15,.97)'); lg.addColorStop(.48, 'rgba(10,9,15,.86)'); lg.addColorStop(1, 'rgba(10,9,15,.35)');
  g.fillStyle = lg; g.fillRect(0, 0, W, H); g.drawImage(FX.vig, 0, 0);
  // néon qui grésille
  const fl = Math.sin(TT * 37) > .97 || (TT % 7 > 6.85) ? .25 : 1;
  g.fillStyle = 'rgba(245,200,76,' + .05 * fl + ')'; g.fillRect(0, 0, W, 4);
}
function drawBadge(g, cx, top) {
  const rot = Math.sin(TT * .9) * .03 + Math.sin(TT * 2.3) * .006;
  // cordon
  g.save(); g.strokeStyle = '#c23b31'; g.lineWidth = 9; g.beginPath(); g.moveTo(cx - 70, -10); g.quadraticCurveTo(cx - 30, top - 60, cx - 6, top - 6); g.moveTo(cx + 70, -10); g.quadraticCurveTo(cx + 30, top - 60, cx + 6, top - 6); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.stroke(); g.restore();
  g.save(); g.translate(cx, top); g.rotate(rot);
  // pince
  g.fillStyle = '#b9b6bd'; rr(g, -16, -14, 32, 26, 5); g.fill(); g.fillStyle = '#7d7a82'; g.fillRect(-10, -6, 20, 4);
  const w = 310, h = 430, x = -w / 2, y = 8;
  g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; g.shadowOffsetY = 20; rr(g, x, y, w, h, 18); g.fillStyle = '#f6f2ea'; g.fill(); g.restore();
  g.save(); rr(g, x, y, w, h, 18); g.clip();
  g.fillStyle = UI.acc; g.fillRect(x, y, w, 86); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, y + 80, w, 6);
  rr(g, -24, y + 14, 48, 9, 5); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
  tx(g, 'GRIBOUILLE & FILS', 0, y + 58, { f: 'disp', size: 28, col: UI.ink, align: 'center', ls: 1.5 });
  tx(g, 'BADGE TEMPORAIRE', 0, y + 76, { f: 'mono', size: 10, col: 'rgba(26,23,31,.7)', align: 'center', ls: 3 });
  // photo
  const px = x + 26, py = y + 108; const pg = g.createLinearGradient(0, py, 0, py + 170); pg.addColorStop(0, '#4f78c9'); pg.addColorStop(1, '#2c4a8a');
  rr(g, px, py, 140, 170, 6); g.fillStyle = pg; g.fill();
  g.save(); rr(g, px, py, 140, 170, 6); g.clip(); g.imageSmoothingEnabled = false; g.drawImage(IMG.char_player, 0, 0, 32, 32, px - 26, py - 6, 192, 192); g.restore();
  rr(g, px, py, 140, 170, 6); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.stroke();
  // infos
  const ix = x + 182;
  [['NOM', 'LE NOUVEAU'], ['POSTE', 'Stagiaire'], ['MATRICULE', '0011'], ['ARRIVÉE', 'Lundi 8h59']].forEach(([k, v], i) => { tx(g, k, ix, py + 14 + i * 42, { f: 'mono', size: 9, col: '#8a8392', ls: 2 }); tx(g, v, ix, py + 33 + i * 42, { size: i === 0 ? 15 : 14, col: UI.ink }); });
  // code-barres
  let bx = x + 26; for (let i = 0; i < FX.bars.length && bx < x + w - 26; i++) { g.fillStyle = UI.ink; if (i % 2 === 0) g.fillRect(bx, y + h - 74, FX.bars[i], 44); bx += FX.bars[i] + 2; }
  tx(g, '*0011-GF-47*', x + w / 2, y + h - 16, { f: 'mono', size: 11, col: '#6b6474', align: 'center', ls: 3 });
  g.restore();
  stamp(g, "À L'ESSAI", x + 120, y + 250, { size: 34, rot: -.22, alpha: .82 });
  g.restore();
}
function drawTitle() {
  const g = ctx; drawTitleBG(g);
  const a = clamp((G.titleT || 0) * 1.2, 0, 1);
  g.save(); g.globalAlpha = a;
  tx(g, 'GRIBOUILLE & FILS  ·  DOSSIER DU PERSONNEL N° 0011', 96, 84, { f: 'mono', size: 13, col: UI.mute, ls: 3 });
  tx(g, 'PÉRIODE', 90, 258, { f: 'disp', size: 140, col: UI.text, ls: 3, sh: 6 });
  tx(g, "D'ESSAI", 90, 396, { f: 'disp', size: 140, col: UI.acc, ls: 3, sh: 6 });
  stamp(g, 'CONFIDENTIEL', 560, 300, { size: 30, rot: -.17, alpha: .75 });
  tx(g, 'Survivre à la semaine.', 98, 446, { f: 'type', size: 26, col: '#e9e1d2' });
  // menu
  const sv = loadSave(); const opts = sv ? ['Continuer · ' + DAYNAMES[sv.day - 1].toLowerCase(), 'Nouvelle partie', 'Crédits'] : ['Nouvelle partie', 'Crédits'];
  G.mY = lerp(G.mY == null ? G.menu : G.mY, G.menu, .22);
  const my = 486;
  const selW = tw(g, opts[G.menu].toUpperCase(), { size: 26, ls: 3 }) + 96;
  rr(g, 88, my + G.mY * 52 - 2, selW, 44, 6); g.fillStyle = UI.acc; g.fill();
  opts.forEach((s, i) => { const sel = G.menu === i; tx(g, '0' + (i + 1), 106, my + 27 + i * 52, { f: 'mono', size: 13, col: sel ? UI.ink : UI.mute }); tx(g, s.toUpperCase(), 146, my + 30 + i * 52, { size: 26, col: sel ? UI.ink : '#cfc8d8', ls: 3 }); if (sel) tx(g, '→', 88 + selW - 30, my + 30 + i * 52, { size: 24, col: UI.ink }); });
  g.restore();
  drawBadge(g, 1000, 150 - (1 - ease(a)) * 300);
  // pied de page
  let kx = 96; const fy = H - 46;
  kx += keycap(g, 'ZQSD', kx, fy, 0, 28) + 8; kx += tx(g, 'BOUGER', kx, fy + 19, { f: 'mono', size: 11, col: UI.mute, ls: 2 }) + 22;
  kx += keycap(g, 'E', kx, fy, 0, 28) + 8; kx += tx(g, 'VALIDER', kx, fy + 19, { f: 'mono', size: 11, col: UI.mute, ls: 2 }) + 22;
  tx(g, 'PLUME PLAYLAB  ·  v1.0', W - 40, fy + 19, { f: 'mono', size: 11, col: '#6d6680', align: 'right', ls: 3 });
  drawGrain(g, .5);
}
// ---------- Fin / crédits ----------
function drawEnd() {
  const g = ctx; drawTitleBG(g);
  const a = clamp(G.endT * .8, 0, 1); g.save(); g.globalAlpha = a;
  if (G.endKind !== 'credits') {
    const E = ENDINGS[G.endKind];
    tx(g, 'FIN', 96, 140, { f: 'mono', size: 14, col: UI.mute, ls: 6 });
    tx(g, E.title, 90, 260, { f: 'disp', size: E.title.length > 14 ? 96 : 120, col: E.col, ls: 3, sh: 6 });
    tx(g, E.sub, 98, 318, { f: 'type', size: 24, col: '#e9e1d2' });
    tx(g, 'RÉPUTATION  ' + G.rep + '     INDICES  ' + G.clues.length + ' / ' + CLUE_TOTAL(), 98, 380, { f: 'mono', size: 15, col: UI.acc, ls: 2 });
    const F = G.flags, ep = [];
    if (G.endKind === 'bonne') ep.push(['Il existe une autre fin… le patron cache quelque chose.', UI.vio]);
    if (F.coverJ === true) ep.push(['Josiane devient comptable en chef. Elle te doit une fière chandelle.', '#cfc8d8']); else if (F.coverJ === false) ep.push(['Josiane a été virée. Elle t\'en veut encore.', '#cfc8d8']);
    if (F.bribe === true) ep.push(['Les notes de frais de Patrick ? Personne n\'en saura rien. Grâce à toi.', '#cfc8d8']); else if (F.bribe === false) ep.push(['Patrick ne t\'a jamais pardonné ton refus.', '#cfc8d8']);
    if (F.deal === false && G.endKind !== 'silence') ep.push(['Gribouille t\'avait prévenu. Tu ne l\'as pas écouté.', '#cfc8d8']);
    ep.forEach(([t, c], i) => tx(g, t, 98, 416 + i * 26, { f: 'type', size: 18, col: c }));
    stamp(g, G.endKind === 'secrete' ? 'PROMU DIRECTEUR' : G.endKind === 'silence' ? 'CLASSÉ SANS SUITE' : 'DOSSIER CLOS', 1010, 150, { size: 40, rot: -.12, col: G.endKind === 'secrete' ? UI.vio : G.endKind === 'silence' ? '#8f889c' : UI.red });
  } else {
    tx(g, "PÉRIODE", 90, 230, { f: 'disp', size: 110, ls: 3, sh: 5 }); tx(g, "D'ESSAI", 90, 340, { f: 'disp', size: 110, col: UI.acc, ls: 3, sh: 5 });
  }
  const cr = [['UN JEU', 'PLUME PLAYLAB'], ['GRAPHISMES', '« Office Pixel Art » — Imersa Studios · imersastudios.itch.io/office-pixel-art'], ['POLICES', 'Anton · Space Grotesk · JetBrains Mono · Special Elite (SIL OFL)'], ['MUSIQUE & SONS', 'Générés dans le jeu']];
  cr.forEach(([k, v], i) => { tx(g, k, 98, 490 + i * 40, { f: 'mono', size: 11, col: UI.mute, ls: 3 }); tx(g, v, 300, 491 + i * 40, { size: 16, w: 500, col: UI.text }); });
  g.restore();
  if (G.endT > 2 || G.endKind === 'credits') { keycap(g, 'E', W - 210, H - 60, 34, 32); tx(g, 'MENU', W - 164, H - 38, { f: 'mono', size: 14, ls: 3 }); }
  drawGrain(g, .5);
}
// ---------- Accusation ----------
function drawAccuse() {
  const g = ctx, A = G.accuse;
  const grd = g.createLinearGradient(0, H - 280, 0, H); grd.addColorStop(0, 'rgba(8,7,12,0)'); grd.addColorStop(.32, 'rgba(8,7,12,.88)'); grd.addColorStop(1, 'rgba(8,7,12,.97)'); g.fillStyle = grd; g.fillRect(0, H - 280, W, 280);
  panelBox(g, 20, 18, 220, 56); tx(g, 'CRÉDIBILITÉ', 38, 52, { f: 'mono', size: 11, col: UI.mute, ls: 2 });
  for (let i = 0; i < 3; i++) { g.fillStyle = i < A.hearts ? UI.red : 'rgba(255,255,255,.15)'; const hx = 160 + i * 24, hy = 44; g.beginPath(); g.moveTo(hx, hy + 8); g.bezierCurveTo(hx - 12, hy, hx - 8, hy - 10, hx, hy - 4); g.bezierCurveTo(hx + 8, hy - 10, hx + 12, hy, hx, hy + 8); g.fill(); }
  keycap(g, 'TAB', W - 200, 30, 0, 30); tx(g, 'CARNET', W - 130, 51, { f: 'mono', size: 12, col: UI.mute, ls: 2 });
  if (A.msg) { const w = tw(g, '« ' + A.msg.text + ' »', { f: 'type', size: 24 }) + 60; panelBox(g, W / 2 - w / 2, 90, w, 64, { fill: UI.paper, line: 'rgba(0,0,0,.2)' }); tx(g, (CAST[A.msg.who] ? CAST[A.msg.who].name.toUpperCase() : ''), W / 2 - w / 2 + 14, 84, { f: 'mono', size: 11, col: UI.acc, ls: 2 }); tx(g, '« ' + A.msg.text + ' »', W / 2, 131, { f: 'type', size: 24, col: UI.ink, align: 'center' }); }
  if (A.phase === 'suspect') {
    tx(g, 'QUI A TUÉ BERNARD ?', W / 2, H - 236, { f: 'disp', size: 46, col: UI.text, align: 'center', ls: 3, sh: 3 });
    const L = sus(); L.forEach((s, i) => {
      const sel = i === A.sel, x = W / 2 - L.length / 2 * 156 + i * 156 + 18, y = H - 200 - (sel ? 10 : 0);
      g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 14; rr(g, x, y, 120, 168, 8); g.fillStyle = sel ? UI.paper : '#26222e'; g.fill(); g.restore();
      rr(g, x + 8, y + 8, 104, 108, 4); g.fillStyle = sel ? '#4f78c9' : '#3a3546'; g.fill();
      g.save(); rr(g, x + 8, y + 8, 104, 108, 4); g.clip(); drawPerson(g, s, x + 12, y + 6, 3); g.restore();
      tx(g, CAST[s].name.toUpperCase(), x + 60, y + 138, { size: 13, col: sel ? UI.ink : UI.text, align: 'center', ls: 1 });
      tx(g, (CAST[s].job || '').toUpperCase(), x + 60, y + 156, { f: 'mono', size: 9, col: sel ? '#6b6474' : UI.mute, align: 'center', ls: 1 });
      if (sel) { rr(g, x - 3, y - 3, 126, 174, 10); g.strokeStyle = UI.acc; g.lineWidth = 3; g.stroke(); }
    });
  } else if (A.phase === 'slot') {
    tx(g, 'PREUVE ' + (A.slot + 1) + '/3', W / 2, H - 262, { f: 'mono', size: 13, col: UI.mute, align: 'center', ls: 4 });
    tx(g, SLOTS[A.slot].k, W / 2, H - 214, { f: 'disp', size: 50, col: UI.acc, align: 'center', ls: 3, sh: 3 });
    const cw = 120, ch = 140, per = Math.min(G.clues.length, 8), start = Math.max(0, Math.min(A.sel - 3, G.clues.length - per));
    for (let k = 0; k < per; k++) { const i = start + k, id = G.clues[i]; if (!id) break; const x = W / 2 - per * (cw + 16) / 2 + k * (cw + 16) + 8; g.save(); g.globalAlpha = A.used.includes(id) ? .35 : 1; clueFrame(g, id, x, H - 182 - (i === A.sel ? 8 : 0), cw, ch, i === A.sel); g.restore(); }
    const C = CLUES[G.clues[A.sel]]; if (C) tx(g, C.s, W / 2, H - 14, { f: 'type', size: 17, col: '#e9e1d2', align: 'center' });
  }
}
