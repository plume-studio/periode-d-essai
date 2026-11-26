// ===== Histoire : 5 journées, 3 nuits, indices, accusation =====
Object.assign(SPOTS, {
  accFront: [5.5, 19.6, 'up'], accSide: [8.5, 18.6, 'left'],
  open1: [9, 5.4, 'left'], open2: [4.5, 5.4, 'left'], open3: [13.5, 5.4, 'right'], openS: [9, 8.4, 'down'], openN: [13, 2.6, 'up'], doorOpen: [8.5, 9.8, 'down'],
  hallE2: [33, 11.6, 'left'], hallMid2: [24, 11.6, 'right'], dirDoorS: [31.5, 11.6, 'up'], meetDoor: [22.5, 11.6, 'up'],
  crowd1: [27, 11.7, 'right'], crowd2: [26, 12.4, 'right'], crowd3: [27.5, 12.5, 'right'], crowd4: [28.3, 11.4, 'down'], crowd5: [30.4, 11.5, 'left'], crowd6: [30.6, 12.5, 'left'], crowdP: [24.6, 12, 'right'],
  openFront1: [6, 5.4, 'down'], openFront2: [8, 5.4, 'down'], pIntro: [5, 5.4, 'up'],
  accNight: [8, 19.5, 'left'], accNight2: [2.5, 19.5, 'right'], pauseN: [20, 19, 'left'], pauseN2: [14.5, 18.5, 'right'],
  resN1: [30, 16.8, 'right'], resN2: [29.5, 20.5, 'left'], dirN: [32, 6.5, 'left'], dirN2: [30, 5.5, 'right'],
  potA: [16, 17.3, 'right'], potB: [21, 17.3, 'left'], potC: [16.5, 20.6, 'right'], potD: [20.5, 20.6, 'left'], potE: [18.5, 16.4, 'down'], potF: [21.2, 19.3, 'left']
});

// ---------- Indices ----------
const CLUES = {
  postit: { t: 'Post-it « 47·· »', s: 'Dans le tiroir de Bernard. Un code, mais il manque deux chiffres.' },
  facture: { t: 'Facture n° 0011', s: 'FANTÔME SARL : 48 000 € pour… rien. Une société bidon ?' },
  ragot: { t: 'Ragot', s: 'Patrick et Josiane : Bernard posait trop de questions sur les factures.' },
  traces: { t: 'Traces de roues', s: 'Dans la réserve : quelqu\'un a roulé l\'armoire avec un chariot.' },
  tasse: { t: 'Tasse de Bernard', s: 'Sous l\'armoire. Une trace de rouge à lèvres… fuchsia.' },
  somni: { t: 'Somnifères', s: 'Boîte vide de Dodo-Max, jetée dans la poubelle de la pause.' },
  ticket: { t: 'Ticket de resto', s: 'Patrick dînait chez Momo lundi à 19h30.' },
  agenda: { t: 'Agenda de Gérard', s: 'Lundi 19h : squash. Gérard n\'était pas là.' },
  badges: { t: 'Journal des badges', s: 'Lundi 19h02 : le badge ACCUEIL-01 ouvre la réserve.' },
  noteJ: { t: 'Note de Josiane', s: 'C\'est Josiane qui a mis Bernard sur la piste de FANTÔME.' },
  releve: { t: 'Relevé bancaire', s: 'Le compte de FANTÔME SARL appartient à une certaine « Mme B. ».' },
  rouge: { t: 'Rouge à lèvres', s: 'Dans le tiroir de l\'accueil : « Fuchsia Fatal ».' },
  diable: { t: 'Le diable', s: 'Le chariot de l\'accueil est couvert de poussière de réserve.' },
  contrat: { t: 'Contrat secret', s: 'FANTÔME SARL : 50/50… signé Gribouille. Le patron savait.' }
};
const ENDINGS = {
  bonne: { title: 'AFFAIRE CLASSÉE', sub: 'Mme Brochard est arrêtée. Tu passes chef de service.', col: PAL.yellow },
  secrete: { title: 'LE NOUVEAU PATRON', sub: 'Brochard ET Gribouille tombent. Le bureau est à toi.', col: '#c9a8ff' }
};

// ---------- Aides ----------
const P = (x, y) => [x * T, y * T];
function it(x, y, label, act, o = {}) { return Object.assign({ x: x * T, y: y * T, label, act }, o); }
const LINES = {
  gerard: ['Au boulot.', 'T\'es payé à regarder ?', 'On n\'est pas au club Med.'],
  josiane: ['Bonjour…', 'Pas le temps.', 'Les chiffres ne mentent pas.'],
  kevin: ['T\'as essayé de redémarrer ?', 'Yo.', 'Le wifi, c\'est pas moi.'],
  patrick: ['Le client est roi !', 'Belle cravate. Non.', 'On déjeune un de ces quatre ?'],
  brochard: ['Un bonbon, mon petit ?', 'Bonne journée !', 'Pauvre Bernard…'],
  gribouille: ['Synergie !', 'Mon bureau, c\'est privé.', 'Le chiffre, mon petit !']
};
function talkAll() {
  const out = [];
  World.ents.forEach(e => {
    if (e.id === 'player' || e.hidden || e.guard || !LINES[e.id]) return;
    const forMe = G.carry && G.carry.to && G.carry.to.includes(e.id);
    out.push({
      ent: e.id, r: 40, label: forMe ? 'Donner' : 'Parler', act: () => {
        if (forMe) {
          G.carry.to = G.carry.to.filter(x => x !== e.id); G.carry.n--; say(e.id, G.carry.icon === 'mail' ? 'Merci.' : pick(['Enfin !', 'Merci.', 'Pas trop tôt.'])); Sound.play('paper');
          const t = task(G.carry.task); if (t) t.prog = t.count - G.carry.n;
          if (G.carry.n <= 0) { const id = G.carry.task, st = G.carry.st || 3; G.carry = null; doneTask(id, st); }
        } else say(e.id, pick(LINES[e.id]));
      }
    });
  });
  return out;
}
const T_DESK = () => P(3, 7.3);
function mgTask(id, x, y, label, kind, params, extra = {}) {
  return it(x, y, label, () => startMG(kind, params, st => { extra.after ? extra.after(st) : doneTask(id, st); }), Object.assign({ when: () => { const t = task(id); return t && !t.done && !t.failed && (!t.from || G.time >= t.from) && !G.carry; } }, extra));
}
function clueHold(id, x, y, label, clues, hold, o = {}) {
  return it(x, y, label, () => { clues.forEach(giveClue); doneTask(id); }, Object.assign({ hold, sneaky: true, when: () => { const t = task(id); return t && !t.done && (!t.from || G.time >= t.from); } }, o));
}
function clueMG(id, x, y, label, kind, params, clues, o = {}) {
  return it(x, y, label, () => startMG(kind, params, () => { clues.forEach(giveClue); doneTask(id); }, { sneaky: !G.night }), Object.assign({ sneaky: true, when: () => { const t = task(id); return t && !t.done; } }, o));
}
function pickCarry(id, x, y, label, carry) {
  return it(x, y, label, () => { setCarry(Object.assign({ task: id }, carry)); Sound.play('paper');  }, { when: () => { const t = task(id); return t && !t.done && !G.carry && (!t.from || G.time >= t.from); } });
}
function entPos(id) { return () => { const e = getEnt(id); return e && !e.hidden ? [e.x, e.y] : null; }; }
function carryTarget(id, fallback) { return () => { if (G.carry && G.carry.task === id && G.carry.to && G.carry.to.length) { const e = getEnt(G.carry.to[0]); if (e && !e.hidden) return [e.x, e.y]; } return fallback; }; }
function deskDecor() { setDoor('dir', false); setDoor('res', G.day < 2); }
function tapeDecal() {
  World.solidP[idx(30, 19)] = World.solidP[idx(31, 19)] = 1;
  World.decals.push({ draw(g) { g.save(); g.translate(29 * T + 16, 14 * T + 8); g.rotate(.5); g.fillStyle = PAL.yellow; g.fillRect(-26, -4, 52, 8); g.fillStyle = PAL.ink; for (let i = -24; i < 26; i += 10) g.fillRect(i, -4, 4, 8); g.restore(); } });
}
function chairsRow(list) { return list; }
function placeCrowd() {
  [['gerard', 'crowd1'], ['josiane', 'crowd2'], ['kevin', 'crowd3'], ['patrick', 'crowd4'], ['brochard', 'crowd6'], ['gribouille', 'crowd5']].forEach(([id, s]) => { const e = entAtSpot(id, s); e.lock = true; });
  entAtSpot('player', 'crowdP');
}
const FREE_ALL = { free: ['gerard', 'josiane', 'kevin', 'patrick', 'brochard', 'gribouille'] };
const BASE = {
  josiane: [[0, 'josiane'], [hm(12, 30), 'pauseT1'], [hm(13, 30), 'josiane']],
  patrick: [[0, 'patrick'], [hm(12, 10), 'away'], [hm(13, 40), 'patrick'], [hm(17), 'away']],
  kevin: [[0, 'kevin'], [hm(12, 30), 'pauseB1'], [hm(13, 30), 'kevin']],
  gerard: [[0, 'gerard'], [hm(10, 30), 'coffee'], [hm(10, 45), 'gerard'], [hm(12, 30), 'pauseT2'], [hm(13, 30), 'gerard']],
  brochard: [[0, 'brochard'], [hm(12), 'pauseT3'], [hm(13), 'brochard']],
  gribouille: [[0, 'gribouille'], [hm(12), 'away'], [hm(14), 'gribouille']]
};
function sched(extra) { const S = {}; for (const k in BASE) S[k] = BASE[k].concat(extra[k] || []).sort((a, b) => a[0] - b[0]); return S; }
// ambiance : ragots à la fontaine
function coolerChat(lines) {
  return dt => {
    const a = getEnt(lines[0][0]), b = getEnt(lines[1] ? lines[1][0] : lines[0][0]);
    const at = (e, s) => e && !e.hidden && !e.moving && e.spot === s;
    if (!(at(a, 'cooler1') || at(a, 'cooler2')) || !(at(b, 'cooler1') || at(b, 'cooler2'))) { G.chatI = 0; G.chatT = 0; return; }
    G.chatT = (G.chatT || 0) - dt; if (G.chatT > 0) return;
    const L = lines[(G.chatI || 0) % lines.length]; say(L[0], L[1], 2.2); G.chatT = 2.6; G.chatI = (G.chatI || 0) + 1;
  };
}
function chatting(a, b) { const A = getEnt(a), B = getEnt(b); return A && B && !A.hidden && !B.hidden && !A.moving && !B.moving && (A.spot || '').startsWith('cooler') && (B.spot || '').startsWith('cooler'); }

// =====================================================================
const DAYS = {};
// ---------------------------- LUNDI ----------------------------------
DAYS[1] = {
  forbidden: ['dir'],
  setup() { deskDecor(); },
  sched: sched({
    josiane: [[hm(10, 52), 'cooler1'], [hm(11, 40), 'josiane'], [hm(13, 55), 'cooler1'], [hm(14, 30), 'josiane'], [hm(14, 50), 'meetB1'], [hm(15, 40), 'josiane'], [hm(16, 20), 'cooler1'], [hm(16, 50), 'josiane']],
    patrick: [[hm(10, 52), 'cooler2'], [hm(11, 40), 'patrick'], [hm(13, 55), 'cooler2'], [hm(14, 30), 'patrick'], [hm(14, 50), 'meetB2'], [hm(15, 40), 'patrick'], [hm(16, 20), 'cooler2'], [hm(16, 50), 'patrick']],
    kevin: [[hm(14, 50), 'meetB3'], [hm(15, 40), 'kevin']],
    gerard: [[hm(14, 45), 'flip'], [hm(15, 40), 'gerard']],
    gribouille: [[hm(14, 48), 'meetT3'], [hm(15, 40), 'gribouille']]
  }),
  intro: [
    { place: ['gerard', 'gerard'] }, { cam: [5.5, 18] },
    { card: ['LUNDI', '8h59 — premier jour'] },
    { say: ['brochard', 'Bonjour ! Le nouveau ?'] }, { say: ['player', 'Oui. Bonjour.'] },
    { move: ['gerard', 'accFront'] }, { face: ['player', 'up'] },
    { say: ['gerard', 'T\'es en retard.'] }, { say: ['player', 'Il est 8h59…'] }, { say: ['gerard', 'Justement.'] },
    { say: ['gerard', 'Ton bureau : celui de Bernard.'] }, { say: ['player', 'Et Bernard ?'] }, { say: ['gerard', 'Parti. Au boulot !'] },
    { cam: 'player' }, { free: ['gerard'] },
    { card: ['À TOI', 'ZQSD / flèches : bouger · E : agir · TAB : carnet'], dur: 3.4 }
  ],
  tasks: [
    { id: 'courrier', icon: 'mail', label: 'Courrier', req: true, count: 4, target: carryTarget('courrier', P(4.5, 18.6)) },
    { id: 'cafe', icon: 'coffee', label: 'Café de Gérard', req: true, target: carryTarget('cafe', P(14.5, 16.6)) },
    { id: 'copies', icon: 'copy', label: '8 photocopies', req: true, target: () => P(16.5, 6.6) },
    { id: 'classement', icon: 'folder', label: 'Classer les dossiers', req: true, target: () => P(15.5, 3.4) },
    { id: 'reunion', icon: 'meet', label: 'Réunion', req: true, from: hm(15), until: hm(15, 35), target: () => P(22.5, 3.7) },
    { id: 'tiroir', icon: 'search', label: 'Tiroir de Bernard', req: true, clue: true, target: T_DESK },
    { id: 'ragot', icon: 'ear', label: 'Écouter les ragots', req: true, clue: true, from: hm(11), target: () => chatting('josiane', 'patrick') ? P(19.5, 17.7) : null }
  ],
  tick: coolerChat([['josiane', 'Tu sais pour Bernard ?'], ['patrick', 'Il posait trop de questions.'], ['josiane', 'Sur les factures…'], ['patrick', 'Chut. Le nouveau.']]),
  interacts() {
    return [
      pickCarry('courrier', 4.5, 18.6, 'Prendre le courrier', { icon: 'mail', to: ['josiane', 'patrick', 'kevin', 'gerard'], n: 4 }),
      it(14.5, 16.6, 'Faire le café', () => startMG('cafe', { cups: ['moyen'] }, st => { setCarry({ icon: 'coffee', to: ['gerard'], n: 1, task: 'cafe', st }); toast('Apporte-le à Gérard', PAL.yellow); }), { when: () => !task('cafe').done && !G.carry }),
      mgTask('copies', 16.5, 6.6, 'Photocopier', 'copie', { n: 8, speed: 1, zone: .2 }),
      mgTask('classement', 15.5, 3.4, 'Classer', 'classement', { n: 12, speed: 1 }),
      mgTask('reunion', 22.5, 3.7, 'S\'asseoir', 'reunion', { dur: 35, speaker: 'gerard', rate: .09 }),
      clueMG('tiroir', 3, 7.3, 'Crocheter le tiroir', 'crochet', { pins: 3, speed: 1 }, ['postit', 'facture']),
      it(19.5, 17.7, 'Écouter en douce', () => { giveClue('ragot'); doneTask('ragot'); }, { hold: 5, sneaky: true, range: 3 * T, half: .4, r: 44, when: () => !task('ragot').done && chatting('josiane', 'patrick') }),
      ...talkAll()
    ];
  },
  outro: [
    { fade: 'out' }, { fn: () => { World.ents.forEach(e => { if (e.id !== 'player') e.hidden = true; }); World.night = true; entAtSpot('player', 'accFront'); getEnt('player').dir = 'down'; entAtSpot('bernard', 'exit'); getEnt('bernard').lock = true; } },
    { card: ['LUNDI SOIR', '18h58. Tu pars le dernier.'] }, { fade: 'in' },
    { move: ['bernard', 'accSide'] }, { face: ['player', 'right'] }, { say: ['player', 'Bernard ?!'] }, { say: ['bernard', 'Chut.'] }, { say: ['bernard', 'Rentre chez toi, petit.'] },
    { move: ['bernard', 'hallE'] }, { hide: 'bernard' }, { say: ['player', '…'] }, { fade: 'out' }, { fn: () => { World.night = false; } }
  ]
};
// ---------------------------- MARDI ----------------------------------
DAYS[2] = {
  setup() { deskDecor(); World.showTipped = true; tapeDecal(); },
  sched: sched({
    josiane: [[hm(15, 30), 'cooler1'], [hm(15, 55), 'josiane']],
    kevin: [[hm(15, 30), 'cooler2'], [hm(15, 55), 'kevin']],
    gerard: [[hm(11, 30), 'resIn1'], [hm(11, 50), 'gerard'], [hm(16), 'coffee'], [hm(16, 15), 'gerard']],
    brochard: [[hm(10), 'coffee'], [hm(10, 20), 'brochard']]
  }),
  intro: [
    { fn: placeCrowd }, { cam: [28, 12] }, { card: ['MARDI', '8h59'] },
    { say: ['gribouille', 'Bernard. Sous une armoire.'] }, { say: ['patrick', 'Pauvre type.'] }, { say: ['gribouille', 'Un ACCIDENT.'] },
    { say: ['gribouille', 'Pas de police. Pas de vagues.'] }, { say: ['brochard', 'Quel malheur…'] },
    { face: ['gribouille', 'left'] }, { say: ['gribouille', 'Toi. Te voilà Assistant.'] }, { say: ['gribouille', 'Va ranger la réserve.'] },
    { fn: () => { setDoor('res', false); toast('Badge de la réserve obtenu', PAL.green); } },
    { say: ['player', '(Un accident… vraiment ?)'] }, { cam: 'player' }, FREE_ALL,
    { card: ['ASSISTANT', 'Badge : réserve'], dur: 2 }
  ],
  tasks: [
    { id: 'cartons', icon: 'box', label: 'Ranger les cartons', req: true, count: 5, target: () => G.carry && G.carry.task === 'cartons' ? P(31.5, 16.5) : (World.cartons.find(c => !c.hidden) ? [World.cartons.find(c => !c.hidden).x + 10, World.cartons.find(c => !c.hidden).y + 16] : null) },
    { id: 'copies', icon: 'copy', label: '14 photocopies', req: true, target: () => P(16.5, 6.6) },
    { id: 'standard', icon: 'phone', label: 'Tenir l\'accueil', req: true, from: hm(12), until: hm(13), target: () => P(6.5, 16.7) },
    { id: 'cafe', icon: 'coffee', label: 'Cafés : Gérard + patron', req: true, target: carryTarget('cafe', P(14.5, 16.6)) },
    { id: 'saisie', icon: 'excel', label: 'Saisie tableur', req: true, target: T_DESK },
    { id: 'traces', icon: 'search', label: 'Examiner la réserve', req: true, clue: true, target: () => P(29, 18) },
    { id: 'tasse', icon: 'search', label: 'Sous l\'armoire…', req: true, clue: true, target: () => hasClue('traces') ? P(30.5, 20.6) : null, hidden: () => !hasClue('traces') },
    { id: 'somni', icon: 'trash', label: 'Poubelle de la pause', req: true, clue: true, target: () => hasClue('tasse') ? P(22.5, 16.2) : null, hidden: () => !hasClue('tasse') }
  ],
  interacts() {
    const L = [];
    World.cartons.forEach((c, i) => { if (!c.hidden) L.push(it(c.x / T + .35, c.y / T + .6, 'Porter le carton', () => { c.hidden = true; setCarry({ icon: 'box', task: 'cartons' }); Sound.play('paper'); }, { r: 26, when: () => !G.carry })); });
    L.push(it(31.5, 16.5, 'Ranger le carton', () => { G.carry = null; const t = task('cartons'); t.prog = (t.prog || 0) + 1; Sound.play('paper'); if (t.prog >= 5) doneTask('cartons', 3); else toast('Carton ' + t.prog + ' / 5'); }, { r: 60, when: () => G.carry && G.carry.task === 'cartons' }));
    L.push(mgTask('copies', 16.5, 6.6, 'Photocopier', 'copie', { n: 14, speed: 1.3, zone: .17 }));
    L.push(mgTask('standard', 6.5, 16.7, 'Décrocher', 'standard', { len: 6 }));
    L.push(it(14.5, 16.6, 'Faire les cafés', () => startMG('cafe', { cups: ['petit', 'allongé'] }, st => { setCarry({ icon: 'coffee', to: ['gerard', 'gribouille'], n: 2, task: 'cafe', st }); toast('Un pour Gérard, un pour le patron', PAL.yellow); }), { when: () => !task('cafe').done && !G.carry }));
    L.push(mgTask('saisie', 3, 7.3, 'Saisir', 'saisie', { n: 24, speed: 1 }));
    L.push(clueHold('traces', 29, 18, 'Examiner le sol', ['traces'], 2));
    L.push(clueHold('tasse', 30.5, 20.6, 'Regarder sous l\'armoire', ['tasse'], 2.5, { when: () => hasClue('traces') && !task('tasse').done }));
    L.push(clueHold('somni', 22.5, 16.2, 'Fouiller la poubelle', ['somni'], 3, { when: () => hasClue('tasse') && !task('somni').done }));
    return L.concat(talkAll());
  },
  night: {
    start: 'pIntro',
    intro: [{ card: ['MARDI SOIR', 'Gérard t\'a collé un rapport. Le bureau est vide…'] }, { card: ['ATTENTION', 'Évite la lampe du vigile'], dur: 2.2 }],
    guards: [{ id: 'vigile', route: ['hallE', 'hallM', 'doorOpen', 'open1', 'open3', 'open1', 'open2', 'openS', 'doorOpen', 'hallW', 'hallM'], speed: 44 }],
    tasks: [
      { id: 'rapport', icon: 'copy', label: 'Imprimer le rapport', req: true, target: () => P(16.5, 6.6) },
      { id: 'ticket', icon: 'search', label: 'Tiroir de Patrick', req: true, clue: true, target: () => P(7, 3.4) },
      { id: 'agenda', icon: 'search', label: 'Bureau de Gérard', req: true, clue: true, target: () => P(11, 7.3) },
      { id: 'sortie', icon: 'door', label: 'Sortir par l\'accueil', req: false, target: () => G.tasks.filter(t => t.req && !t.done).length ? null : P(5.5, 21.5) }
    ],
    interacts() {
      return [mgTask('rapport', 16.5, 6.6, 'Imprimer', 'copie', { n: 6, speed: 1.2, zone: .18 }),
      clueMG('ticket', 7, 3.4, 'Crocheter le tiroir', 'crochet', { pins: 4, speed: 1.1 }, ['ticket']),
      clueHold('agenda', 11, 7.3, 'Feuilleter l\'agenda', ['agenda'], 3, { sneaky: false })];
    }
  }
};
// ---------------------------- MERCREDI -------------------------------
DAYS[3] = {
  setup() { deskDecor(); World.showTipped = true; tapeDecal(); },
  sched: sched({
    josiane: [[hm(10, 55), 'meetB1'], [hm(11, 35), 'josiane'], [hm(15), 'cooler1'], [hm(15, 25), 'josiane']],
    patrick: [[hm(10, 55), 'meetB2'], [hm(11, 35), 'patrick']],
    kevin: [[hm(9, 30), 'hallM'], [hm(9, 50), 'kevin'], [hm(10, 55), 'meetB3'], [hm(11, 35), 'kevin'], [hm(15), 'cooler2'], [hm(15, 25), 'kevin']],
    gerard: [[hm(10, 55), 'meetR'], [hm(11, 35), 'gerard']],
    gribouille: [[hm(10, 50), 'flip'], [hm(11, 35), 'gribouille']]
  }),
  intro: [
    { fn: () => { entAtSpot('player', 'pIntro'); ['gerard', 'josiane', 'kevin', 'patrick'].forEach(id => { const e = entAtSpot(id, id); e.lock = true; }); const g = entAtSpot('gribouille', 'openFront1'); g.lock = true; } },
    { card: ['MERCREDI', '8h59'] },
    { say: ['gribouille', 'Toi ! Chargé de mission !'] }, { say: ['gribouille', 'Le réseau plante. Répare.'] }, { say: ['kevin', 'C\'est pas moi !'] },
    { say: ['gribouille', 'Et arrose ma plante.'] }, { move: ['gribouille', 'gribouille'] }, FREE_ALL,
    { card: ['CHARGÉ DE MISSION', 'Réunion à 11h'], dur: 2 }
  ],
  tasks: [
    { id: 'reseau', icon: 'net', label: 'Réparer le réseau', req: true, target: () => P(14.5, 7.7) },
    { id: 'classement', icon: 'folder', label: 'Classer les dossiers', req: true, target: () => P(15.5, 3.4) },
    { id: 'reunion', icon: 'meet', label: 'Réunion du patron', req: true, from: hm(11), until: hm(11, 30), target: () => P(22.5, 3.7) },
    { id: 'courrier', icon: 'mail', label: 'Courrier', req: true, count: 6, target: carryTarget('courrier', P(4.5, 18.6)) },
    { id: 'plante', icon: 'plant', label: 'Plante du patron', req: true, target: () => P(33.4, 8) },
    { id: 'badges', icon: 'pc', label: 'PC de Kévin', req: true, clue: true, target: () => P(11, 3.4) },
    { id: 'noteJ', icon: 'search', label: 'Bureau de Josiane', req: true, clue: true, target: () => P(3, 3.4) }
  ],
  tick: coolerChat([['kevin', 'Le patron a fait effacer des fichiers.'], ['josiane', 'Lesquels ?'], ['kevin', 'Les badges de lundi.'], ['josiane', '…J\'ai une copie ?'], ['kevin', 'Sur mon PC. Chut.']]),
  interacts() {
    return [
      mgTask('reseau', 14.5, 7.7, 'Réparer', 'reseau', { size: 5 }),
      mgTask('classement', 15.5, 3.4, 'Classer', 'classement', { n: 16, speed: 1.6 }),
      mgTask('reunion', 22.5, 3.7, 'S\'asseoir', 'reunion', { dur: 42, speaker: 'gribouille', rate: .12, askTime: 1.2 }),
      pickCarry('courrier', 4.5, 18.6, 'Prendre le courrier', { icon: 'mail', to: ['josiane', 'patrick', 'kevin', 'gerard', 'brochard', 'gribouille'], n: 6 }),
      it(33.4, 7.9, 'Arroser', () => startMG('cafe', { cups: ['moyen'], plant: true, tight: .1 }, st => doneTask('plante', st)), { when: () => !task('plante').done && !G.carry }),
      clueMG('badges', 11, 3.4, 'Fouiller son PC', 'reseau', { size: 4, hack: true }, ['badges']),
      clueHold('noteJ', 3, 3.4, 'Fouiller son bureau', ['noteJ'], 3),
      ...talkAll()
    ];
  },
  night: {
    start: 'pIntro',
    intro: [{ card: ['MERCREDI SOIR', 'Le relevé de FANTÔME est dans l\'armoire de la compta.'] }, { card: ['ATTENTION', 'Deux vigiles ce soir'], dur: 2.2 }],
    guards: [
      { id: 'vigile', route: ['open3', 'open1', 'open2', 'openS', 'open1', 'openN'], speed: 40 },
      { id: 'vigile2', route: ['hallW', 'hallMid2', 'hallE2', 'hallMid2'], speed: 52 }],
    tasks: [
      { id: 'releve', icon: 'lock', label: 'Armoire de la compta', req: true, clue: true, target: () => P(14.5, 3.4) },
      { id: 'copieR', icon: 'copy', label: 'Photocopier le relevé', req: true, target: () => hasClue('releve') ? P(16.5, 6.6) : null, hidden: () => !hasClue('releve') },
      { id: 'sortie', icon: 'door', label: 'Sortir par l\'accueil', req: false, target: () => G.tasks.filter(t => t.req && !t.done).length ? null : P(5.5, 21.5) }
    ],
    interacts() {
      return [clueMG('releve', 14.5, 3.4, 'Crocheter l\'armoire', 'crochet', { pins: 5, speed: 1.25 }, ['releve']),
      mgTask('copieR', 16.5, 6.6, 'Photocopier', 'copie', { n: 4, speed: 1.4, zone: .15 }, { when: () => hasClue('releve') && !task('copieR').done })];
    }
  }
};
// ---------------------------- JEUDI ----------------------------------
DAYS[4] = {
  setup() { deskDecor(); World.showTipped = true; tapeDecal(); G.potItems = 0; },
  sched: sched({
    josiane: [[hm(9, 55), 'meetB1'], [hm(10, 40), 'josiane'], [hm(16), 'potA'], [hm(16, 45), 'josiane']],
    patrick: [[hm(9, 55), 'meetB2'], [hm(10, 40), 'patrick'], [hm(16), 'potB'], [hm(16, 45), 'patrick']],
    kevin: [[hm(9, 55), 'meetB3'], [hm(10, 40), 'kevin'], [hm(16), 'potC'], [hm(16, 45), 'kevin']],
    gerard: [[hm(9, 55), 'meetL'], [hm(10, 40), 'gerard'], [hm(16), 'potD'], [hm(16, 45), 'gerard']],
    brochard: [[hm(16), 'potE'], [hm(16, 45), 'brochard']],
    gribouille: [[hm(9, 55), 'meetT2'], [hm(10, 40), 'gribouille'], [hm(16), 'potF'], [hm(16, 45), 'gribouille']]
  }),
  intro: [
    { fn: () => { entAtSpot('player', 'pIntro'); ['gerard', 'josiane', 'kevin', 'patrick'].forEach(id => { const e = entAtSpot(id, id); e.lock = true; }); const g = entAtSpot('gribouille', 'openFront1'); g.lock = true; } },
    { card: ['JEUDI', '8h59'] },
    { say: ['gribouille', 'Chef d\'équipe !'] }, { say: ['gerard', 'Grmbl.'] },
    { say: ['gribouille', 'Tiens : le passe-partout.'] }, { say: ['gribouille', 'Organise le pot de Bernard. 16h.'] },
    { fn: () => { G.flags.passe = true; toast('Passe-partout obtenu', PAL.green); } },
    { say: ['gribouille', 'Et ta présentation à 10h.'] }, { move: ['gribouille', 'gribouille'] }, FREE_ALL,
    { card: ['CHEF D\'ÉQUIPE', 'Pot de départ à 16h — tout le monde y sera…'], dur: 2.4 }
  ],
  tasks: [
    { id: 'presentation', icon: 'meet', label: 'Ta présentation', req: true, from: hm(10), until: hm(10, 35), target: () => P(20.2, 6.4) },
    { id: 'pot', icon: 'party', label: 'Préparer le pot', req: true, count: 3, target: () => G.carry && G.carry.task === 'pot' ? P(18.5, 17.2) : !G.flags.potCake ? P(4.5, 18.6) : !G.flags.potBan ? P(33.5, 20.4) : P(15.5, 16.6) },
    { id: 'copies', icon: 'copy', label: '20 photocopies', req: true, target: () => P(16.5, 6.6) },
    { id: 'standard', icon: 'phone', label: 'Tenir l\'accueil', req: true, from: hm(12), until: hm(13), target: () => P(6.5, 16.7) },
    { id: 'cafe', icon: 'coffee', label: 'Les cafés', req: true, target: carryTarget('cafe', P(14.5, 16.6)) },
    { id: 'rouge', icon: 'lock', label: 'Tiroir de l\'accueil', req: true, clue: true, target: () => P(6.5, 16.7) },
    { id: 'diable', icon: 'search', label: 'Le chariot de l\'accueil', req: true, clue: true, target: () => P(10.5, 17.6) }
  ],
  interacts() {
    const L = [
      mgTask('presentation', 20.2, 6.4, 'Présenter', 'saisie', { n: 30, speed: 1.3, slides: true, maxErr: 6 }),
      mgTask('copies', 16.5, 6.6, 'Photocopier', 'copie', { n: 20, speed: 1.6, zone: .13 }),
      mgTask('standard', 6.5, 16.7, 'Décrocher', 'standard', { len: 7 }, { when: () => !task('standard').done && !task('standard').failed && G.time >= hm(12) && !G.carry }),
      it(14.5, 16.6, 'Faire les cafés', () => { const to = ['gerard', 'gribouille']; if (G.flags.coverJ !== false) to.push('josiane'); startMG('cafe', { cups: ['petit', 'moyen', 'allongé'].slice(0, to.length), tight: .11 }, st => { setCarry({ icon: 'coffee', to, n: to.length, task: 'cafe', st }); toast(to.length === 3 ? 'Gérard, le patron et Josiane' : 'Gérard et le patron', PAL.yellow); }); }, { when: () => !task('cafe').done && !G.carry }),
      clueMG('rouge', 6.5, 16.7, 'Crocheter le tiroir', 'crochet', { pins: 4, speed: 1.2 }, ['rouge'], { when: () => !task('rouge').done && !(G.time >= hm(12) && G.time < hm(13) && !task('standard').done) }),
      clueHold('diable', 10.5, 17.6, 'Examiner le chariot', ['diable'], 2.5),
      // le pot
      it(4.5, 18.6, 'Prendre le gâteau', () => { setCarry({ icon: 'cake', task: 'pot' }); G.flags.potCake = true; }, { when: () => !G.carry && !G.flags.potCake }),
      it(33.5, 20.4, 'Prendre la banderole', () => { setCarry({ icon: 'party', task: 'pot' }); G.flags.potBan = true; }, { when: () => !G.carry && !G.flags.potBan }),
      it(15.5, 16.6, 'Prendre les gobelets', () => { setCarry({ icon: 'copy', task: 'pot' }); G.flags.potCups = true; }, { when: () => !G.carry && !G.flags.potCups && G.flags.potCake && G.flags.potBan }),
      it(18.5, 17.2, 'Déposer', () => {
        const ic = G.carry.icon; G.carry = null; const t = task('pot'); t.prog = (t.prog || 0) + 1; Sound.play('paper');
        if (ic === 'cake') placeC('cake', 18.5 * T, 18 * T + 20, { lift: 16 });
        if (ic === 'party') World.decals.push({ draw(g) { g.drawImage(SPR.banner, 17 * T + 6, 14 * T + 2); } });
        if (ic === 'copy') { place('coffee_mug_front', 17.4, 18, { lift: 16, solid: false }); place('coffee_mug_front', 19.2, 18.4, { lift: 16, solid: false }); }
        if (t.prog >= 3) doneTask('pot', 3);
      }, { r: 64, when: () => G.carry && G.carry.task === 'pot' }),
      ...talkAll()
    ];
    return L;
  },
  tick(dt) { if (G.time >= hm(16) && G.time < hm(16, 45)) { const b = getEnt('brochard'); if (b && b.spot === 'potE' && !b.moving && Math.random() < dt * .3) say(pick(['gribouille', 'patrick', 'brochard', 'gerard']), pick(['À Bernard !', 'Il était… là.', 'Encore du gâteau ?', 'Quel malheur.', 'Synergie !'])); } },
  night: {
    start: 'pIntro',
    intro: [{ card: ['JEUDI SOIR', 'Avec le passe, le bureau du patron s\'ouvre…'] }, { card: ['ATTENTION', 'Deux vigiles, plus rapides'], dur: 2.2 }],
    setup() { setDoor('dir', true); },
    guards: [
      { id: 'vigile', route: ['hallE2', 'dirDoorS', 'hallMid2', 'meetDoor', 'hallM', 'hallMid2'], speed: 40, vrange: 3.8 },
      { id: 'vigile2', route: ['dirN', 'dirDoorS', 'hallE2', 'dirDoorS'], speed: 30, vrange: 3.4 }],
    tasks: [
      { id: 'porte', icon: 'key', label: 'Ouvrir chez le patron', req: true, target: () => P(31.5, 11.5) },
      { id: 'bureauP', icon: 'search', label: 'Fouiller son bureau', req: true, clue: true, target: () => P(32, 3.4) },
      { id: 'coffre', icon: 'safe', label: 'Le coffre (code ?)', req: false, clue: true, target: () => task('bureauP').done ? P(29.5, 3.4) : null, hidden: () => !task('bureauP').done },
      { id: 'sortie', icon: 'door', label: 'Sortir par l\'accueil', req: false, target: () => G.tasks.filter(t => t.req && !t.done).length ? null : P(5.5, 21.5) }
    ],
    interacts() {
      return [
        it(31.5, 11.5, 'Ouvrir (passe)', () => { setDoor('dir', false); Sound.play('door'); doneTask('porte'); }, { when: () => !task('porte').done }),
        it(32, 3.4, 'Fouiller', () => { doneTask('bureauP'); toast('Rien… à part un coffre-fort.', '#c9a8ff'); }, { hold: 3, sneaky: true, when: () => !task('bureauP').done }),
        it(29.5, 3.4, 'Coffre-fort', () => startMG('coffre', { code: '4711' }, () => { giveClue('contrat'); doneTask('coffre'); }, { retry: false }), { when: () => task('bureauP').done && !task('coffre').done })
      ];
    }
  }
};
// ---------------------------- VENDREDI -------------------------------
DAYS[5] = {
  setup() { deskDecor(); World.showTipped = true; tapeDecal(); },
  sched: sched({
    josiane: [[hm(15, 55), 'meetB1']], patrick: [[hm(15, 55), 'meetB2']], kevin: [[hm(15, 55), 'meetB3']],
    gerard: [[hm(15, 55), 'meetL']], brochard: [[hm(15, 55), 'meetR']], gribouille: [[hm(15, 55), 'meetT2']]
  }),
  intro: [
    { fn: () => { entAtSpot('player', 'pIntro'); ['gerard', 'josiane', 'kevin', 'patrick'].forEach(id => { const e = entAtSpot(id, id); e.lock = true; }); const g = entAtSpot('gribouille', 'openFront1'); g.lock = true; } },
    { card: ['VENDREDI', '8h59 — dernier jour'] },
    { say: ['gribouille', 'Directeur adjoint !'] }, { say: ['player', 'Déjà ?'] }, { say: ['gribouille', 'Y a du turnover.'] },
    { say: ['player', 'J\'organise une réunion à 16h.'] }, { say: ['player', 'Tout le monde. Sans exception.'] }, { say: ['gribouille', '…Soit.'] },
    { move: ['gribouille', 'gribouille'] }, FREE_ALL,
    { card: ['16H', 'Rassemble tes preuves. Démasque le coupable.'], dur: 2.6 }
  ],
  tasks: [
    { id: 'copies', icon: 'copy', label: '10 photocopies', req: true, target: () => P(16.5, 6.6) },
    { id: 'classement', icon: 'folder', label: 'Classer (vite)', req: true, target: () => P(15.5, 3.4) },
    { id: 'cafe', icon: 'coffee', label: 'Café du patron', req: true, target: carryTarget('cafe', P(14.5, 16.6)) },
    { id: 'saisie', icon: 'excel', label: 'Dernière saisie', req: true, target: T_DESK },
    { id: 'verite', icon: 'search', label: 'Réunion : la vérité', req: true, clue: true, from: hm(16), target: () => P(22.5, 3.7) }
  ],
  interacts() {
    return [
      mgTask('copies', 16.5, 6.6, 'Photocopier', 'copie', { n: 10, speed: 1.8, zone: .12 }),
      mgTask('classement', 15.5, 3.4, 'Classer', 'classement', { n: 20, speed: 2.1 }),
      it(14.5, 16.6, 'Faire le café', () => startMG('cafe', { cups: ['petit'], tight: .08 }, st => { setCarry({ icon: 'coffee', to: ['gribouille'], n: 1, task: 'cafe', st }); }), { when: () => !task('cafe').done && !G.carry }),
      mgTask('saisie', 3, 7.3, 'Saisir', 'saisie', { n: 34, speed: 1.4 }),
      it(22.5, 3.7, 'Commencer', () => startAccuse(), { when: () => G.time >= hm(16) && G.tasks.filter(t => t.req && !t.done && t.id !== 'verite').length === 0 }),
      it(22.5, 3.7, 'Finis ton boulot d\'abord', () => Sound.play('bad'), { when: () => G.time >= hm(16) && G.tasks.filter(t => t.req && !t.done && t.id !== 'verite').length > 0 }),
      ...talkAll()
    ];
  }
};

// =================== ACCUSATION FINALE ===================
const SUSPECTS = ['gerard', 'josiane', 'kevin', 'patrick', 'brochard', 'gribouille'];
const sus = () => SUSPECTS.filter(s => !(s === 'josiane' && G.flags.coverJ === false));
const ALIBI = { gerard: ['agenda', 'J\'étais au squash !'], josiane: ['noteJ', 'C\'est MOI qui ai prévenu Bernard !'], kevin: ['badges', 'J\'ai badgé à 18h. Parti.'], patrick: ['ticket', 'Resto ! J\'ai le ticket !'], gribouille: [null, 'Moi ? Je ne me salis pas les mains.'] };
const SLOTS = [
  { k: 'COMMENT ?', ok: ['tasse', 'rouge', 'diable'], no: 'Ça ne prouve rien, mon petit.' },
  { k: 'QUAND ?', ok: ['badges'], no: 'Lundi soir ? J\'étais chez moi !' },
  { k: 'POURQUOI ?', ok: ['releve', 'facture'], no: 'Et pourquoi j\'aurais fait ça ?' }];
function startAccuse() {
  G.accuse = { phase: 'suspect', sel: 0, hearts: 3, slot: 0, msg: null, used: [] };
  G.tasks.forEach(t => { if (t.id === 'verite') t.done = true; });
  World.ents.forEach(e => { if (SUSPECTS.includes(e.id)) { const s = 'acc' + (SUSPECTS.indexOf(e.id) + 1); entAtSpot(e.id, s); e.lock = true; } });
  entAtSpot('player', 'accP');
  runCut([{ cam: [23.5, 6.9] }, { say: ['gribouille', 'Alors ? On vous écoute.'] }, { say: ['player', 'Bernard a été assassiné.'] }, { shake: 4 }, { say: ['patrick', 'Quoi ?!'] }, { say: ['player', 'Et l\'assassin est ici.'] }],
    () => { G.state = 'accuse'; G.camTarget = [23.5 * T, 6.9 * T]; });
}
function accMsg(who, text, after) { G.accuse.msg = { who, text, t: 0, after }; say(who, text, 2.4); }
function updateAccuse(dt) {
  const A = G.accuse; camFollow(dt); World.ents.forEach(e => updateNPC(e, dt));
  if (A.msg) { A.msg.t += dt; if (A.msg.t > 2.2 || (A.msg.t > .4 && hit('act'))) { const f = A.msg.after; A.msg = null; f && f(); } return; }
  if (hit('book')) { G.state = 'book'; G.bookSel = 0; G.bookReturn = 'accuse'; return; }
  if (A.phase === 'suspect') {
    const L = sus(), n = L.length; if (hit('left')) A.sel = (A.sel + n - 1) % n; if (hit('right')) A.sel = (A.sel + 1) % n;
    if (hit('act')) {
      const s = L[A.sel];
      if (s === 'brochard') { accMsg('brochard', 'Moi ? Une vieille dame ?', () => { A.phase = 'slot'; A.sel = 0; A.slot = 0; }); }
      else { const al = ALIBI[s]; A.hearts--; Sound.play('bad'); accMsg(s, al[1], () => { if (A.hearts <= 0) fired('Personne ne te croit plus.'); }); }
    }
  } else if (A.phase === 'slot') {
    const n = G.clues.length; if (hit('left')) A.sel = (A.sel + n - 1) % n; if (hit('right')) A.sel = (A.sel + 1) % n;
    if (hit('up')) A.sel = Math.max(0, A.sel - 6); if (hit('down')) A.sel = Math.min(n - 1, A.sel + 6);
    if (hit('act')) {
      const c = G.clues[A.sel], S = SLOTS[A.slot];
      if (S.ok.includes(c)) { Sound.play('ok'); Cam.shake = 3; A.used.push(c); A.slot++; A.sel = 0; if (A.slot >= 3) { A.phase = 'done'; confession(); } else accMsg('brochard', pick(['…', 'Hum.', 'N\'importe quoi.']), null); }
      else { A.hearts--; Sound.play('bad'); accMsg('brochard', S.no, () => { if (A.hearts <= 0) fired('Personne ne te croit plus.'); }); }
    }
  }
}
function confession() {
  G.state = 'cut';
  const steps = [{ say: ['brochard', 'Bon. Oui. C\'était moi.'] }, { say: ['brochard', 'Bernard avait tout vu.'] }, { say: ['brochard', 'Un café… un somnifère…'] }, { say: ['brochard', '…et une armoire.'] }, { say: ['josiane', 'Mon Dieu.'] }, { say: ['gribouille', 'Quelle tragédie ! Bravo, mon petit.'] }];
  if (hasClue('contrat')) steps.push({ say: ['player', 'Pas si vite, patron.'] }, { shake: 5 }, { say: ['player', 'FANTÔME SARL : 50/50.'] }, { say: ['player', 'Signé : Gribouille.'] }, { say: ['gribouille', 'Ah. Ça.'] }, { say: ['brochard', 'Je ne tombe pas seule, Jean-Mi !'] }, { say: ['gerard', 'Donc… le chef, c\'est…'] }, { say: ['player', 'Moi.'] });
  else steps.push({ say: ['player', '(Et le patron… il savait ?)'] });
  steps.push({ fade: 'out' });
  runCut(steps, () => { G.state = 'end'; G.endKind = hasClue('contrat') ? 'secrete' : 'bonne'; G.endT = 0; G.fade = 0; G.fadeTarget = 0; G.accuse = null; Sound.play('win'); try { localStorage.removeItem('lenouveau_save'); } catch (e) { } });
}
function drawAccuse() {
  const g = ctx, A = G.accuse;
  g.fillStyle = 'rgba(10,8,16,.55)'; g.fillRect(0, H - 250, W, 250);
  for (let i = 0; i < 3; i++) T_(g, '♥', 30 + i * 34, 50, 34, i < A.hearts ? PAL.red : '#555');
  T_(g, 'TAB : carnet', W - 20, 40, 16, '#cfc8d8', 'right', false);
  if (A.phase === 'suspect') {
    T_(g, 'QUI A TUÉ BERNARD ?', W / 2, H - 210, 32, PAL.yellow, 'center');
    SUSPECTS.forEach((s, i) => {
      const x = W / 2 - 3 * 150 + i * 150 + 20, y = H - 185; rrect(g, x, y, 112, 150, 10, i === A.sel ? PAL.yellow : '#2a2633', PAL.ink);
      drawPerson(g, s, x + 8, y + 2, 3); T_(g, CAST[s].name, x + 56, y + 140, 15, i === A.sel ? PAL.ink : '#fff', 'center', true, false);
    });
  } else if (A.phase === 'slot') {
    T_(g, SLOTS[A.slot].k, W / 2, H - 214, 34, PAL.yellow, 'center');
    T_(g, 'Mme Brochard — montre la preuve', W / 2, H - 186, 18, '#fff', 'center', false);
    const cw = 120, ch = 140, per = Math.min(G.clues.length, 8), start = Math.max(0, Math.min(A.sel - 3, G.clues.length - per));
    for (let k = 0; k < per; k++) { const i = start + k, id = G.clues[i]; if (!id) break; const x = W / 2 - per * (cw + 16) / 2 + k * (cw + 16); g.save(); g.globalAlpha = A.used.includes(id) ? .4 : 1; clueFrame(g, id, x, H - 165, cw, ch, i === A.sel); g.restore(); }
    const C = CLUES[G.clues[A.sel]]; if (C) T_(g, C.s, W / 2, H - 6, 16, '#cfc8d8', 'center', false);
  }
}
