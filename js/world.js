// ===== Le bureau : carte, meubles, collisions, rendu, personnages =====
const MW = 36, MH = 23;
const World = {
  wall: new Uint8Array(MW * MH), floor: new Array(MW * MH).fill(null),
  solidP: new Uint8Array(MW * MH), doors: [], props: [], decals: [], ents: [], layer: null, night: false
};
const idx = (x, y) => y * MW + x;
const isWall = (x, y) => x < 0 || y < 0 || x >= MW || y >= MH || World.wall[idx(x, y)] === 1;

function buildMap() {
  const Wd = World; Wd.wall.fill(1); Wd.floor.fill(null); Wd.solidP.fill(0); Wd.doors = []; Wd.props = []; Wd.decals = [];
  const room = (x1, y1, x2, y2, f) => { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) { Wd.wall[idx(x, y)] = 0; Wd.floor[idx(x, y)] = f; } };
  room(1, 2, 17, 8, 'carpet');     // open space
  room(19, 2, 27, 8, 'carpet');    // salle de réunion
  room(29, 2, 34, 8, 'wood');      // bureau du directeur
  room(1, 11, 34, 12, 'vinyl');    // couloir
  room(1, 15, 11, 21, 'wood');     // accueil
  room(13, 15, 23, 21, 'vinyl');   // salle de pause
  room(25, 15, 34, 21, 'vinylD');  // réserve
  // portes ouvertes
  room(8, 9, 9, 10, 'carpet'); room(22, 9, 23, 10, 'carpet'); room(5, 13, 6, 14, 'wood'); room(17, 13, 18, 14, 'vinyl');
  room(5, 22, 6, 22, 'wood'); // entrée
  // portes verrouillées (pour le joueur)
  room(31, 9, 31, 10, 'wood'); room(29, 13, 29, 14, 'vinylD');
  Wd.doors.push({ id: 'dir', x: 31, y: 9, locked: true, name: 'Bureau du directeur' });
  Wd.doors.push({ id: 'res', x: 29, y: 13, locked: true, name: 'Réserve' });
  placeFurniture();
  renderStatic();
}
function doorAt(x, y) { return World.doors.find(d => d.x === x && (d.y === y || d.y + 1 === y)); }
function setDoor(id, locked) { const d = World.doors.find(d => d.id === id); if (d) { d.locked = locked; renderStatic(); } }
function blockedFor(x, y, who) {
  if (isWall(x, y)) return true;
  if (World.solidP[idx(x, y)]) return true;
  if (who === 'player') { const d = doorAt(x, y); if (d && d.locked) return true; }
  return false;
}
const ROOMS = [
  { id: 'open', name: 'Open space', x1: 1, y1: 2, x2: 17, y2: 8 }, { id: 'meet', name: 'Salle de réunion', x1: 19, y1: 2, x2: 27, y2: 8 },
  { id: 'dir', name: 'Bureau du directeur', x1: 29, y1: 2, x2: 34, y2: 8 }, { id: 'hall', name: 'Couloir', x1: 1, y1: 9, x2: 34, y2: 12 },
  { id: 'acc', name: 'Accueil', x1: 1, y1: 13, x2: 11, y2: 22 }, { id: 'pause', name: 'Salle de pause', x1: 13, y1: 13, x2: 23, y2: 21 },
  { id: 'res', name: 'Réserve', x1: 25, y1: 13, x2: 34, y2: 21 }];
function roomAt(px, py) { const x = Math.floor(px / T), y = Math.floor(py / T); return ROOMS.find(r => x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2) || ROOMS[3]; }

// ---------- Meubles ----------
function place(name, tx, ty, o = {}) {
  const fr = frameOf(name); if (!fr) { console.warn('frame?', name); return; }
  const f = fr.f, fw = f.footprint[0], fh = f.footprint[1];
  const p = {
    id: o.id || null, img: fr.img, f, x: tx * T - f.anchor.x + (o.dx || 0), y: ty * T - f.anchor.y + (o.dy || 0) - (o.lift || 0),
    sortY: (ty + fh) * T - 1 + (o.sort || 0) + (o.lift ? 2 : 0), hidden: false, tag: o.tag
  };
  if (o.solid !== false && !o.lift) for (let y = Math.floor(ty); y < Math.ceil(ty + fh); y++) for (let x = Math.floor(tx); x < Math.ceil(tx + fw); x++) World.solidP[idx(x, y)] = 1;
  World.props.push(p); return p;
}
function placeC(key, cx, by, o = {}) { // sprite maison, centré en x, pied en y (pixels)
  const c = SPR[key]; const p = { id: o.id || null, canvas: c, x: Math.round(cx - c.width / 2), y: by - c.height - (o.lift || 0), sortY: by + (o.sort || 0), hidden: false, rot: o.rot, tag: o.tag };
  if (o.solid) o.solid.forEach(([x, y]) => World.solidP[idx(x, y)] = 1);
  World.props.push(p); return p;
}
const DESK_LIFT = 15;
function placeFurniture() {
  // --- Open space ---
  place('tall_plant_front', 1, 2); place('office_plant_front', 17, 8); place('office_plant_front', 1, 8);
  place('wall_clock_front', 9, 1, { solid: false });
  placeC('cork', 4 * T, 1 * T + 26, { id: 'corkOpen', sort: -40 });
  // rangée A (on voit leur visage) : Josiane, Patrick, Kévin
  [[2, 'josiane'], [6, 'patrick'], [10, 'kevin']].forEach(([x, who]) => {
    place('office_chair_front', x + .5, 3, { solid: false, sort: -12 });
    place('office_desk_back', x, 4, { id: 'desk_' + who });
    place('computer_back', x + .5, 4, { lift: DESK_LIFT, solid: false, id: 'pc_' + who });
  });
  place('coffee_mug_back', 3.4, 4, { lift: DESK_LIFT, solid: false }); place('paper_stack_back', 6, 4, { lift: DESK_LIFT, solid: false });
  // rangée B (on voit leur dos) : TOI, (vide), Gérard
  [[2, 'player'], [6, 'vide'], [10, 'gerard']].forEach(([x, who]) => {
    place('office_desk_front', x, 6, { id: 'desk_' + who });
    place('computer_front', x + .5, 6, { lift: DESK_LIFT, solid: false, id: 'pc_' + who });
    place('office_chair_back', x + .5, 7, { solid: false, sort: 4 });
  });
  place('coffee_mug_back', 2.1, 6, { lift: DESK_LIFT, solid: false }); place('paper_stack_back', 11.1, 6, { lift: DESK_LIFT, solid: false });
  place('trash_bin_front', 5, 8, { solid: false });
  // classeurs + photocopieuse
  place('filing_cabinet_front', 14, 2, { id: 'cab1' }); place('filing_cabinet_front', 15, 2, { id: 'cab2' }); place('filing_cabinet_front', 16, 2, { id: 'cab3' });
  placeC('copier', 16.5 * T, 6 * T - 2, { id: 'copier', solid: [[16, 5]] });
  // --- Salle de réunion ---
  place('office_plant_front', 19, 2); place('tall_plant_front', 27, 2);
  place('projector_screen_front', 22.5, 1, { solid: false }); place('wall_clock_front', 26, 1, { solid: false });
  [22, 23, 24].forEach(x => place('office_chair_front', x, 3, { solid: false, sort: -12 }));
  place('conference_table_front', 22, 4, { id: 'meetTable' });
  place('laptop_front', 22.6, 4, { lift: 16, solid: false }); place('paper_stack_front', 23.6, 4.5, { lift: 16, solid: false });
  [22, 23, 24].forEach(x => place('office_chair_back', x, 6, { solid: false, sort: 4 }));
  place('office_chair_right', 21, 4.5, { solid: false }); place('office_chair_left', 25, 4.5, { solid: false });
  place('flip_chart_right', 19.2, 7, { id: 'flip' });
  // --- Bureau du directeur ---
  place('office_chair_front', 31.5, 3, { solid: false, sort: -12 });
  place('office_desk_back', 31, 4, { id: 'desk_boss' });
  place('laptop_back', 32.05, 4, { lift: DESK_LIFT, solid: false }); place('desk_lamp_front', 30.95, 4, { lift: DESK_LIFT, solid: false, dy: -2 });
  placeC('safe', 29.5 * T, 3 * T, { id: 'safe', solid: [[29, 2]] });
  place('filing_cabinet_front', 33, 2); place('filing_cabinet_front', 34, 2);
  place('office_plant_front', 34, 8, { id: 'bossPlant' }); place('tall_plant_front', 29, 8);
  place('wall_clock_front', 31.5, 1, { solid: false });
  // --- Couloir ---
  place('tall_plant_front', 1, 11); place('tall_plant_front', 34, 11);
  placeC('rack', 13.5 * T, 12 * T - 2, { id: 'rack', solid: [[13, 11]] });
  place('office_plant_front', 26, 11);
  // --- Accueil ---
  place('office_chair_front', 6, 16, { solid: false, sort: -12 });
  place('office_desk_back', 4, 17, { id: 'desk_brochard' }); place('office_desk_back', 6, 17, { id: 'desk_brochard2' });
  place('laptop_back', 5.4, 17, { lift: DESK_LIFT, solid: false }); placeC('phone', 7.3 * T, 17 * T + 18, { lift: DESK_LIFT, id: 'phone' });
  place('paper_stack_front', 3.9, 17, { lift: DESK_LIFT, solid: false, id: 'mail' });
  place('office_plant_front', 1, 15); place('tall_plant_front', 11, 15); place('office_plant_front', 1, 21); place('tall_plant_front', 11, 21);
  place('office_chair_front', 9, 19, { solid: false }); place('office_chair_front', 10, 19, { solid: false });
  placeC('diable', 10.5 * T, 17 * T - 4, { id: 'diable', solid: [[10, 16]] });
  place('trash_bin_front', 3, 21, { solid: false });
  // --- Salle de pause ---
  placeC('coffee', 14.5 * T, 15 * T + 26, { id: 'coffee', solid: [[14, 15]] });
  placeC('fridge', 15.5 * T, 15 * T + 28, { id: 'fridge', solid: [[15, 15]] });
  place('water_cooler_front', 19, 15, { id: 'cooler' });
  place('trash_bin_front', 22, 15, { id: 'binPause' });
  [17, 18, 19].forEach(x => place('office_chair_front', x, 17, { solid: false, sort: -12 }));
  place('conference_table_front', 17, 18, { id: 'pauseTable' });
  [17, 18, 19].forEach(x => place('office_chair_back', x, 20, { solid: false, sort: 4 }));
  place('office_plant_front', 13, 21); place('tall_plant_front', 23, 21);
  // --- Réserve ---
  [26, 27, 28, 31, 32, 33].forEach(x => place('filing_cabinet_front', x, 15));
  [26, 27, 32, 33].forEach(x => place('filing_cabinet_back', x, 18));
  place('paper_stack_front', 34, 21, { solid: false }); place('paper_stack_left', 25, 21, { solid: false });
  // cartons du rangement
  World.cartons = [];
  [[25.5, 17.2], [25.8, 16.4], [26.4, 17.4], [25.4, 19.6], [26.3, 20.2]].forEach(([x, y], i) => World.cartons.push(placeC('carton', x * T, y * T, { id: 'carton' + i })));
}

// ---------- Rendu statique (sols + murs) ----------
function renderStatic() {
  const c = World.layer || (World.layer = document.createElement('canvas')); c.width = MW * T; c.height = MH * T;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#1b1a1e'; g.fillRect(0, 0, c.width, c.height);
  const FX = { wood: 0, carpet: 32, vinyl: 64, vinylD: 64 };
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const f = World.floor[idx(x, y)];
    if (f) { g.drawImage(IMG.floors, FX[f], 0, 32, 32, x * T, y * T, 32, 32); if (f === 'vinylD') { g.fillStyle = 'rgba(60,50,40,.18)'; g.fillRect(x * T, y * T, 32, 32); } }
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (!isWall(x, y)) continue;
    const X = x * T, Y = y * T, below = y + 1 < MH && !isWall(x, y + 1);
    if (below) { // face du mur
      g.fillStyle = PAL.wallFace; g.fillRect(X, Y, T, T);
      g.fillStyle = PAL.wallFaceD; g.fillRect(X, Y + T - 5, T, 3); g.fillStyle = PAL.wallLine; g.fillRect(X, Y + T - 2, T, 2);
      if (!isWall(x, y - 1)) { g.fillStyle = PAL.wallTop; g.fillRect(X, Y, T, 10); g.fillStyle = PAL.wallLine; g.fillRect(X, Y + 10, T, 1); }
      if (!isWall(x - 1, y)) { g.fillStyle = PAL.wallLine; g.fillRect(X, Y, 1, T); }
      if (!isWall(x + 1, y)) { g.fillStyle = PAL.wallLine; g.fillRect(X + T - 1, Y, 1, T); }
    } else {
      g.fillStyle = PAL.wallTop; g.fillRect(X, Y, T, T); g.fillStyle = PAL.wallLine;
      if (!isWall(x - 1, y)) g.fillRect(X, Y, 2, T);
      if (!isWall(x + 1, y)) g.fillRect(X + T - 2, Y, 2, T);
      if (!isWall(x, y - 1)) g.fillRect(X, Y, T, 2);
      if (y + 1 < MH && isWall(x, y + 1) && !isWall(x, y + 2) && y + 2 < MH) g.fillRect(X, Y + T - 1, T, 1);
      if (y + 1 >= MH || (!isWall(x, y + 1) && false)) g.fillRect(X, Y + T - 2, T, 2);
    }
  }
  // portes verrouillées
  World.doors.forEach(d => {
    const X = d.x * T, Y = d.y * T;
    if (d.locked) {
      g.fillStyle = PAL.wallTop; g.fillRect(X, Y, T, T); g.fillStyle = PAL.wallLine; g.fillRect(X, Y + T - 1, T, 1);
      g.fillStyle = PAL.ink; g.fillRect(X + 1, Y + T, T - 2, T);
      g.fillStyle = '#8a5a3c'; g.fillRect(X + 3, Y + T + 2, T - 6, T - 4); g.fillStyle = '#6d4630'; g.fillRect(X + 5, Y + T + 5, T - 10, 9); g.fillRect(X + 5, Y + T + 17, T - 10, 9);
      g.fillStyle = '#e0c060'; g.fillRect(X + T - 9, Y + T + 15, 3, 3);
      g.fillStyle = '#d8433b'; g.fillRect(X + T - 9, Y + T + 9, 3, 2);
    } else {
      g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(X, Y, T, 2 * T);
    }
  });
  // porte d'entrée vitrée
  g.fillStyle = 'rgba(160,210,255,.35)'; g.fillRect(5 * T, 22 * T + 20, 2 * T, 12); g.fillStyle = PAL.wallLine; g.fillRect(5 * T, 22 * T + 30, 2 * T, 2);
  g.drawImage(SPR.mat, 5 * T + 2, 21 * T + 6);
}

// ---------- Personnages ----------
const CAST = {
  player: { name: 'Toi', img: 'char_player' }, gerard: { name: 'Gérard', job: 'Chef de service', img: 'char_gerard' },
  josiane: { name: 'Josiane', job: 'Comptable', img: 'char_josiane' }, kevin: { name: 'Kévin', job: 'Informaticien', img: 'char_kevin' },
  patrick: { name: 'Patrick', job: 'Commercial', img: 'char_patrick' }, brochard: { name: 'Mme Brochard', job: 'Accueil', img: 'char_brochard' },
  gribouille: { name: 'M. Gribouille', job: 'Directeur', img: 'char_gribouille' }, vigile: { name: 'Le vigile', img: 'char_vigile' },
  vigile2: { name: 'Le vigile', img: 'char_vigile' }, bernard: { name: 'Bernard', img: 'char_bernard' }
};
// postes (pieds, en tuiles) et direction
const SPOTS = {
  josiane: [3, 3.7, 'down'], patrick: [7, 3.7, 'down'], kevin: [11, 3.7, 'down'], gerard: [11, 7.08, 'up'], player: [3, 7.08, 'up'],
  gribouille: [32, 3.7, 'down'], brochard: [6.5, 16.7, 'down'],
  cooler1: [18.6, 16.6, 'right'], cooler2: [20.4, 16.6, 'left'], coffee: [14.5, 16.7, 'up'],
  meetT1: [22.5, 3.7, 'down'], meetT2: [23.5, 3.7, 'down'], meetT3: [24.5, 3.7, 'down'], meetB1: [22.5, 6.08, 'up'], meetB2: [23.5, 6.08, 'up'], meetB3: [24.5, 6.08, 'up'],
  meetL: [21.5, 5.4, 'right'], meetR: [25.5, 5.4, 'left'], flip: [20.2, 6.4, 'right'],
  pauseT1: [17.5, 17.7, 'down'], pauseT2: [18.5, 17.7, 'down'], pauseT3: [19.5, 17.7, 'down'], pauseB1: [17.5, 20.08, 'up'], pauseB2: [18.5, 20.08, 'up'], pauseB3: [19.5, 20.08, 'up'],
  pauseL: [15.5, 19, 'right'], pauseR: [21.5, 19, 'left'],
  resDoor: [29, 12.2, 'down'], resIn1: [29.5, 16.7, 'down'], resIn2: [30.5, 19.5, 'left'], resIn3: [28.5, 17.5, 'right'],
  copier: [16.5, 6.6, 'up'], exit: [5.5, 22.6, 'down'], entry: [5.5, 21.2, 'up'], hallW: [4, 11.6, 'down'], hallE: [30, 11.6, 'down'], hallM: [17, 11.6, 'down'],
  dirIn: [31.5, 6.5, 'up'], acc1: [20.6, 7.6, 'up'], acc2: [21.7, 7.6, 'up'], acc3: [22.8, 7.7, 'up'], acc4: [24, 7.7, 'up'], acc5: [25.1, 7.6, 'up'], acc6: [26.2, 7.6, 'up'], accP: [23.5, 2.75, 'down'], accWait: [9.5, 20, 'up'], window: [15, 2.6, 'up']
};
function makeEnt(id, x, y, dir = 'down') {
  return { id, x, y, dir, anim: 0, moving: false, path: null, speed: id === 'player' ? 90 : 74, bubble: null, bubbleT: 0, look: null, hidden: false, vision: 0, alert: 0, task: null, sitting: false };
}
function entAtSpot(id, spot) { const s = SPOTS[spot]; const e = getEnt(id) || addEnt(id); e.x = s[0] * T; e.y = s[1] * T; e.dir = s[2]; e.path = null; e.hidden = false; e.spot = spot; return e; }
function addEnt(id) { const e = makeEnt(id, 0, 0); World.ents.push(e); return e; }
function getEnt(id) { return World.ents.find(e => e.id === id); }
function removeEnt(id) { World.ents = World.ents.filter(e => e.id !== id); }

// déplacement du joueur avec collisions
function moveBody(e, dx, dy) {
  const hw = 6, hh = 4;
  const solid = (px, py) => blockedFor(Math.floor(px / T), Math.floor(py / T), e.id);
  const test = (x, y) => solid(x - hw, y - hh) || solid(x + hw, y - hh) || solid(x - hw, y + 1) || solid(x + hw, y + 1);
  if (dx && !test(e.x + dx, e.y)) e.x += dx;
  if (dy && !test(e.x, e.y + dy)) e.y += dy;
}

// ---------- A* ----------
function findPath(sx, sy, tx, ty, who = 'npc') {
  sx = Math.floor(sx); sy = Math.floor(sy); tx = Math.floor(tx); ty = Math.floor(ty);
  const walk = (x, y) => !(isWall(x, y) || (World.solidP[idx(x, y)] && !(x === tx && y === ty)) || (who === 'player' && doorAt(x, y) && doorAt(x, y).locked));
  const open = [[sx, sy]], came = new Map(), gS = new Map(), key = (x, y) => x + y * MW;
  gS.set(key(sx, sy), 0); let guard = 0;
  while (open.length && guard++ < 4000) {
    let bi = 0, bf = 1e9;
    open.forEach((n, i) => { const f = gS.get(key(n[0], n[1])) + Math.abs(n[0] - tx) + Math.abs(n[1] - ty); if (f < bf) { bf = f; bi = i; } });
    const [cx, cy] = open.splice(bi, 1)[0];
    if (cx === tx && cy === ty) { const p = []; let k = key(cx, cy); while (k !== key(sx, sy)) { p.unshift([k % MW, Math.floor(k / MW)]); k = came.get(k); } return p; }
    for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + ax, ny = cy + ay; if (!walk(nx, ny)) continue;
      const ng = gS.get(key(cx, cy)) + 1, nk = key(nx, ny);
      if (!gS.has(nk) || ng < gS.get(nk)) { gS.set(nk, ng); came.set(nk, key(cx, cy)); if (!open.some(o => o[0] === nx && o[1] === ny)) open.push([nx, ny]); }
    }
  }
  return null;
}
function goTo(e, spot, cb) {
  const s = typeof spot === 'string' ? SPOTS[spot] : spot;
  const p = findPath(e.x / T, e.y / T, s[0], s[1]);
  e.path = (p || []).map(([x, y]) => [x * T + 16, y * T + 18]);
  if (e.path.length) e.path[e.path.length - 1] = [s[0] * T, s[1] * T]; else e.path.push([s[0] * T, s[1] * T]);
  e.endDir = s[2]; e.onArrive = cb || null; e.spot = typeof spot === 'string' ? spot : null; e.hidden = false;
}
function updateNPC(e, dt) {
  if (e.path && e.path.length) {
    const [px, py] = e.path[0], dx = px - e.x, dy = py - e.y, d = Math.hypot(dx, dy), sp = e.speed * dt;
    if (d <= sp) { e.x = px; e.y = py; e.path.shift(); }
    else { e.x += dx / d * sp; e.y += dy / d * sp; e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
    e.moving = true;
    if (!e.path.length) { e.moving = false; if (e.endDir) e.dir = e.endDir; const cb = e.onArrive; e.onArrive = null; cb && cb(e); }
  } else e.moving = false;
  e.anim += dt;
  if (e.bubbleT > 0) { e.bubbleT -= dt; if (e.bubbleT <= 0) e.bubble = null; }
}
// ---------- Vision ----------
const DIRANG = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
function lineOfSight(x1, y1, x2, y2) {
  const d = Math.hypot(x2 - x1, y2 - y1), n = Math.ceil(d / 8);
  for (let i = 1; i < n; i++) { const x = x1 + (x2 - x1) * i / n, y = y1 + (y2 - y1) * i / n; if (isWall(Math.floor(x / T), Math.floor(y / T))) return false; }
  return true;
}
function canSee(e, tx, ty, range = 5.5 * T, half = .75) {
  if (e.hidden || e.blind) return false;
  const ex = e.x, ey = e.y - 12, dx = tx - ex, dy = ty - 12 - ey, d = Math.hypot(dx, dy);
  if (d > range) return false;
  if (d < 26) return true;
  let a = Math.atan2(dy, dx) - (e.lookAng != null ? e.lookAng : DIRANG[e.dir]);
  a = Math.atan2(Math.sin(a), Math.cos(a));
  if (Math.abs(a) > half) return false;
  return lineOfSight(ex, ey, tx, ty - 12);
}

// ---------- Dessin du monde ----------
const Cam = { x: 0, y: 0, shake: 0 };
function drawChar(g, e) {
  if (e.hidden) return;
  const im = IMG[CAST[e.id] ? CAST[e.id].img : 'char_player'];
  const rowBase = e.moving ? 4 : 0, dirRow = { down: 0, left: 1, right: 2, up: 3 }[e.dir] || 0;
  const fr = Math.floor(e.anim * (e.moving ? 8 : 4)) % 4;
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(Math.round(e.x), Math.round(e.y), 8, 3, 0, 0, 7); g.fill();
  g.drawImage(im, fr * 32, (rowBase + dirRow) * 32, 32, 32, Math.round(e.x - 16), Math.round(e.y - 30), 32, 32);
}
function drawTipped(g) { // armoire renversée dans la réserve
  const fr = frameOf('filing_cabinet_left'); const f = fr.f;
  g.save(); g.translate(30 * T + 20, 19 * T + 18); g.rotate(-Math.PI / 2);
  g.drawImage(IMG[fr.img], f.x, f.y, f.w, f.h, -f.w / 2, -f.h / 2, f.w, f.h); g.restore();
}
function drawWorld(g, extra) {
  g.save();
  const sx = Cam.shake ? rnd(-Cam.shake, Cam.shake) : 0, sy = Cam.shake ? rnd(-Cam.shake, Cam.shake) : 0;
  g.scale(WS, WS); g.translate(Math.round(-Cam.x + sx), Math.round(-Cam.y + sy));
  g.drawImage(World.layer, 0, 0);
  World.decals.forEach(d => d.draw(g));
  const list = [];
  World.props.forEach(p => { if (!p.hidden) list.push({ y: p.sortY, p }); });
  World.ents.forEach(e => { if (!e.hidden) list.push({ y: e.y + (e.id === 'player' && !G.sitting ? 24 : 0), e }); });
  if (World.showTipped) list.push({ y: 19 * T + 30, fn: drawTipped });
  list.sort((a, b) => a.y - b.y);
  for (const it of list) {
    if (it.e) drawChar(g, it.e);
    else if (it.fn) it.fn(g);
    else if (it.p.canvas) g.drawImage(it.p.canvas, it.p.x, it.p.y);
    else { const p = it.p, f = p.f; g.drawImage(IMG[p.img], f.x, f.y, f.w, f.h, Math.round(p.x), Math.round(p.y), f.w, f.h); }
  }
  extra && extra(g);
  g.restore();
}
