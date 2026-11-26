// ===== Moteur de jeu : états, HUD, interactions, scènes =====
const FONT = "'Space Grotesk','Trebuchet MS',sans-serif";
const G = { state: 'title', day: 1, rep: 0, clues: [], flags: {}, tasks: [], time: 540, night: false, susp: 0, carry: null, hold: null, toasts: [], clueCard: null, mg: null, cut: null, sel: 0, warnings: 0, dayStars: [], fade: 0, fadeTarget: 0, speedUp: false, menu: 0 };
const GRADES = ['Stagiaire', 'Assistant', 'Chargé de mission', 'Chef d\'équipe', 'Directeur adjoint'];
const DAYNAMES = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];
const fmtTime = m => String(Math.floor(m / 60)).padStart(2, '0') + 'h' + String(Math.floor(m % 60)).padStart(2, '0');
const hm = (h, m = 0) => h * 60 + m;

// ---------- Sauvegarde ----------
function save() { try { localStorage.setItem('lenouveau_save', JSON.stringify({ day: G.day, rep: G.rep, clues: G.clues, flags: G.flags })); } catch (e) { } }
function loadSave() { try { return JSON.parse(localStorage.getItem('lenouveau_save')); } catch (e) { return null; } }

// ---------- API pour l'histoire ----------
function player() { return getEnt('player'); }
function say(id, text, dur) { const e = getEnt(id); if (!e) return; e.bubble = text; e.bubbleT = dur || (1.2 + text.length * .06); if (id !== 'player') Sound.play('talk'); }
function toast(text, col) { G.toasts.push({ text, t: 3, col: col || '#fff' }); }
function giveClue(id) { if (G.clues.includes(id)) return; G.clues.push(id); if (G.clueCard) { (G.clueQ = G.clueQ || []).push(id); return; } G.clueCard = { id, t: 3.2 }; Sound.play('clue'); }
function hasClue(id) { return G.clues.includes(id); }
function task(id) { return G.tasks.find(t => t.id === id); }
function doneTask(id, st = 3) { const t = task(id); if (!t || t.done) return; t.done = true; t.stars = st; G.rep += st * 10 + (t.clue ? 15 : 0); if (!t.clue) G.dayStars.push(st); Sound.play('ok'); toast((t.clue ? '🔎 ' : '✔ ') + t.label, t.clue ? '#c9a8ff' : PAL.yellow); checkAllDone(); }
function checkAllDone() {
  if (!G.night && G.tasks.filter(t => t.req && !t.done).length === 0 && !G.flags['alldone' + G.day]) { G.flags['alldone' + G.day] = true; toast('Journée bouclée ! Sors par l\'accueil.', PAL.green); }
  if (G.night && G.tasks.filter(t => t.req && !t.done).length === 0 && !G.flags['nightdone' + G.day]) { G.flags['nightdone' + G.day] = true; toast('C\'est bon. Sors par l\'accueil.', PAL.green); }
}
function startMG(kind, params, onWin, opt = {}) {
  if (opt.sneaky && seenBySomeone()) { busted(); return; }
  G.mg = MINIGAMES[kind](params); G.mg.onWin = onWin; G.mg.onLose = opt.onLose; G.mg.retry = opt.retry !== false; G.mg.kind = kind; G.mg.params = params; G.mg.opt = opt;
  G.state = 'mini'; clearPressed(); Sound.play('blip');
}
function seenBySomeone(range, half) { const p = player(); let s = null; World.ents.forEach(e => { if (e.id !== 'player' && !e.hidden && canSee(e, p.x, p.y, range, half)) s = e; }); return s; }
function busted() { const e = seenBySomeone(); if (e) { e.bubble = '?!'; e.bubbleT = 1.2; } G.susp = Math.min(100, G.susp + 34); Sound.play('spotted'); toast('On te regarde !', '#ff7a6e'); }
function runCut(steps, onEnd) { G.cut = { steps: steps.slice(), i: -1, t: 0, onEnd, wait: null }; G.state = 'cut'; nextCutStep(); }
function setCarry(c) { G.carry = c; }

// ---------- Début d'une journée ----------
function startDay(d, skipIntro) {
  G.day = d; G.night = false; World.night = false; G.fadeTarget = 0; G.caught = false; G.cut = null; G.camTarget = null; G.time = 540; G.susp = 0; G.carry = null; G.hold = null; G.warnings = 0; G.dayStars = []; G.speedUp = false;
  G.snap = JSON.stringify({ rep: G.rep, clues: G.clues, flags: G.flags });
  buildMap(); World.ents = []; World.decals = []; World.showTipped = false;
  const D = DAYS[d];
  G.tasks = D.tasks.map(t => Object.assign({ done: false, stars: 0 }, t));
  entAtSpot('player', 'entry');
  for (const id in D.sched) { const e = addEnt(id); e.hidden = true; e.curS = -1; }
  D.setup && D.setup();
  applySchedules(true);
  Sound.music('day');
  if (!skipIntro && D.intro) runCut(D.intro, () => { G.state = 'play'; }); else G.state = 'play';
}
function restartDay() { const s = JSON.parse(G.snap); G.rep = s.rep; G.clues = s.clues; G.flags = s.flags; startDay(G.day, true); }
function startNight() {
  const N = DAYS[G.day].night; G.night = true; World.night = true; G.susp = 0; G.fadeTarget = 0; G.caught = false; G.camTarget = null; G.carry = null; G.hold = null;
  G.nsnap = JSON.stringify({ clues: G.clues, flags: G.flags, rep: G.rep });
  buildMap(); World.ents = []; World.decals = [];
  G.tasks = N.tasks.map(t => Object.assign({ done: false, stars: 0 }, t));
  entAtSpot('player', N.start || 'player');
  N.guards.forEach(gd => { const e = entAtSpot(gd.id, gd.route[0]); e.route = gd.route; e.ri = 0; e.speed = gd.speed || 46; e.wait = 0; e.guard = true; e.vrange = gd.vrange; });
  DAYS[G.day].setupWorld && DAYS[G.day].setupWorld();
  N.setup && N.setup();
  Sound.music('night');
  runCut(N.intro || [{ card: ['HEURES SUP\'', 'Ne te fais pas voir par le vigile'] }], () => G.state = 'play');
}
function restartNight() { const s = JSON.parse(G.nsnap); G.clues = s.clues; G.flags = s.flags; G.rep = s.rep; startNight(); G.cut = null; G.state = 'play'; }
function endDay() {
  G.state = 'report'; G.reportT = 0; Sound.play('win');
}
function afterReport() {
  const D = DAYS[G.day];
  if (D.night && !G.nightDone) { G.nightDone = true; startNight(); return; }
  G.nightDone = false;
  if (D.outro) runCut(D.outro, nextDay); else nextDay();
}
function finishNight() {
  const N = DAYS[G.day].night; G.night = false; World.night = false; G.nightDone = true;
  const go = () => { const D = DAYS[G.day]; if (D.outro) runCut(D.outro, nextDay); else nextDay(); };
  if (N.outro) runCut(N.outro, go); else go();
}
function nextDay() { G.nightDone = false; if (G.day < 5) { G.day++; save(); startDay(G.day); } }
function fired(reason) { G.state = 'fired'; G.firedReason = reason; G.caught = false; G.hold = null; Sound.play('lose'); }

// ---------- Plannings des PNJ ----------
function applySchedules(instant) {
  const D = DAYS[G.day]; if (G.night) return;
  for (const id in D.sched) {
    const e = getEnt(id); if (!e || e.lock) continue;
    const L = D.sched[id]; let k = -1; L.forEach((s, i) => { if (s[0] <= G.time) k = i; });
    if (k === e.curS) continue; e.curS = k;
    const spot = k >= 0 ? L[k][1] : 'away';
    if (spot === 'away') {
      if (instant || e.hidden) { e.hidden = true; e.path = null; }
      else goTo(e, 'exit', en => { en.hidden = true; });
    } else {
      if (instant) { const s = SPOTS[spot]; e.x = s[0] * T; e.y = s[1] * T; e.dir = s[2]; e.hidden = false; e.path = null; e.spot = spot; }
      else { if (e.hidden) { const s = SPOTS.entry; e.x = s[0] * T; e.y = s[1] * T; e.hidden = false; } goTo(e, spot); }
    }
  }
}
// regards qui bougent (pour l'infiltration)
function updateGaze(e, dt) {
  if (e.guard || e.moving || e.hidden) { e.lookAng = null; return; }
  if ((e.spot || '').startsWith('cooler')) { e.lookOff = 0; e.lookAng = DIRANG[e.dir]; return; }
  e.gazeT = (e.gazeT || rnd(2, 5)) - dt;
  if (e.gazeT <= 0) { e.gazeT = rnd(2.5, 6); e.lookOff = Math.random() < .55 ? 0 : rnd(-.9, .9); }
  e.lookAng = DIRANG[e.dir] + (e.lookOff || 0);
}
function updateGuard(e, dt) {
  if (e.path && e.path.length) return;
  if (e.wait > 0) { e.wait -= dt; e.lookAng = DIRANG[e.dir] + Math.sin(e.wait * 2) * .7; return; }
  e.lookAng = null; e.ri = (e.ri + 1) % e.route.length; e.wait = rnd(.6, 1.6); goTo(e, e.route[e.ri]);
}

// ---------- Interactions ----------
function nearestInteract() {
  const p = player(); if (!p) return null; let best = null, bd = 1e9;
  for (const it of G.interacts) {
    if (it.when && !it.when()) continue;
    let x = it.x, y = it.y; if (it.ent) { const e = getEnt(it.ent); if (!e || e.hidden) continue; x = e.x; y = e.y - 6; }
    const d = Math.hypot(p.x - x, p.y - y); if (d < (it.r || 36) && d < bd) { bd = d; best = it; }
  }
  return best;
}
function tryInteract(it) {
  if (it.hold) { G.hold = { it, p: 0 }; return; }
  it.act && it.act();
}

// ---------- Mise à jour ----------
let last = performance.now(), TT = 0;
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; TT += dt;
  try { update(dt); draw(); } catch (e) { console.error(e); }
  clearPressed(); requestAnimationFrame(loop);
}
function update(dt) {
  if (hit('mute')) { const m = Sound.toggle(); toast(m ? 'Son coupé' : 'Son activé'); }
  G.toasts.forEach(t => t.t -= dt); G.toasts = G.toasts.filter(t => t.t > 0);
  if (G.clueCard) { G.clueCard.t -= dt; if (G.clueCard.t <= 0) { G.clueCard = null; if (G.clueQ && G.clueQ.length) { G.clueCard = { id: G.clueQ.shift(), t: 3.2 }; Sound.play('clue'); } } }
  if (Cam.shake) Cam.shake = Math.max(0, Cam.shake - dt * 10);
  switch (G.state) {
    case 'title': return updateTitle(dt);
    case 'play': return updatePlay(dt);
    case 'mini': return updateMini(dt);
    case 'cut': updateWorldAmbient(dt); return updateCut(dt);
    case 'book': if (hit('book') || hit('esc') || hit('act')) { G.state = G.bookReturn || 'play'; G.bookReturn = null; } if (hit('left')) G.bookSel = Math.max(0, (G.bookSel || 0) - 1); if (hit('right')) G.bookSel = Math.min(G.clues.length - 1, (G.bookSel || 0) + 1); if (hit('up')) G.bookSel = Math.max(0, (G.bookSel || 0) - 5); if (hit('down')) G.bookSel = Math.min(G.clues.length - 1, (G.bookSel || 0) + 5); return;
    case 'report': G.reportT += dt; if (G.reportT > 1 && hit('act')) afterReport(); return;
    case 'fired': if (hit('act')) { if (G.night) restartNight(); else if (G.accuse) startAccuse(); else restartDay(); } return;
    case 'pause': return updatePause();
    case 'accuse': return updateAccuse(dt);
    case 'end': G.endT += dt; if (G.endT > 3 && hit('act')) { G.state = 'title'; G.menu = 0; } return;
  }
}
function updateWorldAmbient(dt) { World.ents.forEach(e => { if (e.id !== 'player') updateNPC(e, dt); else { e.anim += dt; if (e.bubbleT > 0) { e.bubbleT -= dt; if (e.bubbleT <= 0) e.bubble = null; } } }); camFollow(dt); }
function camFollow(dt, inst) {
  let tx, ty; if (G.camTarget) { tx = G.camTarget[0]; ty = G.camTarget[1]; } else { const p = player(); if (!p) return; tx = p.x; ty = p.y - 16; }
  const vw = W / WS, vh = H / WS;
  tx = clamp(tx - vw / 2, -40, MW * T - vw + 40); ty = clamp(ty - vh / 2, -40, MH * T - vh + 40);
  const k = inst ? 1 : 1 - Math.pow(.002, dt); Cam.x += (tx - Cam.x) * k; Cam.y += (ty - Cam.y) * k;
}
function updatePlay(dt) {
  const p = player(), D = DAYS[G.day];
  if (hit('esc')) { G.state = 'pause'; G.menu = 0; return; }
  if (hit('book')) { G.state = 'book'; G.bookSel = 0; return; }
  if (hit('tasks')) { G.tasksMin = !G.tasksMin; Sound.play('blip'); }
  // temps
  if (!G.night) {
    const allDone = G.tasks.filter(t => t.req && !t.done).length === 0;
    G.time += dt * (allDone ? 4 : 1) * (G.sitting ? 5 : 1);
    (D.events || []).forEach(ev => { if (!ev.fired && G.time >= ev.at) { ev.fired = true; ev.fn(); } });
    G.tasks.forEach(t => { if (t.until && !t.done && !t.failed && G.time > t.until) { t.failed = true; G.warnings++; Sound.play('alarm'); toast('Raté : ' + t.label + ' — avertissement ' + G.warnings + '/3', '#ff7a6e'); if (G.warnings >= 3) fired('Trois avertissements.'); } });
    if (G.time >= hm(18)) { if (G.tasks.filter(t => t.req && !t.done && !t.failed).length) { fired('18h00 et le boulot n\'est pas fini.'); return; } endDay(); return; }
    applySchedules(false);
  }
  // déplacement joueur
  let mx = 0, my = 0;
  if (!G.hold) { if (keys.left) mx--; if (keys.right) mx++; if (keys.up) my--; if (keys.down) my++; }
  if (mx || my) {
    const l = Math.hypot(mx, my), sp = p.speed * dt; moveBody(p, mx / l * sp, my / l * sp);
    p.dir = Math.abs(mx) > Math.abs(my) ? (mx > 0 ? 'right' : 'left') : (my > 0 ? 'down' : 'up'); p.moving = true;
    
  } else p.moving = false;
  p.anim += dt; if (p.bubbleT > 0) { p.bubbleT -= dt; if (p.bubbleT <= 0) p.bubble = null; }
  // PNJ
  World.ents.forEach(e => { if (e.id === 'player') return; updateNPC(e, dt); if (e.guard) updateGuard(e, dt); else updateGaze(e, dt); });
  if (!G.night && D.tick) D.tick(dt); if (G.night && D.night.tick) D.night.tick(dt);
  // interactions
  G.interacts = (G.night ? D.night.interacts() : D.interacts()) || [];
  G.near = G.hold ? G.hold.it : nearestInteract();
  if (G.hold) {
    const it = G.hold.it;
    if (!keys.act) { G.hold = null; }
    else {
      let seen = it.sneaky ? seenBySomeone(it.range, it.half) : null;
      if (seen) { seen.bubble = '?!'; seen.bubbleT = .6; G.susp += 55 * dt; if (!G.holdWarn) { Sound.play('spotted'); G.holdWarn = 1; } }
      else { G.holdWarn = 0; G.hold.p += dt / it.hold; }
      if (G.hold && G.hold.p >= 1) { G.hold = null; it.act && it.act(); }
    }
  } else if (G.near && hit('act')) tryInteract(G.near);
  if (G.near && G.near.sneaky && !G.flags.tipSneaky && !G.night) { G.flags.tipSneaky = true; toast('Cônes rouges = regards. Attends le bon moment !', '#c9a8ff'); }
  // zones interdites
  if (!G.night) {
    const r = roomAt(p.x, p.y);
    if ((D.forbidden || []).includes(r.id) && !(G.carry && G.carry.to && G.carry.to.includes('gribouille')) && !G.allowRoom) { const s = seenBySomeone(); if (s) { G.susp += 22 * dt; if (!s.bubble) { s.bubble = '?'; s.bubbleT = .8; } } }
    if (!G.hold) G.susp = Math.max(0, G.susp - 3 * dt);
    if (G.susp >= 100) { fired('Trop curieux. On t\'a vu fouiner.'); return; }
  } else {
    // nuit : repéré par un vigile
    const s = World.ents.find(e => e.guard && canSee(e, p.x, p.y, (e.vrange || 4.4) * T, .5));
    if (s) { s.bubble = '!'; s.bubbleT = 1; Sound.play('spotted'); G.state = 'fired'; G.firedReason = s.id === 'nadia' ? 'Nadia t\'a vu. Elle a appelé le vigile.' : 'Le vigile t\'a repéré !'; G.caught = true; return; }
  }
  // sortie
  if (p.y > 22.3 * T) {
    if (G.night) { if (G.tasks.filter(t => t.req && !t.done).length === 0) { finishNight(); return; } else { p.y = 22.2 * T; if (!G.exitMsg) { toast('Pas avant d\'avoir fini !', '#ff7a6e'); G.exitMsg = 2; } } }
    else if (G.tasks.filter(t => t.req && !t.done).length === 0) { endDay(); return; }
    else { p.y = 22.2 * T; if (!G.exitMsg) { toast('Il reste du travail !', '#ff7a6e'); G.exitMsg = 2; } }
  }
  if (G.exitMsg) G.exitMsg = Math.max(0, G.exitMsg - dt);
  camFollow(dt);
}
function updateMini(dt) {
  const m = G.mg; m.step(dt);
  if (m.done) {
    G.state = 'play'; G.mg = null;
    if (m.cancel) return;
    if (m.ok) m.onWin && m.onWin(m.stars);
    else { m.onLose && m.onLose(); if (m.retry && !m.onLose) { G.rep = Math.max(0, G.rep - 3); startMG(m.kind, m.params, m.onWin, Object.assign({}, m.opt, { sneaky: false })); } }
  }
}
function updatePause() {
  if (hit('esc')) { G.state = 'play'; return; }
  if (hit('up')) G.menu = (G.menu + 2) % 3; if (hit('down')) G.menu = (G.menu + 1) % 3;
  if (hit('act')) { if (G.menu === 0) G.state = 'play'; else if (G.menu === 1) { const m = Sound.toggle(); toast(m ? 'Son coupé' : 'Son activé'); } else { G.state = 'title'; G.menu = 0; Sound.music(null); } }
}

// ---------- Cinématiques ----------
function nextCutStep() {
  const c = G.cut; c.i++; c.t = 0; c.wait = null;
  if (c.i >= c.steps.length) { G.cut = null; G.camTarget = null; G.cardShow = null; const f = c.onEnd; if (G.state === 'cut') G.state = 'play'; f && f(); return; }
  const s = c.steps[c.i];
  if (s.say) { say(s.say[0], s.say[1], 99); c.wait = { kind: 'say', who: s.say[0], dur: s.dur || (1.4 + s.say[1].length * .055) }; }
  else if (s.move) { const e = getEnt(s.move[0]) || addEnt(s.move[0]); e.lock = true; e.hidden = false; goTo(e, s.move[1]); if (s.wait !== false) c.wait = { kind: 'move', e }; else nextCutStep(); }
  else if (s.place) { const e = entAtSpot(s.place[0], s.place[1]); e.lock = true; nextCutStep(); }
  else if (s.wait != null) c.wait = { kind: 'time', dur: s.wait };
  else if (s.card) { G.cardShow = { title: s.card[0], sub: s.card[1], t: 0 }; c.wait = { kind: 'card', dur: s.dur || 2.6 }; Sound.play('blip'); }
  else if (s.cam) { G.camTarget = s.cam === 'player' ? null : [s.cam[0] * T, s.cam[1] * T]; nextCutStep(); }
  else if (s.face) { const e = getEnt(s.face[0]); if (e) e.dir = s.face[1]; nextCutStep(); }
  else if (s.hide) { const e = getEnt(s.hide); if (e) e.hidden = true; nextCutStep(); }
  else if (s.free) { s.free.forEach(id => { const e = getEnt(id); if (e) { e.lock = false; e.curS = -2; } }); nextCutStep(); }
  else if (s.sfx) { Sound.play(s.sfx); nextCutStep(); }
  else if (s.shake) { Cam.shake = s.shake; nextCutStep(); }
  else if (s.fade) { G.fadeTarget = s.fade === 'out' ? 1 : 0; c.wait = { kind: 'fade' }; }
  else if (s.fn) { s.fn(); if (G.cut === c) nextCutStep(); }
  else nextCutStep();
}
function updateCut(dt) {
  const c = G.cut; if (!c) return; c.t += dt;
  const w = c.wait; if (!w) return;
  if (w.kind === 'say') { if (c.t > w.dur || (c.t > .25 && hit('act'))) { const e = getEnt(w.who); if (e) { e.bubble = null; e.bubbleT = 0; } nextCutStep(); } }
  else if (w.kind === 'move') { if (!w.e.path || !w.e.path.length) nextCutStep(); }
  else if (w.kind === 'time') { if (c.t > w.dur) nextCutStep(); }
  else if (w.kind === 'card') { G.cardShow.t += dt; if (c.t > w.dur || (c.t > .5 && hit('act'))) { G.cardShow = null; nextCutStep(); } }
  else if (w.kind === 'fade') { if (Math.abs(G.fade - G.fadeTarget) < .01) nextCutStep(); }
}

// ---------- Écran titre ----------
function updateTitle(dt) {
  const sv = loadSave(), n = sv ? 3 : 2;
  if (hit('up')) { G.menu = (G.menu + n - 1) % n; Sound.play('blip'); } if (hit('down')) { G.menu = (G.menu + 1) % n; Sound.play('blip'); }
  if (hit('act')) {
    Sound.unlock(); const opts = sv ? ['cont', 'new', 'cred'] : ['new', 'cred']; const o = opts[G.menu];
    if (o === 'new') { G.rep = 0; G.clues = []; G.flags = {}; G.accuse = null; G.nightDone = false; startDay(1); }
    else if (o === 'cont') { G.rep = sv.rep; G.clues = sv.clues; G.flags = sv.flags; G.accuse = null; startDay(sv.day); }
    else { G.state = 'end'; G.endKind = 'credits'; G.endT = 0; }
  }
}
