// ===== Enrichissements : interrogatoires, choix, vie du bureau, lumière =====

// ---------- Indices bonus (obtenus en interrogeant) ----------
Object.assign(CLUES, {
  cafeAccueil: { t: 'Le café de Bernard', s: 'Gérard : Bernard prenait toujours son café… à l\'accueil.' },
  mmeB: { t: '« Mme B. »', s: 'Josiane : il n\'y a qu\'une seule « Mme B. » dans cette boîte.' },
  chariotB: { t: 'Le chariot prêté', s: 'Patrick : Mme Brochard ne prête jamais son chariot. Jamais.' },
  nerveuse: { t: 'Elle transpire', s: 'Mme Brochard a perdu ses moyens devant la tasse de Bernard.' },
  tuyauCode: { t: 'Tuyau de Kévin', s: 'Le code du coffre du patron finit comme le n° de la facture FANTÔME.' }
});
const CLUE_TOTAL = () => Object.keys(CLUES).length;
SLOTS[0].ok.push('cafeAccueil', 'chariotB', 'nerveuse');
SLOTS[2].ok.push('mmeB');
const CLUE_ART_EXTRA = {
  cafeAccueil: (g, w, h) => { drawClueArt(g, 'tasse', 0, 0, w, h); },
  mmeB: (g, w, h) => { drawClueArt(g, 'releve', 0, 0, w, h); g.strokeStyle = PAL.red; g.lineWidth = 4; g.beginPath(); g.ellipse(w / 2, h - 34, 44, 18, 0, 0, 7); g.stroke(); },
  chariotB: (g, w, h) => { drawClueArt(g, 'diable', 0, 0, w, h); },
  nerveuse: (g, w, h) => { const s = Math.min(w, h) / 40; g.save(); g.translate(w / 2 - 16 * s, 6); g.imageSmoothingEnabled = false; g.drawImage(IMG.char_brochard, 0, 0, 32, 32, 0, 0, 32 * s, 32 * s); g.fillStyle = '#7fd1ff'; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(26 * s + i * 4, 10 * s + i * 6, 2.5, 4, 0, 0, 7); g.fill(); } g.restore(); },
  tuyauCode: (g, w, h) => { drawClueArt(g, 'postit', 0, 0, w, h); g.fillStyle = '#2a3a8a'; g.font = 'bold 16px ' + FONT; g.textAlign = 'center'; g.fillText('…+ n° facture', w / 2, h - 18); g.textAlign = 'left'; }
};
const _drawClueArt = drawClueArt;
drawClueArt = function (g, id, x, y, w, h) { if (CLUE_ART_EXTRA[id]) { g.save(); g.translate(x, y); CLUE_ART_EXTRA[id](g, w, h); g.restore(); } else _drawClueArt(g, id, x, y, w, h); };

// ---------- Réactions aux indices ----------
const REACT = {
  gerard: { agenda: ['Squash. Et j\'ai gagné.'], facture: ['Pas mon rayon. Vois la compta.'], tasse: ['Il prenait son café à l\'accueil. Toujours.', 'cafeAccueil'], badges: ['ACCUEIL-01 ? C\'est Brochard.'], somni: ['Je dors comme un bébé, moi.'] },
  josiane: { facture: ['C\'est MOI qui l\'ai repérée.'], noteJ: ['Je l\'ai prévenu… et voilà.'], releve: ['« Mme B. »… Il n\'y en a qu\'une ici.', 'mmeB'], ragot: ['Patrick a la langue trop pendue.'] },
  kevin: { badges: ['ACCUEIL-01, c\'est le badge de l\'accueil.'], postit: ['47… le coffre du patron ! Le reste, c\'est le n° de facture.', 'tuyauCode'], facture: ['Le patron m\'a fait effacer des fichiers.'] },
  patrick: { ticket: ['Momo, le meilleur couscous du coin.'], ragot: ['J\'ai rien dit, moi.'], diable: ['Brochard ne prête JAMAIS son chariot.', 'chariotB'], traces: ['Faut un chariot pour bouger ces armoires.'] },
  brochard: { tasse: ['Je… je ne sais pas de quoi vous parlez.', 'nerveuse'], rouge: ['Toutes les femmes en portent !'], somni: ['Je dors très bien, merci.'], diable: ['Mon chariot ? Pour les colis !'], badges: ['On… on a pu me voler mon badge.'] },
  gribouille: { contrat: ['Range ça. TOUT DE SUITE.'], facture: ['Une simple erreur comptable.'], releve: ['Je ne vois pas le rapport.'] }
};
const SHRUG = { gerard: 'Et alors ?', josiane: 'Je ne vois pas.', kevin: 'Aucune idée, mec.', patrick: 'Connais pas.', brochard: 'Oh, je ne sais pas, mon petit.', gribouille: 'Synergie !' };

// ---------- Parler / montrer un indice ----------
function haltNPC(id) { const e = getEnt(id); if (!e) return; e.halt = true; e.path = null; e.moving = false; e.onArrive = null; }
function releaseNPC(id) { const e = getEnt(id); if (!e || !e.halt) return; e.halt = false; if (e.wander) e.wait = 3; else if (!e.lock) e.curS = -9; }
function closeTalk() { if (G.talk) releaseNPC(G.talk.id); G.talk = null; G.state = 'play'; }
function openTalk(id) { haltNPC(id); G.talk = { id, phase: 'menu', sel: 0, msg: null }; G.state = 'talk'; Sound.play('blip'); clearPressed(); const e = getEnt(id), p = player(); if (e && p) { e.dir = Math.abs(p.x - e.x) > Math.abs(p.y - e.y) ? (p.x > e.x ? 'right' : 'left') : (p.y > e.y ? 'down' : 'up'); } }
function talkAll() {
  const out = [];
  World.ents.forEach(e => {
    if (e.id === 'player' || e.hidden || e.guard || !LINES[e.id] || e.id === 'pigeon') return;
    const forMe = G.carry && G.carry.to && G.carry.to.includes(e.id);
    const choice = !forMe && pendingChoice(e.id);
    out.push({
      ent: e.id, r: 40, label: forMe ? 'Donner' : choice ? '« Faut qu\'on parle… »' : 'Parler', act: () => {
        if (forMe) {
          G.carry.to = G.carry.to.filter(x => x !== e.id); G.carry.n--; say(e.id, G.carry.icon === 'mail' ? 'Merci.' : pick(['Enfin !', 'Merci.', 'Pas trop tôt.'])); Sound.play('paper');
          const t = task(G.carry.task); if (t) t.prog = t.count - G.carry.n;
          if (G.carry.n <= 0) { const id = G.carry.task, st = G.carry.st || 3; G.carry = null; doneTask(id, st); }
        } else if (choice) choice();
        else openTalk(e.id);
      }
    });
  });
  return out;
}
function updateTalk(dt) {
  const T_ = G.talk; if (!T_) { G.state = 'play'; return; }
  if (T_.msg) { T_.msg.t += dt; if (T_.msg.t > .35 && hit('act')) { const f = T_.msg.after; T_.msg = null; if (f) f(); else { T_.phase = 'menu'; T_.sel = 0; } } return; }
  if (hit('esc') || hit('book')) { closeTalk(); return; }
  if (T_.phase === 'menu') {
    if (hit('up')) T_.sel = (T_.sel + 2) % 3; if (hit('down')) T_.sel = (T_.sel + 1) % 3;
    if (hit('act')) {
      if (T_.sel === 0) { T_.msg = { text: pick(LINES[T_.id]), t: 0 }; Sound.play('talk'); }
      else if (T_.sel === 1) { if (!G.clues.length) { T_.msg = { text: '(Tu n\'as encore aucun indice.)', t: 0, me: true }; } else { T_.phase = 'clue'; T_.sel = 0; } }
      else { closeTalk(); }
    }
  } else {
    const n = G.clues.length; if (hit('left')) T_.sel = (T_.sel + n - 1) % n; if (hit('right')) T_.sel = (T_.sel + 1) % n;
    if (hit('back')) { T_.phase = 'menu'; T_.sel = 1; return; }
    if (hit('act')) {
      const c = G.clues[T_.sel], r = (REACT[T_.id] || {})[c];
      Sound.play('talk');
      if (r) { T_.msg = { text: r[0], t: 0, after: () => { if (r[1] && !hasClue(r[1])) { giveClue(r[1]); G.rep += 15; closeTalk(); } else { T_.phase = 'menu'; T_.sel = 1; } } }; if (r[1] && !hasClue(r[1])) Cam.shake = 3; }
      else T_.msg = { text: SHRUG[T_.id] || '…', t: 0 };
    }
  }
}
function drawTalk() {
  const g = ctx, T_ = G.talk; if (!T_) return; const id = T_.id;
  const grd = g.createLinearGradient(0, H - 300, 0, H); grd.addColorStop(0, 'rgba(8,7,12,0)'); grd.addColorStop(.35, 'rgba(8,7,12,.9)'); grd.addColorStop(1, 'rgba(8,7,12,.97)'); g.fillStyle = grd; g.fillRect(0, H - 300, W, 300);
  // portrait
  rr(g, 60, H - 250, 170, 210, 10); g.fillStyle = '#26222e'; g.fill(); rr(g, 70, H - 240, 150, 150, 6); g.fillStyle = '#4f78c9'; g.fill();
  g.save(); rr(g, 70, H - 240, 150, 150, 6); g.clip(); drawPerson(g, id, 70 - 1, H - 246, 4.8, 0, Math.floor(TT * 3) % 4); g.restore();
  tx(g, CAST[id].name.toUpperCase(), 145, H - 64, { size: 15, align: 'center', ls: 1 }); tx(g, (CAST[id].job || '').toUpperCase(), 145, H - 46, { f: 'mono', size: 10, col: UI.mute, align: 'center', ls: 1.5 });
  const x0 = 270;
  if (T_.msg) {
    panelBox(g, x0, H - 230, W - x0 - 60, 110, { fill: T_.msg.me ? 'rgba(40,26,66,.95)' : UI.paper, line: 'rgba(0,0,0,.2)' });
    tx(g, (T_.msg.me ? '' : '« ') + T_.msg.text + (T_.msg.me ? '' : ' »'), x0 + 30, H - 166, { f: T_.msg.me ? 'ui' : 'type', size: 26, col: T_.msg.me ? UI.text : UI.ink });
    keycap(g, 'E', W - 110, H - 110, 34, 32);
  } else if (T_.phase === 'menu') {
    ['DISCUTER', 'MONTRER UN INDICE', 'PARTIR'].forEach((s, i) => { const y = H - 236 + i * 56, sel = T_.sel === i; rr(g, x0, y, 420, 46, 8); g.fillStyle = sel ? UI.acc : 'rgba(255,255,255,.06)'; g.fill(); tx(g, '0' + (i + 1), x0 + 18, y + 29, { f: 'mono', size: 12, col: sel ? UI.ink : UI.mute }); tx(g, s, x0 + 58, y + 31, { size: 20, col: sel ? UI.ink : UI.text, ls: 2 }); });
    tx(g, 'Montre-lui un indice : sa réaction peut tout changer.', x0 + 450, H - 205, { f: 'type', size: 18, col: '#cfc8d8' });
  } else {
    tx(g, 'QUEL INDICE LUI MONTRER ?', x0, H - 250, { f: 'mono', size: 12, col: UI.mute, ls: 3 });
    const cw = 112, ch = 136, per = Math.min(G.clues.length, 7), start = Math.max(0, Math.min(T_.sel - 3, G.clues.length - per));
    for (let k = 0; k < per; k++) { const i = start + k, cid = G.clues[i]; if (!cid) break; clueFrame(g, cid, x0 + k * (cw + 14), H - 220 - (i === T_.sel ? 8 : 0), cw, ch, i === T_.sel); }
    tx(g, '← → CHOISIR · E MONTRER · ⌫ RETOUR', x0, H - 40, { f: 'mono', size: 11, col: UI.mute, ls: 2 });
  }
}

// ---------- Choix ----------
function openChoice(id, text, opts) { haltNPC(id); G.choice = { id, text, opts, sel: 0, t: 0 }; G.state = 'choice'; Sound.play('blip'); clearPressed(); }
function updateChoice(dt) {
  const C = G.choice; C.t += dt;
  if (hit('left') || hit('up')) C.sel = 0; if (hit('right') || hit('down')) C.sel = 1;
  if (C.t > .4 && hit('act')) { const o = C.opts[C.sel]; releaseNPC(C.id); G.choice = null; G.state = 'play'; Sound.play('ok'); o.fn && o.fn(); }
}
function drawChoice() {
  const g = ctx, C = G.choice; if (!C) return;
  g.fillStyle = 'rgba(8,7,12,.72)'; g.fillRect(0, 0, W, H);
  tx(g, 'DÉCISION', W / 2, 160, { f: 'mono', size: 13, col: UI.acc, align: 'center', ls: 6 });
  rr(g, W / 2 - 80, 186, 160, 170, 10); g.fillStyle = '#4f78c9'; g.fill();
  g.save(); rr(g, W / 2 - 80, 186, 160, 170, 10); g.clip(); drawPerson(g, C.id, W / 2 - 80, 186, 5, 0, Math.floor(TT * 3) % 4); g.restore();
  tx(g, CAST[C.id].name.toUpperCase(), W / 2, 384, { size: 15, align: 'center', ls: 2 });
  tx(g, '« ' + C.text + ' »', W / 2, 436, { f: 'type', size: 26, align: 'center', col: '#f2ece0' });
  C.opts.forEach((o, i) => { const w = 330, x = W / 2 - w - 20 + i * (w + 40), y = 480, sel = C.sel === i; rr(g, x, y, w, 64, 10); g.fillStyle = sel ? UI.acc : 'rgba(255,255,255,.07)'; g.fill(); if (!sel) { g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 1.5; g.stroke(); } tx(g, o.label.toUpperCase(), x + w / 2, y + 40, { size: 20, col: sel ? UI.ink : UI.text, align: 'center', ls: 2 }); });
  tx(g, 'Ce choix aura des conséquences.', W / 2, 600, { f: 'type', size: 18, col: UI.mute, align: 'center' });
}
// choix en attente selon le jour
function pendingChoice(id) {
  const F = G.flags;
  if (G.day === 2 && id === 'patrick' && G.time >= hm(13, 45) && F.bribe == null) return () => openChoice('patrick', 'Mes notes de frais… t\'as rien vu. 200 €, ça te va ?', [
    { label: 'Prendre l\'argent', fn: () => { F.bribe = true; say('patrick', 'Entre nous, hein.'); toast('Patrick te doit une faveur…', '#ffb38a'); doneOpt('choixP'); } },
    { label: 'Refuser', fn: () => { F.bribe = false; G.rep += 10; say('patrick', 'Tant pis pour toi.'); doneOpt('choixP'); } }]);
  if (G.day === 3 && id === 'josiane' && G.time >= hm(15, 30) && F.coverJ == null) return () => openChoice('josiane', 'J\'ai copié un dossier confidentiel. Tu me couvres ?', [
    { label: 'La couvrir', fn: () => { F.coverJ = true; say('josiane', 'Merci. Je te revaudrai ça.'); toast('Josiane te fait confiance.', '#9bd9a3'); doneOpt('choixJ'); } },
    { label: 'La dénoncer', fn: () => { F.coverJ = false; G.rep += 25; say('josiane', 'Tu… tu n\'as pas fait ça.'); toast('Josiane sera virée demain. +25 réputation', '#ff8f84'); doneOpt('choixJ'); } }]);
  if (G.day === 4 && id === 'gribouille' && G.time >= hm(17) && F.deal == null) return () => openChoice('gribouille', 'Oublie l\'affaire Bernard. Et le poste de directeur adjoint est à toi.', [
    { label: 'Accepter le marché', fn: () => { F.deal = true; say('gribouille', 'Excellent choix, mon petit.'); doneOpt('choixG'); } },
    { label: 'Refuser', fn: () => { F.deal = false; say('gribouille', 'Dommage. Fais attention à toi.'); toast('Le patron se méfie : la nuit sera plus dure.', '#ff8f84'); doneOpt('choixG'); } }]);
  return null;
}
function doneOpt(id) { const t = task(id); if (t && !t.done) { t.done = true; t.stars = 3; Sound.play('ok'); checkAllDone(); } }

// ---------- Tâches et événements ajoutés aux journées ----------
function addDayExtras() {
  const D2 = DAYS[2], D3 = DAYS[3], D4 = DAYS[4], D5 = DAYS[5];
  D2.tasks.push({ id: 'choixP', icon: 'ear', label: 'Patrick veut te parler', req: false, from: hm(13, 45), target: () => { const e = getEnt('patrick'); return e && !e.hidden ? [e.x, e.y] : null; } });
  D3.tasks.push({ id: 'choixJ', icon: 'ear', label: 'Josiane veut te parler', req: false, from: hm(15, 30), target: () => { const e = getEnt('josiane'); return e && !e.hidden ? [e.x, e.y] : null; } });
  D4.tasks.push({ id: 'choixG', icon: 'door', label: 'Le patron te convoque', req: true, from: hm(17), target: () => { const e = getEnt('gribouille'); return e && !e.hidden ? [e.x, e.y] : null; } });
  // pigeon : mardi et vendredi
  [[D2, hm(11)], [D5, hm(10, 20)]].forEach(([D, at]) => {
    D.tasks.push({ id: 'pigeon', icon: 'star', label: 'Un pigeon ?!', req: false, from: at, target: () => { const e = getEnt('pigeon'); return e && !e.hidden ? [e.x, e.y] : null; } });
    (D.events = D.events || []).push({ at, fn: spawnPigeon });
  });
  // alarme incendie (mercredi) et coupure de courant (jeudi)
  (D3.events = D3.events || []).push({ at: hm(14), fn: () => { G.evac = hm(14, 40); Sound.play('alarm'); toast('ALERTE INCENDIE ! Tout le monde dehors…', '#ff8f84'); setTimeout(() => toast('…sauf toi ? Le bureau est vide.', '#c9a8ff'), 1600); World.ents.forEach(e => { if (DAYS[3].sched[e.id]) e.curS = -9; }); } });
  (D4.events = D4.events || []).push({ at: hm(15), fn: () => { G.blackout = hm(15, 30); Sound.play('jam'); toast('Coupure de courant !', '#ff8f84'); say(pick(['gerard', 'patrick', 'kevin']), 'Qui a éteint ?!'); } });
  // conséquences : Josiane virée si dénoncée
  [D4, D5].forEach(D => { const s = D.setup; D.setup = function () { s && s(); if (G.flags.coverJ === false) { const e = getEnt('josiane'); if (e) { e.hidden = true; e.lock = true; } } }; });
  // conséquence : refus du marché → vigile plus rapide
  const N4 = D4.night, ns = N4.setup; N4.setup = function () { ns && ns(); if (G.flags.deal === false) { const v = getEnt('vigile2'); if (v) v.speed = 38; } };
}
function spawnPigeon() {
  const e = entAtSpot('pigeon', 'hallM'); e.lock = true; e.pigeon = true; e.speed = 40; e.hp = 0; Sound.play('blip');
  toast('Un pigeon est entré dans le couloir !', PAL.yellow);
}
function updatePigeon(dt) {
  const e = getEnt('pigeon'); if (!e || e.hidden) return;
  e.pt = (e.pt || 0) - dt;
  if (e.pt <= 0 && (!e.path || !e.path.length)) { e.pt = rnd(1, 3); goTo(e, [rnd(2, 33), rnd(11.3, 12.7), 'down']); }
}
function pigeonInteract() {
  const e = getEnt('pigeon'); if (!e || e.hidden) return [];
  return [{ ent: 'pigeon', r: 34, label: 'Attraper le pigeon', hold: 1, act: () => { e.hidden = true; removeEnt('pigeon'); G.rep += 20; Sound.play('win'); toast('Pigeon évacué ! +20 réputation', PAL.yellow); doneOpt('pigeon'); } }];
}
// répliques d'ambiance
const OFFICE_LINES = ['Qui a pris mon yaourt ?!', 'Encore une réunion…', 'Le wifi !!', 'Vivement vendredi.', 'Quelqu\'un a vu mon agrafeuse ?', 'C\'est quoi ce bruit ?', 'J\'ai faim.', 'Pauvre Bernard…', 'On est quel jour ?', 'La photocopieuse… encore.'];
function ambientTick(dt) {
  G.ambT = (G.ambT == null ? rnd(15, 25) : G.ambT) - dt;
  if (G.ambT <= 0) {
    G.ambT = rnd(18, 34);
    const p = player(), cand = World.ents.filter(e => !e.guard && !e.hidden && LINES[e.id] && !e.bubble && Math.hypot(e.x - p.x, e.y - p.y) < 10 * T);
    if (cand.length) say(pick(cand).id, pick(OFFICE_LINES), 2.6);
    if (Math.random() < .3) Sound.play('ring');
  }
  // fumée de la photocopieuse de temps en temps
  if (Math.random() < dt * .02) G.smoke = 2.5;
  if (G.smoke) G.smoke = Math.max(0, G.smoke - dt);
}

// ---------- Lumière, fenêtres, déco ----------
function skyAt(m) { // couleur du ciel selon l'heure
  const k = [[540, [150, 200, 240]], [720, [120, 185, 245]], [960, [240, 170, 110]], [1080, [180, 100, 120]], [1200, [30, 30, 60]]];
  for (let i = 0; i < k.length - 1; i++) if (m <= k[i + 1][0]) { const t = clamp((m - k[i][0]) / (k[i + 1][0] - k[i][0]), 0, 1); return k[i][1].map((v, j) => Math.round(lerp(v, k[i + 1][1][j], t))); }
  return k[k.length - 1][1];
}
const WINDOWS = [[5.6, 1], [11.6, 1], [20.2, 1], [33.2, 1], [8.5, 14], [21.2, 14], [32.5, 14]];
function addDecor() {
  // affiches, extincteur, panneau sortie
  World.decals.push({ draw: drawLightPools }, { draw: drawWindows });
  [[18.2, 10, 'poster1'], [26.6, 10, 'poster2'], [3, 14, 'poster3'], [14.2, 14, 'poster1']].forEach(([x, y, k]) => World.decals.push({ draw(g) { drawPoster(g, k, x * T, y * T + 4); } }));
  World.decals.push({ draw(g) { drawExit(g, 5.5 * T, 13 * T + 26); drawExit(g, 17.5 * T, 13 * T + 26); } });
  World.decals.push({ draw(g) { [[10.5, 10], [23.3, 14], [2.2, 14]].forEach(([x, y]) => g.drawImage(SPR.extinguisher, x * T - 6, y * T + 4)); } });
}
function drawWindows(g) {
  const night = World.night || G.blackout, c = night ? [20, 22, 48] : skyAt(G.time || 540);
  WINDOWS.forEach(([x, y]) => {
    if (isWall(Math.floor(x), y + 1) || !isWall(Math.floor(x), y)) return;
    const X = x * T - 22, Y = y * T + 4, w = 44, h = 20;
    g.fillStyle = PAL.ink; g.fillRect(X - 2, Y - 2, w + 4, h + 4);
    const gr = g.createLinearGradient(0, Y, 0, Y + h); gr.addColorStop(0, `rgb(${c})`); gr.addColorStop(1, `rgb(${c.map(v => Math.min(255, v + 40))})`);
    g.fillStyle = gr; g.fillRect(X, Y, w, h);
    if (night) { g.fillStyle = '#fff'; [[6, 5], [30, 9], [18, 4]].forEach(([a, b]) => g.fillRect(X + a, Y + b, 1, 1)); }
    g.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 3; i < h; i += 4) g.fillRect(X, Y + i, w, 1);
    g.fillStyle = '#d9d6d2'; g.fillRect(X + w / 2 - 1, Y, 2, h); g.fillStyle = '#9e9a96'; g.fillRect(X - 2, Y + h + 1, w + 4, 2);
  });
}
function drawLightPools(g) { // halos de lumière au sol sous les fenêtres (jour)
  if (World.night || G.blackout || G.state === 'title') return;
  const m = G.time || 540, c = skyAt(m), a = m < 1020 ? .16 : .12;
  g.save(); g.globalCompositeOperation = 'lighter';
  WINDOWS.forEach(([x, y]) => {
    if (isWall(Math.floor(x), y + 1) || !isWall(Math.floor(x), y)) return;
    const X = x * T, Y = (y + 1) * T, sh = (m - 810) / 270 * 30; // l'ombre tourne avec l'heure
    const gr = g.createLinearGradient(0, Y, 0, Y + 90); gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(X - 22, Y); g.lineTo(X + 22, Y); g.lineTo(X + 34 + sh, Y + 90); g.lineTo(X - 34 + sh, Y + 90); g.closePath(); g.fill();
  });
  g.restore();
}
function drawPoster(g, k, x, y) {
  const w = 22, h = 26; g.fillStyle = PAL.ink; g.fillRect(x - 1, y - 1, w + 2, h + 2);
  if (k === 'poster1') { g.fillStyle = '#f5c84c'; g.fillRect(x, y, w, h); g.fillStyle = PAL.ink; g.fillRect(x + 3, y + 4, 16, 3); g.fillStyle = '#d8433b'; g.beginPath(); g.moveTo(x + 4, y + 21); g.lineTo(x + 10, y + 13); g.lineTo(x + 13, y + 16); g.lineTo(x + 18, y + 9); g.lineWidth = 2; g.strokeStyle = '#d8433b'; g.stroke(); }
  else if (k === 'poster2') { g.fillStyle = '#3d72c4'; g.fillRect(x, y, w, h); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 11, y + 11, 6, 0, 7); g.fill(); g.fillStyle = '#3d72c4'; g.beginPath(); g.arc(x + 11, y + 11, 3, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(x + 4, y + 20, 14, 2); }
  else { g.fillStyle = '#f4f4f0'; g.fillRect(x, y, w, h); g.fillStyle = '#5fb36a'; g.fillRect(x + 3, y + 3, 16, 10); g.fillStyle = '#999'; for (let i = 0; i < 3; i++) g.fillRect(x + 3, y + 16 + i * 3, 16 - i * 4, 1); }
}
function drawExit(g, x, y) { g.fillStyle = PAL.ink; g.fillRect(x - 13, y - 1, 26, 10); g.fillStyle = '#2fb36a'; g.fillRect(x - 12, y, 24, 8); g.fillStyle = '#fff'; g.fillRect(x - 8, y + 2, 3, 4); g.fillRect(x - 4, y + 3, 9, 2); g.fillRect(x + 4, y + 2, 2, 4); }
function buildExtraSprites() {
  SPR.extinguisher = mk(12, 26, g => { box(g, 2, 6, 8, 19, '#d8433b'); g.fillStyle = '#2b2a2c'; g.fillRect(4, 2, 4, 5); g.fillRect(8, 3, 3, 2); g.fillStyle = '#ff8f84'; g.fillRect(3, 8, 2, 12); g.fillStyle = '#f4f4f0'; g.fillRect(3, 14, 6, 4); });
}
function drawSmoke(g) { if (!G.smoke) return; const x = 16.5 * T, y = 5 * T; for (let i = 0; i < 6; i++) { const t = (TT * 1.3 + i / 6) % 1; g.fillStyle = `rgba(200,200,200,${(1 - t) * .5 * Math.min(1, G.smoke)})`; g.beginPath(); g.arc(x + Math.sin(i * 2 + TT) * 6, y - t * 34, 4 + t * 7, 0, 7); g.fill(); } }
// teinte selon l'heure + effets d'écran
function drawTimeTint() {
  if (World.night || G.state === 'title') return;
  const m = G.time || 540; let c = null;
  if (m < 630) c = [120, 160, 255, .07 * (1 - (m - 540) / 90)];
  else if (m > 930) c = [255, 140, 60, Math.min(.16, (m - 930) / 150 * .16)];
  if (c) { ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`; ctx.fillRect(0, 0, W, H); }
  if (G.blackout) { ctx.fillStyle = 'rgba(6,8,22,.78)'; ctx.fillRect(0, 0, W, H); const p = player(); if (p) { const [sx, sy] = toScreen(p.x, p.y - 14); const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, 150); gr.addColorStop(0, 'rgba(255,240,200,.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); } }
  if (G.evac && Math.sin(TT * 8) > .4) { ctx.fillStyle = 'rgba(224,68,58,.09)'; ctx.fillRect(0, 0, W, H); }
}
function drawScreenFX() {
  if (G.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${G.flash})`; ctx.fillRect(0, 0, W, H); G.flash = Math.max(0, G.flash - .04); }
  const s = G.state === 'play' ? G.susp / 100 : 0, r = Math.max(s > .5 ? (s - .5) * 1.2 * (.7 + Math.sin(TT * 6) * .3) : 0, G.redPulse || 0);
  if (r > .01) { const gr = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .9); gr.addColorStop(0, 'rgba(224,68,58,0)'); gr.addColorStop(1, `rgba(224,68,58,${clamp(r, 0, .55)})`); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  if (G.redPulse) G.redPulse = Math.max(0, G.redPulse - .015);
}

// ---------- Branchements ----------
(function hook() {
  // flash à chaque indice, tremblement quand on est repéré
  const gc = giveClue; giveClue = function (id) { const had = hasClue(id); gc(id); if (!had) { G.flash = .45; } };
  const bu = busted; busted = function () { bu(); Cam.shake = 5; G.redPulse = .45; };
  // plannings : évacuation
  const ap = applySchedules; applySchedules = function (instant) {
    if (G.evac && G.time >= G.evac) { G.evac = 0; World.ents.forEach(e => { if (DAYS[G.day].sched[e.id]) e.curS = -9; }); toast('Fin de l\'alerte. Retour au bureau.', PAL.green); }
    if (G.blackout && G.time >= G.blackout) { G.blackout = 0; toast('Le courant revient.', PAL.green); }
    if (G.evac && !G.night) { World.ents.forEach(e => { if (!DAYS[G.day].sched[e.id] || e.lock) return; if (e.curS !== 'evac') { e.curS = 'evac'; if (!e.hidden) goTo(e, 'exit', en => en.hidden = true); } }); return; }
    ap(instant);
  };
  // vision réduite pendant la coupure
  const cs = canSee; canSee = function (e, tx, ty, range, half) { if (G.blackout && !e.guard) range = Math.min(range || 5.5 * T, 1.8 * T); return cs(e, tx, ty, range, half); };
  // nouvelles journées : décor + tâches
  const sd = startDay; startDay = function (d, skip) { G.evac = 0; G.blackout = 0; G.smoke = 0; DAYS[d].events && DAYS[d].events.forEach(ev => ev.fired = false); sd(d, skip); addDecor(); };
  const sn = startNight; startNight = function () { sn(); addDecor(); };
  // interactions supplémentaires (pigeon)
  [1, 2, 3, 4, 5].forEach(d => { const f = DAYS[d].interacts; DAYS[d].interacts = function () { return f.call(this).concat(pigeonInteract()); }; });
  // boucle : talk / choice + ambiance
  const up = update; update = function (dt) {
    if (G.state === 'talk') { G.toasts.forEach(t => t.t -= dt); G.toasts = G.toasts.filter(t => t.t > 0); updateWorldAmbient(dt); return updateTalk(dt); }
    if (G.state === 'choice') { updateWorldAmbient(dt); return updateChoice(dt); }
    up(dt);
    if (G.state === 'play' && !G.night) { ambientTick(dt); updatePigeon(dt); }
  };
  addDayExtras();
})();

// ---------- Nouveaux collègues ----------
IMG_LIST.push('char_sophie', 'char_lucas', 'char_mo', 'char_nadia', 'char_yves');
Object.assign(CAST, {
  sophie: { name: 'Sophie', job: 'Ressources humaines', img: 'char_sophie' }, lucas: { name: 'Lucas', job: 'Stagiaire', img: 'char_lucas' },
  mo: { name: 'Mo', job: 'Livreur', img: 'char_mo' }, nadia: { name: 'Nadia', job: 'Entretien', img: 'char_nadia' }, yves: { name: 'Yves', job: 'Consultant', img: 'char_yves' }
});
Object.assign(SPOTS, {
  sophieDesk: [7, 7.08, 'up'], accSign: [8.6, 19.8, 'left'], hallW2: [7, 11.7, 'right'], hallE3: [27.5, 11.7, 'left'],
  mop1: [15, 17.3, 'right'], mop2: [21, 19.6, 'left'], openMid: [12.5, 8.3, 'down'], copierQ: [15.4, 6.8, 'right']
});
Object.assign(LINES, {
  sophie: ['Les RH sont là pour toi. Enfin… en théorie.', 'Ton contrat ? On verra vendredi.', 'Bernard ? Dossier clos.'],
  lucas: ['Je suis stagiaire depuis 3 ans.', 'Tu veux un café ? Moi aussi.', 'J\'ai rien vu, rien entendu !'],
  mo: ['Signature, s\'il vous plaît.', 'Un colis pour… FANTÔME SARL ?', 'Je repasse demain.'],
  nadia: ['Attention, ça glisse.', 'Je vois tout, moi. Personne ne me voit.', 'La réserve était ouverte lundi soir.'],
  yves: ['Disruptons le paradigme.', 'Je facture à l\'heure, donc… parlons lentement.', 'Excellente question. Prochaine.']
});
Object.assign(SHRUG, { sophie: 'Je transmettrai.', lucas: 'Euh… c\'est grave ?', mo: 'Moi je livre, c\'est tout.', nadia: 'Je nettoie, je ne juge pas.', yves: 'Fascinant. 300 € la réponse.' });
Object.assign(REACT, {
  nadia: { traces: ['Ces traces ? Lundi soir, 19h. Pas moi.'], diable: ['Je l\'ai rangé mardi à 7h. Il était plein de poussière.'], tasse: ['Je l\'ai vue lundi sur le bureau de l\'accueil.', 'cafeAccueil'] },
  mo: { facture: ['FANTÔME SARL ? Je livre jamais rien là-bas. Adresse bidon.'] },
  lucas: { somni: ['C\'est pas à moi ! …Mme Brochard en a dans son sac.'] },
  sophie: { releve: ['Les comptes ? Voyez Josiane. Ou plutôt… non.'], contrat: ['Je n\'ai rien vu. Je tiens à mon poste.'] }
});
const EXTRA_NPC = {
  sophie: { route: [['sophieDesk', 40], ['meetDoor', 4], ['pauseL', 10], ['sophieDesk', 50], ['accSign', 6]] },
  lucas: { route: [['copierQ', 6], ['hallM', 2], ['accFront', 5], ['hallW2', 2], ['coffee', 6], ['openMid', 4]], speed: 96 },
  mo: { route: [['accSign', 14], ['hallW2', 3], ['hallE3', 4], ['accSign', 20]], from: 1 },
  nadia: { route: [['hallE', 6], ['hallMid2', 5], ['hallM', 5], ['mop1', 8], ['mop2', 8], ['hallW', 6]], speed: 40 },
  yves: { route: [['pauseB2', 30], ['coffee', 6], ['pauseR', 18], ['meetR', 25]] }
};
function spawnExtras() {
  for (const id in EXTRA_NPC) {
    const d = EXTRA_NPC[id]; if (G.day < (d.from || 1)) continue;
    const e = entAtSpot(id, d.route[0][0]); e.route = d.route; e.ri = 0; e.wait = d.route[0][1] * rnd(.3, 1); e.speed = d.speed || 64; e.wander = true;
  }
}
function updateWanderer(e, dt) {
  if (e.hidden || e.lock || e.halt || (e.path && e.path.length)) return;
  if (e.wait > 0) { e.wait -= dt; return; }
  e.ri = (e.ri + 1) % e.route.length; const [s, w] = e.route[e.ri]; e.wait = w * rnd(1.6, 2.6); goTo(e, s);
}
(function hookNPC() {
  const sd = startDay; startDay = function (d, skip) { sd(d, skip); spawnExtras(); };
  const up = update; update = function (dt) {
    up(dt);
    if (!G.night && ['play', 'cut', 'talk', 'choice'].includes(G.state)) World.ents.forEach(e => {
      if (!e.wander) return;
      if (G.evac) { if (!e.hidden && e.curS !== 'evac') { e.curS = 'evac'; goTo(e, 'exit', en => en.hidden = true); } return; }
      if (e.curS === 'evac') { e.curS = null; e.hidden = false; const s = SPOTS.entry; e.x = s[0] * T; e.y = s[1] * T; e.path = null; e.wait = 0; }
      updateWanderer(e, dt);
    });
  };
  // nuit du mercredi : Nadia fait le ménage (troisième paire d'yeux)
  const N3 = DAYS[3].night; N3.guards.push({ id: 'nadia', route: ['mop1', 'mop2', 'hallM', 'hallW2', 'hallM'], speed: 36, vrange: 3 });
  N3.intro = [{ card: ['MERCREDI SOIR', 'Le relevé de FANTÔME est dans l\'armoire de la compta.'] }, { card: ['ATTENTION', 'Deux vigiles… et Nadia qui fait le ménage'], dur: 2.4 }];
})();

// ---------- Marché du patron : la fin du silence ----------
ENDINGS.silence = { title: 'LE SILENCE EST D\'OR', sub: 'Tu passes directeur adjoint. L\'assassin court toujours.', col: '#b9b2c6' };
(function hookDeal() {
  const sa = startAccuse; startAccuse = function () {
    if (G.flags.deal === true && !G.flags.dealAsked) {
      openChoice('gribouille', 'On avait un marché, mon petit. Tu t\'en souviens ?', [
        { label: 'Me taire', fn: () => { G.flags.dealAsked = true; G.state = 'end'; G.endKind = 'silence'; G.endT = 0; Sound.play('lose'); try { localStorage.removeItem('lenouveau_save'); } catch (e) { } } },
        { label: 'Parler quand même', fn: () => { G.flags.dealAsked = true; startAccuse(); } }]);
      return;
    }
    sa();
  };
})();
(function hookMisc() {
  // dessin du pigeon
  const dc = drawChar; drawChar = function (g, e) {
    if (!e.pigeon) return dc(g, e);
    if (e.hidden) return; const x = Math.round(e.x), y = Math.round(e.y), f = e.moving ? Math.floor(TT * 10) % 2 : 0, s = e.dir === 'left' ? -1 : 1;
    g.save(); g.translate(x, y); g.scale(s, 1);
    g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 0, 6, 2, 0, 0, 7); g.fill();
    g.fillStyle = '#2b2a2c'; g.fillRect(-6, -10, 12, 8); g.fillRect(2, -15, 6, 7);
    g.fillStyle = '#8d93a3'; g.fillRect(-5, -9, 10, 6); g.fillStyle = '#a9aebb'; g.fillRect(3, -14, 4, 5);
    g.fillStyle = '#5b8f7a'; g.fillRect(3, -10, 4, 2); g.fillStyle = '#f2a13b'; g.fillRect(7, -12, 3, 2); g.fillStyle = '#000'; g.fillRect(5, -13, 1, 1);
    g.fillStyle = '#d8433b'; g.fillRect(-2, -2, 1, 2 + f); g.fillRect(1, -2, 1, 3 - f);
    g.restore();
  };
  // Josiane virée : elle ne revient plus
  const gone = () => G.flags.coverJ === false && G.day >= 4 && !G.night;
  const es = entAtSpot; entAtSpot = function (id, spot) { const e = es(id, spot); if (id === 'josiane' && gone()) { e.hidden = true; e.lock = true; } return e; };
  const ap = applySchedules; applySchedules = function (i) { ap(i); if (gone()) { const j = getEnt('josiane'); if (j) { j.hidden = true; j.lock = true; } } };
})();

// ---------- S'asseoir à son bureau ----------
function sitInteract() {
  if (G.night || G.sitting) return [];
  return [{ x: 3 * T, y: 8.3 * T, r: 28, label: 'S\'asseoir', act: () => {
    G.sitting = true; const p = player(); p.x = 3 * T; p.y = 7.08 * T; p.dir = 'up'; p.moving = false; Sound.play('click');
    if (!G.flags.tipSit) { G.flags.tipSit = true; toast('Assis : le temps passe plus vite. Bouge pour te lever.', PAL.yellow); }
  } }];
}
(function hookSit() {
  [1, 2, 3, 4, 5].forEach(d => { const f = DAYS[d].interacts; DAYS[d].interacts = function () { return f.call(this).concat(sitInteract()); }; });
  const up = update; update = function (dt) {
    if (G.sitting && (G.state !== 'play' && G.state !== 'mini' && G.state !== 'talk' && G.state !== 'choice' && G.state !== 'book' && G.state !== 'pause')) G.sitting = false;
    if (G.sitting && G.state === 'play' && (keys.left || keys.right || keys.up || keys.down)) { G.sitting = false; const p = player(); p.y = 8.3 * T; }
    up(dt);
  };
  const sd = startDay; startDay = function (d, s) { G.sitting = false; sd(d, s); };
  const sn = startNight; startNight = function () { G.sitting = false; sn(); };
})();

// ---------- Ragots : écoute automatique en s'approchant ----------
(function hookRagot() {
  const D1 = DAYS[1], f = D1.interacts;
  D1.interacts = function () { return f.call(this).filter(i => i.label !== 'Écouter en douce'); };
  const rt = D1.tasks.find(t => t.id === 'ragot'); rt.label = 'Ragots à la fontaine';
  rt.target = () => chatting('josiane', 'patrick') ? P(19.5, 16.6) : null;
  (D1.events = D1.events || []).push(...[hm(10, 52), hm(13, 55), hm(16, 20)].map(at => ({ at, fn: () => { if (!task('ragot').done) toast('Josiane et Patrick papotent à la fontaine (salle de pause)…', '#c9a8ff'); } })));
  const up = update; update = function (dt) {
    up(dt);
    if (G.state !== 'play' || G.night || G.day !== 1) { G.listen = 0; return; }
    const t = task('ragot'); if (!t || t.done) return;
    const p = player(), near = chatting('josiane', 'patrick') && Math.hypot(p.x - 19.5 * T, p.y - 16.6 * T) < 2.8 * T;
    if (near) { if (!G.listen) toast('Tu tends l\'oreille… reste près d\'eux', '#c9a8ff'); G.listen = (G.listen || 0) + dt; if (G.listen >= 5) { G.listen = 0; giveClue('ragot'); doneTask('ragot'); } }
    else G.listen = 0;
  };
  // jauge d'écoute au-dessus du joueur
  const dw = drawWorldUI; drawWorldUI = function (markers) {
    dw(markers);
    if (markers || !G.listen || G.state !== 'play') return;
    const p = player(), [px, py] = toScreen(p.x, p.y), g = ctx;
    g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.arc(px, py - 84, 22, 0, 7); g.stroke();
    g.strokeStyle = UI.vio; g.lineCap = 'round'; g.beginPath(); g.arc(px, py - 84, 22, -Math.PI / 2, -Math.PI / 2 + G.listen / 5 * Math.PI * 2); g.stroke(); g.lineCap = 'butt';
    drawIcon(g, 'ear', px - 10, py - 94, 20);
  };
})();

// un PNJ à qui l'on parle ne bouge plus
(function hookHalt() { const un = updateNPC; updateNPC = function (e, dt) { if (e.halt) { e.moving = false; if (e.bubbleT > 0) { e.bubbleT -= dt; if (e.bubbleT <= 0) e.bubble = null; } return; } un(e, dt); }; })();
