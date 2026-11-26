// ===== Rendu : monde, HUD, icônes, écrans =====
function T_(g, s, x, y, size = 20, col = '#fff', align = 'left', bold = true, shadow = true) {
  g.font = (bold ? 'bold ' : '') + size + 'px ' + FONT; g.textAlign = align;
  if (shadow) { g.fillStyle = 'rgba(0,0,0,.65)'; g.fillText(s, x + 2, y + 2); }
  g.fillStyle = col; g.fillText(s, x, y); g.textAlign = 'left';
}
function rrect(g, x, y, w, h, r, fill, line) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = 3; g.stroke(); } }

// ---------- Pictogrammes ----------
function drawIcon(g, n, x, y, s = 28) {
  const u = s / 16; g.save(); g.translate(x, y); g.scale(u, u); g.lineWidth = 1.4; g.strokeStyle = PAL.ink;
  const R = (a, b, c, d, f) => { g.fillStyle = PAL.ink; g.fillRect(a - 1, b - 1, c + 2, d + 2); g.fillStyle = f; g.fillRect(a, b, c, d); };
  switch (n) {
    case 'mail': R(1, 4, 14, 9, '#f4f4f0'); g.beginPath(); g.moveTo(1, 4); g.lineTo(8, 10); g.lineTo(15, 4); g.stroke(); break;
    case 'coffee': R(3, 5, 8, 9, '#f4f4f0'); g.fillStyle = '#6b3f22'; g.fillRect(3, 5, 8, 3); g.beginPath(); g.arc(12, 9, 2.5, -1.5, 1.5); g.stroke(); g.strokeStyle = '#ccc'; g.beginPath(); g.moveTo(6, 3); g.lineTo(6, 1); g.moveTo(9, 3); g.lineTo(9, 1); g.stroke(); break;
    case 'copy': R(4, 1, 9, 11, '#f4f4f0'); R(2, 4, 9, 11, '#ffffff'); g.fillStyle = '#999'; g.fillRect(4, 7, 5, 1); g.fillRect(4, 10, 5, 1); break;
    case 'folder': R(1, 4, 14, 10, PAL.yellow); g.fillStyle = '#d9a92c'; g.fillRect(1, 3, 6, 2); break;
    case 'meet': R(1, 2, 14, 9, '#f4f4f0'); g.strokeStyle = PAL.red; g.beginPath(); g.moveTo(3, 9); g.lineTo(7, 5); g.lineTo(9, 7); g.lineTo(13, 3); g.stroke(); g.fillStyle = PAL.ink; g.fillRect(7, 11, 2, 4); break;
    case 'phone': R(2, 6, 12, 8, '#d8433b'); R(1, 3, 14, 3, '#b02d27'); g.fillStyle = '#fff'; g.fillRect(6, 8, 4, 4); break;
    case 'box': R(2, 4, 12, 10, '#c89a5f'); g.fillStyle = '#e8d9b5'; g.fillRect(7, 4, 2, 10); break;
    case 'excel': R(1, 1, 14, 14, '#5fb36a'); g.fillStyle = '#fff'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.fillRect(3 + i * 4, 3 + j * 4, 3, 3); break;
    case 'plant': R(5, 10, 6, 5, '#a8693f'); g.fillStyle = '#3f8a46'; g.beginPath(); g.ellipse(6, 6, 2, 5, -.5, 0, 7); g.ellipse(10, 6, 2, 5, .5, 0, 7); g.fill(); break;
    case 'net': R(2, 1, 12, 14, '#24262c'); g.fillStyle = PAL.green; g.fillRect(4, 4, 2, 2); g.fillStyle = PAL.yellow; g.fillRect(4, 9, 2, 2); g.fillStyle = '#3d72c4'; g.fillRect(8, 4, 4, 2); g.fillRect(8, 9, 4, 2); break;
    case 'search': g.fillStyle = '#c9a8ff'; g.beginPath(); g.arc(7, 7, 5, 0, 7); g.fill(); g.lineWidth = 2; g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(10.5, 10.5); g.lineTo(15, 15); g.stroke(); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(4, 4, 3, 2); break;
    case 'ear': g.fillStyle = '#f0c29b'; g.beginPath(); g.ellipse(8, 8, 5, 7, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(8, 7, 2.5, 3.5, 1.5); g.stroke(); break;
    case 'key': g.fillStyle = PAL.yellow; g.beginPath(); g.arc(5, 8, 4, 0, 7); g.fill(); g.stroke(); R(8, 7, 7, 2, PAL.yellow); g.fillStyle = PAL.ink; g.fillRect(12, 9, 1, 3); g.fillRect(14, 9, 1, 2); break;
    case 'cake': R(2, 7, 12, 7, '#f4d9b0'); g.fillStyle = PAL.pink; g.fillRect(2, 7, 12, 3); g.fillStyle = PAL.yellow; g.fillRect(7, 2, 2, 5); break;
    case 'star': g.fillStyle = PAL.yellow; starPath(g, 8, 8, 7); g.fill(); g.stroke(); break;
    case 'eye': g.fillStyle = '#fff'; g.beginPath(); g.ellipse(8, 8, 7, 4.5, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = PAL.ink; g.beginPath(); g.arc(8, 8, 2.5, 0, 7); g.fill(); break;
    case 'lock': R(3, 7, 10, 8, PAL.yellow); g.beginPath(); g.arc(8, 7, 3.5, Math.PI, 0); g.stroke(); break;
    case 'safe': R(2, 2, 12, 12, '#4a4e57'); g.fillStyle = PAL.yellow; g.beginPath(); g.arc(8, 8, 3, 0, 7); g.fill(); break;
    case 'door': R(4, 1, 8, 14, '#8a5a3c'); g.fillStyle = PAL.yellow; g.fillRect(9, 8, 2, 2); break;
    case 'bed': R(1, 8, 14, 5, '#3d72c4'); R(1, 6, 4, 3, '#fff'); break;
    case 'trash': R(4, 4, 8, 11, '#555'); R(3, 2, 10, 2, '#777'); break;
    case 'pc': R(1, 2, 14, 9, '#24262c'); g.fillStyle = '#7fd1ff'; g.fillRect(2, 3, 12, 7); g.fillStyle = PAL.ink; g.fillRect(6, 12, 4, 3); break;
    case 'party': g.fillStyle = PAL.yellow; g.beginPath(); g.moveTo(2, 15); g.lineTo(6, 3); g.lineTo(14, 11); g.closePath(); g.fill(); g.stroke(); g.fillStyle = PAL.red; g.fillRect(10, 2, 2, 2); g.fillStyle = PAL.blue; g.fillRect(13, 6, 2, 2); break;
    default: g.fillStyle = '#fff'; g.fillRect(2, 2, 12, 12);
  }
  g.restore();
}

// ---------- Indices : illustration de la carte ----------
function drawClueArt(g, id, x, y, w, h) {
  g.save(); g.translate(x, y); const cx = w / 2, cy = h / 2; g.textAlign = 'center';
  const paper = (px, py, pw, ph, col = '#fbf8f1') => { g.fillStyle = PAL.ink; g.fillRect(px - 2, py - 2, pw + 4, ph + 4); g.fillStyle = col; g.fillRect(px, py, pw, ph); };
  const t = (s, px, py, sz, col = PAL.ink, b = true) => { g.font = (b ? 'bold ' : '') + sz + 'px ' + FONT; g.fillStyle = col; g.fillText(s, px, py); };
  switch (id) {
    case 'postit': g.save(); g.translate(cx, cy); g.rotate(-.08); paper(-60, -55, 120, 110, '#f7e36b'); t('47··', 0, 12, 40, '#2a3a8a'); t('code ?', 0, 42, 14, '#2a3a8a', false); g.restore(); break;
    case 'facture': paper(cx - 70, 10, 140, h - 20); t('FACTURE', cx, 40, 16); t('FANTÔME', cx, 66, 18, PAL.red); t('SARL', cx, 84, 14, PAL.red); t('n° 0011', cx, 110, 16); t('48 000 €', cx, 140, 20); break;
    case 'ragot': drawIcon(g, 'ear', cx - 40, cy - 50, 80); t('« Il posait trop', cx, h - 34, 14, '#fff'); t('de questions »', cx, h - 16, 14, '#fff'); break;
    case 'traces': g.fillStyle = '#b9b4ab'; g.fillRect(14, 14, w - 28, h - 28); g.strokeStyle = '#4a3a2a'; g.lineWidth = 5; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(30, h - 30); g.bezierCurveTo(70, 60, 110, 120, w - 30, 30); g.moveTo(48, h - 24); g.bezierCurveTo(88, 70, 128, 130, w - 14, 42); g.stroke(); g.setLineDash([]); break;
    case 'tasse': { const mx = cx - 34, my = cy - 34; g.fillStyle = PAL.ink; g.fillRect(mx - 3, my - 3, 62, 78); g.fillStyle = '#f4f4f0'; g.fillRect(mx, my, 56, 72); g.fillStyle = '#5b3520'; g.fillRect(mx, my, 56, 12);
      g.lineWidth = 6; g.strokeStyle = PAL.ink; g.beginPath(); g.arc(mx + 62, my + 34, 14, -1.4, 1.4); g.stroke(); g.lineWidth = 3; g.strokeStyle = '#f4f4f0'; g.beginPath(); g.arc(mx + 62, my + 34, 14, -1.4, 1.4); g.stroke();
      g.fillStyle = PAL.pink; g.beginPath(); g.ellipse(mx + 14, my + 4, 11, 5, -.2, 0, 7); g.fill(); t('B.', mx + 28, my + 52, 24, PAL.blue); break; }
    case 'somni': paper(cx - 60, cy - 40, 120, 80, '#e8f0ff'); g.fillStyle = '#3d72c4'; g.fillRect(cx - 60, cy - 40, 120, 22); t('DODO-MAX', cx, cy - 23, 15, '#fff'); t('somnifère', cx, cy + 6, 14, PAL.ink, false); t('VIDE', cx, cy + 30, 16, PAL.red); break;
    case 'ticket': paper(cx - 50, 10, 100, h - 20); t('CHEZ MOMO', cx, 36, 13); t('Lundi', cx, 62, 14, PAL.ink, false); t('19:30', cx, 88, 24, PAL.red); t('2 couverts', cx, 112, 12, PAL.ink, false); t('— Patrick', cx, 140, 13); break;
    case 'agenda': paper(cx - 70, 14, 140, h - 28, '#fff'); g.fillStyle = PAL.red; g.fillRect(cx - 70, 14, 140, 24); t('LUNDI', cx, 32, 15, '#fff'); t('19h', cx - 40, 76, 18); t('SQUASH', cx + 18, 76, 16, PAL.blue); t('(gagné)', cx, 110, 13, PAL.ink, false); break;
    case 'badges': paper(cx - 76, 16, 152, h - 32, '#0d1a12'); t('BADGES LUNDI', cx, 40, 13, '#5dff8a'); t('18:02 KÉVIN ↗', cx, 68, 12, '#5dff8a', false); t('19:02 ACCUEIL-01', cx, 96, 13, '#ffef6e'); t('→ RÉSERVE', cx, 116, 13, '#ffef6e'); t('19:40 ACCUEIL-01 ↗', cx, 144, 12, '#5dff8a', false); break;
    case 'noteJ': paper(cx - 66, 18, 132, h - 36, '#fff8e0'); t('Bernard,', cx, 52, 15, '#5a2a8a'); t('regarde', cx, 78, 15, '#5a2a8a'); t('FANTÔME…', cx, 104, 15, PAL.red); t('— J.', cx + 30, 136, 15, '#5a2a8a'); break;
    case 'releve': paper(cx - 70, 12, 140, h - 24); t('BANQUE', cx, 36, 13); t('Compte', cx, 62, 13, PAL.ink, false); t('FANTÔME SARL', cx, 82, 13, PAL.red); t('Titulaire :', cx, 112, 13, PAL.ink, false); t('Mme B.', cx, 138, 22, PAL.ink); break;
    case 'rouge': g.fillStyle = PAL.ink; g.fillRect(cx - 18, cy - 10, 36, 64); g.fillStyle = '#c9a43a'; g.fillRect(cx - 15, cy - 7, 30, 58); g.fillStyle = PAL.pink; g.beginPath(); g.moveTo(cx - 12, cy - 8); g.lineTo(cx - 12, cy - 46); g.lineTo(cx + 12, cy - 30); g.lineTo(cx + 12, cy - 8); g.fill(); g.stroke(); t('Fuchsia Fatal', cx, h - 14, 14, '#fff'); break;
    case 'diable': g.drawImage(SPR.diable, cx - 30, 14, 60, 120); g.fillStyle = 'rgba(200,190,170,.7)'; g.fillRect(cx - 24, 120, 48, 10); t('poussière de réserve', cx, h - 10, 12, '#fff', false); break;
    case 'contrat': paper(cx - 70, 10, 140, h - 20); t('CONTRAT', cx, 36, 15); t('FANTÔME SARL', cx, 58, 13, PAL.red); t('« 50 / 50 »', cx, 88, 16); g.strokeStyle = '#2a3a8a'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 40, 128); g.bezierCurveTo(cx - 20, 100, cx, 150, cx + 40, 118); g.stroke(); t('Gribouille', cx, 150, 12, '#2a3a8a', false); break;
    default: t('?', cx, cy, 40, '#fff');
  }
  g.restore();
}

// ---------- Rendu principal ----------
function draw() {
  G.fade += (G.fadeTarget - G.fade) * .12;
  if (Math.abs(G.fade - G.fadeTarget) < .01) G.fade = G.fadeTarget;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  if (G.state === 'title') return drawTitle();
  if (G.state === 'end') return drawEnd();
  ctx.fillStyle = '#121016'; ctx.fillRect(0, 0, W, H);
  drawWorld(ctx, worldOverlay);
  if (World.night) drawDarkness();
  drawWorldUI(true);
  if (G.state !== 'accuse' && !(G.state === 'cut' && (G.cardShow || G.accuse))) drawHUD();
  drawWorldUI(false);
  if (G.cardShow) drawCard();
  if (G.state === 'mini' && G.mg) G.mg.render(ctx);
  if (G.state === 'book') drawBook();
  if (G.state === 'report') drawReport();
  if (G.state === 'fired') drawFired();
  if (G.state === 'pause') drawPause();
  if (G.state === 'accuse') drawAccuse();
  if (G.clueCard && G.state !== 'book') drawClueToast();
  drawToasts();
  if (G.fade > 0) { ctx.fillStyle = 'rgba(8,6,12,' + G.fade + ')'; ctx.fillRect(0, 0, W, H); }
}
function worldOverlay(g) {
  // cônes de vision (près d'une action louche, ou la nuit)
  const p = player(); if (!p) return;
  const nearSneaky = G.state === 'play' && G.interacts && G.interacts.some(it => it.sneaky && (!it.when || it.when()) && Math.hypot(p.x - (it.x || 0), p.y - (it.y || 0)) < 140);
  World.ents.forEach(e => {
    if (e.hidden || e.id === 'player') return;
    if (!(e.guard || nearSneaky || (G.hold && G.hold.it.sneaky))) return;
    const a = e.lookAng != null ? e.lookAng : DIRANG[e.dir], r = e.guard ? (e.vrange || 4.4) * T : (G.blackout ? 1.8 : 5.5) * T, half = e.guard ? .5 : .75;
    const grd = g.createRadialGradient(e.x, e.y - 12, 4, e.x, e.y - 12, r);
    grd.addColorStop(0, e.guard ? 'rgba(255,240,170,.38)' : 'rgba(255,90,80,.26)'); grd.addColorStop(1, 'rgba(255,90,80,0)');
    g.fillStyle = grd; g.beginPath(); g.moveTo(e.x, e.y - 12);
    for (let i = 0; i <= 16; i++) { const aa = a - half + i * half * 2 / 16; let rr = r; for (let s = 8; s < r; s += 8) { if (isWall(Math.floor((e.x + Math.cos(aa) * s) / T), Math.floor((e.y - 12 + Math.sin(aa) * s) / T))) { rr = s; break; } } g.lineTo(e.x + Math.cos(aa) * rr, e.y - 12 + Math.sin(aa) * rr); }
    g.closePath(); g.fill();
  });
}
function drawDarkness() {
  const c = drawDarkness.c || (drawDarkness.c = document.createElement('canvas')); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = 'rgba(6,8,22,.9)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'destination-out';
  const S = (x, y) => [(x - Cam.x) * WS, (y - Cam.y) * WS];
  const hole = (x, y, r, a = 1) => { const [sx, sy] = S(x, y); const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r); gr.addColorStop(0, 'rgba(0,0,0,' + a + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, r, 0, 7); g.fill(); };
  const p = player(); if (p) hole(p.x, p.y - 14, 170, .95);
  // écrans allumés et veilleuses
  [[3, 4], [7, 4], [11, 4], [3, 6], [11, 6], [32, 4], [5.5, 17], [14.5, 8.5], [14.5, 15.5], [16.5, 6]].forEach(([x, y]) => hole(x * T, y * T, 60, .5));
  [[5.5, 21.5], [17.5, 12], [29, 12], [8.5, 9.5]].forEach(([x, y]) => hole(x * T, y * T, 110, .35));
  World.ents.forEach(e => {
    if (!e.guard || e.hidden) return; const a = e.lookAng != null ? e.lookAng : DIRANG[e.dir]; const [sx, sy] = S(e.x, e.y - 12);
    const r = ((e.vrange || 4.4) + .2) * T * WS; const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r); gr.addColorStop(0, 'rgba(0,0,0,.95)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(sx, sy); g.arc(sx, sy, r, a - .5, a + .5); g.closePath(); g.fill(); hole(e.x, e.y - 14, 50, .7);
  });
  g.globalCompositeOperation = 'source-over'; ctx.drawImage(c, 0, 0);
}
function toScreen(x, y) { return [(x - Cam.x) * WS, (y - Cam.y) * WS]; }
function bubble(g, x, y, text, col = '#fff') {
  g.font = 'bold 19px ' + FONT; const w = Math.max(40, g.measureText(text).width + 24), h = 34;
  const bx = clamp(x - w / 2, 6, W - w - 6), by = y - h - 14;
  rrect(g, bx, by, w, h, 10, col, PAL.ink); g.fillStyle = col; g.beginPath(); g.moveTo(x - 8, by + h - 1); g.lineTo(x + 8, by + h - 1); g.lineTo(x, by + h + 10); g.fill();
  g.strokeStyle = PAL.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 8, by + h + 1); g.lineTo(x, by + h + 10); g.lineTo(x + 8, by + h + 1); g.stroke();
  g.fillStyle = PAL.ink; g.textAlign = 'center'; g.fillText(text, bx + w / 2, by + 23); g.textAlign = 'left';
}
function drawWorldUI(markers) {
  const g = ctx;
  // marqueurs de tâches
  if (markers) { if (G.state === 'play' || G.state === 'cut') {
    G.tasks.forEach(t => {
      if (t.done || t.failed || !t.target || (t.from && G.time < t.from - 10)) return;
      const tg = t.target(); if (!tg) return; const [sx, sy] = toScreen(tg[0], tg[1]);
      const bob = Math.sin(TT * 4 + tg[0]) * 5;
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return;
      g.fillStyle = PAL.ink; g.beginPath(); g.arc(sx, sy - 70 + bob, 17, 0, 7); g.fill();
      g.fillStyle = t.clue ? '#8a5cd6' : PAL.yellow; g.beginPath(); g.arc(sx, sy - 70 + bob, 14, 0, 7); g.fill();
      drawIcon(g, t.icon, sx - 10, sy - 80 + bob, 20);
    });
  } return; }
  // bulles
  World.ents.forEach(e => { if (e.bubble && !e.hidden) { const [sx, sy] = toScreen(e.x, e.y - 30); bubble(g, sx, sy, e.bubble, e.bubble === '!' || e.bubble === '?!' ? '#ffd2cc' : '#fff'); } });
  const p = player(); if (!p) return;
  const [px, py] = toScreen(p.x, p.y);
  if (G.carry && G.state === 'play') { g.fillStyle = PAL.ink; g.beginPath(); g.arc(px, py - 84, 18, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(px, py - 84, 15, 0, 7); g.fill(); drawIcon(g, G.carry.icon, px - 11, py - 95, 22); if (G.carry.n > 1) T_(g, '×' + G.carry.n, px + 18, py - 76, 16); }
  if (G.state !== 'play') return;
  if (G.hold) { const pr = G.hold.p; g.lineWidth = 7; g.strokeStyle = PAL.ink; g.beginPath(); g.arc(px, py - 80, 22, 0, 7); g.stroke(); g.strokeStyle = G.hold.it.sneaky ? '#c9a8ff' : PAL.yellow; g.beginPath(); g.arc(px, py - 80, 22, -Math.PI / 2, -Math.PI / 2 + pr * Math.PI * 2); g.stroke(); }
  else if (G.near) {
    const it = G.near; const lab = (it.hold ? 'Maintiens E · ' : 'E · ') + it.label; g.font = 'bold 18px ' + FONT;
    const w = g.measureText(lab).width + 28; rrect(g, px - w / 2, py - 112, w, 32, 8, it.sneaky ? '#3a2a55' : PAL.ui, it.sneaky ? '#c9a8ff' : PAL.yellow);
    T_(g, lab, px, py - 90, 18, '#fff', 'center', true, false);
  }
}
function drawHUD() {
  const g = ctx;
  // horloge / jour
  rrect(g, 16, 14, 250, 74, 10, 'rgba(29,27,34,.9)', PAL.uiLine);
  T_(g, G.night ? 'NUIT' : DAYNAMES[G.day - 1], 32, 44, 24, PAL.yellow);
  T_(g, G.night ? '22h' : fmtTime(G.time), 248, 44, 26, '#fff', 'right');
  T_(g, GRADES[G.day - 1], 32, 74, 16, '#cfc8d8', 'left', false);
  // réputation + soupçon
  rrect(g, W - 236, 14, 220, 74, 10, 'rgba(29,27,34,.9)', PAL.uiLine);
  drawIcon(g, 'star', W - 222, 24, 24); T_(g, '' + G.rep, W - 190, 44, 22, PAL.yellow);
  drawIcon(g, 'search', W - 112, 24, 22); T_(g, G.clues.length + '', W - 84, 44, 22, '#c9a8ff');
  drawIcon(g, 'eye', W - 222, 56, 22); g.fillStyle = '#3a3542'; g.fillRect(W - 190, 62, 158, 14); g.fillStyle = G.susp > 66 ? PAL.red : G.susp > 33 ? '#f08a3c' : '#8f87a0'; g.fillRect(W - 190, 62, 158 * G.susp / 100, 14);
  if (!G.night && G.warnings) T_(g, '⚠ ' + G.warnings + '/3', W - 236, 108, 16, '#ff7a6e');
  // liste des tâches
  const list = G.tasks.filter(t => !t.hidden || (typeof t.hidden === 'function' && !t.hidden()));
  let y = 106; const pp = player(); if (pp) { const [sx, sy] = toScreen(pp.x, pp.y); G.hudA = lerp(G.hudA || 1, sx < 360 && sy < 150 + list.length * 34 + 60 ? .3 : 1, .15); } g.globalAlpha = G.hudA || 1;
  rrect(g, 16, y - 8, 300, 20 + list.length * 34, 10, 'rgba(29,27,34,.82)', PAL.uiLine); const HA = g.globalAlpha;
  list.forEach(t => {
    const late = t.from && G.time < t.from;
    g.globalAlpha = HA * (t.done || t.failed ? .45 : late ? .6 : 1);
    rrect(g, 26, y + 2, 26, 26, 6, t.clue ? '#8a5cd6' : '#e9dfc8'); drawIcon(g, t.icon, 29, y + 5, 20);
    let lab = t.label + (t.count ? ' ' + (t.prog || 0) + '/' + t.count : ''); if (late) lab += ' · ' + fmtTime(t.from);
    T_(g, lab, 62, y + 22, 17, t.done ? '#9bd9a3' : t.failed ? '#ff7a6e' : t.clue ? '#dccbff' : '#fff', 'left', true, false);
    if (t.done) { g.strokeStyle = '#9bd9a3'; g.lineWidth = 2; g.beginPath(); g.moveTo(62, y + 16); g.lineTo(62 + g.measureText(lab).width, y + 16); g.stroke(); }
    g.globalAlpha = HA; y += 34;
  }); g.globalAlpha = 1;
  T_(g, 'TAB : carnet · Échap : pause', 16, H - 16, 14, 'rgba(255,255,255,.55)', 'left', false);
  // lieu
  const p = player(); if (p && G.state === 'play') { const r = roomAt(p.x, p.y); T_(g, r.name, W / 2, H - 18, 16, 'rgba(255,255,255,.7)', 'center'); }
}
function drawCard() {
  const c = G.cardShow, g = ctx, a = clamp(c.t * 3, 0, 1);
  g.fillStyle = 'rgba(12,10,18,' + (.9 * a) + ')'; g.fillRect(0, 0, W, H);
  g.globalAlpha = a; T_(g, c.title, W / 2, H / 2 - 6, 64, PAL.yellow, 'center'); if (c.sub) T_(g, c.sub, W / 2, H / 2 + 46, 26, '#fff', 'center', false); g.globalAlpha = 1;
}
function drawToasts() {
  G.toasts.forEach((t, i) => { const a = clamp(t.t * 2, 0, 1), y = 130 + i * 46; ctx.globalAlpha = a; ctx.font = 'bold 22px ' + FONT; const w = ctx.measureText(t.text).width + 40; rrect(ctx, W / 2 - w / 2, y - 28, w, 40, 10, 'rgba(20,18,26,.92)', t.col); T_(ctx, t.text, W / 2, y, 22, t.col, 'center', true, false); ctx.globalAlpha = 1; });
}
function clueFrame(g, id, x, y, w, h, sel) {
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 6, y + 6, w, h);
  g.fillStyle = sel ? PAL.yellow : '#3a3542'; g.fillRect(x - 4, y - 4, w + 8, h + 8); g.fillStyle = '#2a2633'; g.fillRect(x, y, w, h);
  drawClueArt(g, id, x, y, w, h - 34);
  const C = CLUES[id]; T_(g, C.t, x + w / 2, y + h - 12, 15, '#fff', 'center', true, false);
  g.fillStyle = PAL.red; g.beginPath(); g.arc(x + w / 2, y + 2, 6, 0, 7); g.fill();
}
function drawClueToast() {
  const c = G.clueCard, g = ctx, a = clamp(Math.min(c.t, 3.2 - c.t) * 4, 0, 1), y = lerp(H, H / 2 - 120, ease(a));
  g.globalAlpha = a; T_(g, 'INDICE !', W / 2, y - 20, 28, '#c9a8ff', 'center'); clueFrame(g, c.id, W / 2 - 90, y, 180, 210, true); g.globalAlpha = 1;
}
function drawBook() {
  const g = ctx; g.fillStyle = 'rgba(10,8,16,.85)'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#6d4a2b'; g.fillRect(60, 50, W - 120, H - 100); g.fillStyle = PAL.cork; g.fillRect(74, 64, W - 148, H - 128);
  for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(90,60,30,.18)'; g.fillRect((i * 97) % (W - 160) + 80, (i * 53) % (H - 140) + 70, 3, 3); }
  T_(g, 'CARNET D\'ENQUÊTE', W / 2, 108, 34, '#fff', 'center');
  if (!G.clues.length) { T_(g, 'Rien pour l\'instant…', W / 2, H / 2, 26, '#fff', 'center'); return; }
  const cw = 170, ch = 200, cols = 5;
  G.clues.forEach((id, i) => { const x = 120 + (i % cols) * (cw + 30), y = 140 + Math.floor(i / cols) * (ch + 24); if (y < H - 90) clueFrame(g, id, x, y, cw, ch, i === G.bookSel); });
  const C = CLUES[G.clues[G.bookSel || 0]]; if (C) { rrect(g, 120, H - 96, W - 240, 40, 8, 'rgba(20,18,26,.9)'); T_(g, C.s, W / 2, H - 69, 19, '#fff', 'center', false, false); }
}
function drawReport() {
  const g = ctx, a = clamp(G.reportT * 2, 0, 1); g.globalAlpha = a;
  g.fillStyle = 'rgba(10,8,16,.88)'; g.fillRect(0, 0, W, H);
  T_(g, 'BILAN DU ' + DAYNAMES[G.day - 1], W / 2, 150, 44, PAL.yellow, 'center');
  const st = G.dayStars, avg = st.length ? st.reduce((a, b) => a + b, 0) / st.length : 3;
  stars(g, Math.round(avg), W / 2 - 110, 230, 60);
  T_(g, 'Réputation : ' + G.rep, W / 2, 330, 28, '#fff', 'center');
  T_(g, 'Indices : ' + G.clues.length + ' / 14', W / 2, 372, 24, '#c9a8ff', 'center');
  if (G.day < 5 && !(DAYS[G.day].night && !G.nightDone)) T_(g, 'Demain : ' + GRADES[G.day], W / 2, 430, 28, PAL.green, 'center');
  if (DAYS[G.day].night && !G.nightDone) T_(g, '… mais la soirée n\'est pas finie.', W / 2, 430, 24, '#ff9a8e', 'center');
  if (G.reportT > 1) T_(g, 'E pour continuer', W / 2, 560, 20, 'rgba(255,255,255,' + (.5 + Math.sin(TT * 4) * .3) + ')', 'center');
  g.globalAlpha = 1;
}
function drawFired() {
  const g = ctx; g.fillStyle = 'rgba(60,8,8,.86)'; g.fillRect(0, 0, W, H);
  T_(g, G.caught ? 'REPÉRÉ !' : 'VIRÉ !', W / 2, H / 2 - 40, 90, '#fff', 'center');
  T_(g, G.firedReason || '', W / 2, H / 2 + 30, 28, '#ffd2cc', 'center', false);
  T_(g, 'E : réessayer', W / 2, H / 2 + 110, 22, '#fff', 'center');
}
function drawPause() {
  const g = ctx; g.fillStyle = 'rgba(10,8,16,.8)'; g.fillRect(0, 0, W, H);
  T_(g, 'PAUSE', W / 2, 230, 60, PAL.yellow, 'center');
  ['Reprendre', 'Son : ' + (Sound.muted ? 'coupé' : 'activé'), 'Menu principal'].forEach((s, i) => T_(g, (G.menu === i ? '▶ ' : '') + s, W / 2, 330 + i * 56, 30, G.menu === i ? '#fff' : '#9a93a8', 'center'));
  T_(g, 'ZQSD / flèches : bouger · E / Espace : agir · TAB : carnet · M : son', W / 2, H - 60, 18, '#cfc8d8', 'center', false);
}
// ---------- Titre ----------
function drawTitle() {
  const g = ctx; g.fillStyle = '#16131c'; g.fillRect(0, 0, W, H);
  // bureau en fond qui défile
  if (World.layer) { g.save(); g.globalAlpha = .35; g.scale(2, 2); g.drawImage(World.layer, -((TT * 12) % (MW * T - 640)), -180); g.restore(); }
  g.fillStyle = 'rgba(22,19,28,.55)'; g.fillRect(0, 0, W, H);
  T_(g, 'LE NOUVEAU', W / 2, 220, 110, PAL.yellow, 'center');
  T_(g, 'Premier jour. Premier cadavre.', W / 2, 272, 28, '#fff', 'center', false);
  drawPerson(g, 'player', W / 2 - 64, 290, 4, 4, Math.floor(TT * 6) % 4);
  const sv = loadSave(); const opts = sv ? ['Continuer (' + DAYNAMES[sv.day - 1].toLowerCase() + ')', 'Nouvelle partie', 'Crédits'] : ['Nouvelle partie', 'Crédits'];
  opts.forEach((s, i) => T_(g, (G.menu === i ? '▶ ' : '') + s, W / 2, 480 + i * 50, 30, G.menu === i ? '#fff' : '#8d86a0', 'center'));
  T_(g, 'ZQSD / flèches · E / Espace', W / 2, H - 40, 18, '#8d86a0', 'center', false);
  T_(g, 'PLUME PLAYLAB', W - 24, H - 20, 14, '#6d6680', 'right');
}
function drawEnd() {
  const g = ctx; g.fillStyle = '#16131c'; g.fillRect(0, 0, W, H);
  if (G.endKind !== 'credits') {
    const E = ENDINGS[G.endKind];
    T_(g, E.title, W / 2, 170, 64, E.col, 'center'); T_(g, E.sub, W / 2, 226, 26, '#fff', 'center', false);
    if (G.endKind !== 'vire') drawPerson(g, 'player', W / 2 - 64, 250, 4, 0, Math.floor(TT * 4) % 4);
    T_(g, 'Réputation finale : ' + G.rep + ' · Indices : ' + G.clues.length + ' / 14', W / 2, 440, 22, PAL.yellow, 'center');
    if (G.endKind === 'bonne') T_(g, 'Il manquait une preuve… sur le patron.', W / 2, 480, 20, '#c9a8ff', 'center', false);
  } else T_(g, 'LE NOUVEAU', W / 2, 180, 70, PAL.yellow, 'center');
  const cr = ['Un jeu PLUME PLAYLAB', 'Graphismes : « Office Pixel Art » by Imersa Studios', 'imersastudios.itch.io/office-pixel-art', 'Musique et sons : générés dans le jeu'];
  cr.forEach((s, i) => T_(g, s, W / 2, 540 + i * 30, 18, i === 0 ? '#fff' : '#a59eb5', 'center', i === 0));
  if (G.endT > 3 || G.endKind === 'credits') T_(g, 'E : menu', W / 2, H - 20, 16, '#8d86a0', 'center');
}
