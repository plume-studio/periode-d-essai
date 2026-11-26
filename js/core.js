// ===== LE NOUVEAU — noyau : écran, clavier, images, sons =====
const W = 1280, H = 720, WS = 2, T = 32;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
cv.width = W; cv.height = H;
ctx.imageSmoothingEnabled = false;

function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  cv.style.width = (W * s) + 'px'; cv.style.height = (H * s) + 'px';
}
addEventListener('resize', fit); fit();

// ---------- Clavier ----------
const keys = {}, pressed = {};
const KMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyE: 'act', Space: 'act', Enter: 'ok', Tab: 'book', KeyC: 'book',
  Escape: 'esc', KeyP: 'esc', KeyT: 'tasks', KeyM: 'mute', Backspace: 'back'
};
addEventListener('keydown', e => {
  if (window.SPLASH) { if (KMAP[e.code]) e.preventDefault(); return; }
  const k = KMAP[e.code];
  if (e.code.startsWith('Digit') || e.code.startsWith('Numpad')) {
    const d = e.code.replace('Digit', '').replace('Numpad', '');
    if (/^[0-9]$/.test(d)) { pressed['d' + d] = true; }
  }
  if (k) { if (!keys[k]) pressed[k] = true; keys[k] = true; e.preventDefault(); }
  if (k === 'ok') { pressed.act = true; }
  Sound.unlock();
});
addEventListener('keyup', e => { const k = KMAP[e.code]; if (k) keys[k] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function hit(k) { return !!pressed[k]; }
function clearPressed() { for (const k in pressed) delete pressed[k]; }

// ---------- Utilitaires ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const irnd = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- Images ----------
const IMG = {};
const IMG_LIST = ['props_decor', 'props_desk_items', 'props_desks', 'props_kitchen', 'props_meeting', 'props_seating', 'props_storage', 'props_tech', 'floors',
  'char_player', 'char_gerard', 'char_josiane', 'char_kevin', 'char_patrick', 'char_brochard', 'char_gribouille', 'char_vigile', 'char_bernard'];
function loadImages(cb) {
  let n = IMG_LIST.length;
  IMG_LIST.forEach(name => {
    const im = new Image();
    im.onload = () => { if (--n === 0) cb(); };
    im.onerror = () => { console.error('image manquante', name); if (--n === 0) cb(); };
    im.src = (window.ASSET_BASE||'assets/') + name + '.png';
    IMG[name] = im;
  });
}
function frameOf(name) {
  for (const a in ATLAS) if (ATLAS[a][name]) return { img: a, f: ATLAS[a][name] };
  return null;
}

// ---------- Couleurs maison (palette du pack) ----------
const PAL = {
  ink: '#2b2a2c', wallTop: '#817f83', wallLine: '#4d4c4f', wallFace: '#d3cecb', wallFaceD: '#c8c2bf',
  paper: '#f4f4f0', cork: '#b98a55', red: '#d8433b', yellow: '#f2c94c', green: '#5fb36a', blue: '#3d72c4',
  pink: '#de2286', ui: '#1d1b22', ui2: '#2c2934', uiLine: '#4a4556', cream: '#fdf0da'
};

// ---------- Petits dessins de props maison (style pixel, contour sombre) ----------
function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g, w, h); return c; }
function box(g, x, y, w, h, fill, line = PAL.ink) { g.fillStyle = line; g.fillRect(x, y, w, h); g.fillStyle = fill; g.fillRect(x + 1, y + 1, w - 2, h - 2); }
const SPR = {};
function buildCustomSprites() {
  // Photocopieuse 40x50
  SPR.copier = mk(40, 50, (g) => {
    box(g, 2, 14, 36, 34, '#d9d6d2'); g.fillStyle = '#bdb8b4'; g.fillRect(3, 40, 34, 7);
    box(g, 4, 6, 32, 12, '#e9e6e2'); g.fillStyle = '#5b5a60'; g.fillRect(6, 8, 28, 3);
    box(g, 6, 22, 14, 8, '#3a3f4a'); g.fillStyle = '#7fd1ff'; g.fillRect(8, 24, 10, 4);
    g.fillStyle = '#5fb36a'; g.fillRect(25, 23, 3, 3); g.fillStyle = '#d8433b'; g.fillRect(30, 23, 3, 3);
    box(g, 8, 33, 24, 5, '#f4f4f0'); g.fillStyle = '#9b9692'; g.fillRect(4, 44, 32, 1);
  });
  // Machine à café 26x44
  SPR.coffee = mk(28, 46, (g) => {
    box(g, 2, 2, 24, 42, '#3a3436'); g.fillStyle = '#4b4447'; g.fillRect(3, 3, 22, 10);
    g.fillStyle = '#e9b44c'; g.fillRect(6, 6, 16, 4); box(g, 6, 16, 16, 14, '#1f1b1d');
    g.fillStyle = '#f4f4f0'; g.fillRect(11, 24, 6, 6); g.fillStyle = '#6b3f22'; g.fillRect(12, 25, 4, 2);
    g.fillStyle = '#d8433b'; g.fillRect(8, 34, 4, 3); g.fillStyle = '#5fb36a'; g.fillRect(16, 34, 4, 3);
  });
  // Frigo 30x60
  SPR.fridge = mk(30, 60, (g) => {
    box(g, 1, 1, 28, 58, '#e8edf0'); g.fillStyle = '#c9d0d5'; g.fillRect(2, 22, 26, 1); g.fillRect(2, 56, 26, 2);
    g.fillStyle = '#8b949b'; g.fillRect(23, 8, 2, 10); g.fillRect(23, 28, 2, 16);
    g.fillStyle = '#f2c94c'; g.fillRect(6, 30, 6, 6); g.fillStyle = '#de2286'; g.fillRect(13, 36, 5, 5);
  });
  // Coffre-fort 30x34
  SPR.safe = mk(30, 34, (g) => {
    box(g, 1, 1, 28, 32, '#4a4e57'); box(g, 4, 4, 22, 24, '#5d626d');
    g.fillStyle = '#c9a43a'; g.beginPath(); g.arc(15, 16, 5, 0, 7); g.fill(); g.fillStyle = '#2b2a2c'; g.fillRect(14, 12, 2, 5);
    g.fillStyle = '#2b2a2c'; g.fillRect(4, 30, 4, 3); g.fillRect(22, 30, 4, 3);
  });
  // Carton 22x18
  SPR.carton = mk(22, 18, (g) => { box(g, 1, 3, 20, 14, '#c89a5f'); g.fillStyle = '#a97c45'; g.fillRect(2, 4, 18, 3); g.fillStyle = '#e8d9b5'; g.fillRect(9, 3, 4, 14); });
  // Diable (chariot) 18x40
  SPR.diable = mk(20, 40, (g) => {
    g.fillStyle = PAL.ink; g.fillRect(4, 2, 3, 30); g.fillRect(13, 2, 3, 30); g.fillRect(4, 2, 12, 3);
    g.fillStyle = '#d8433b'; g.fillRect(5, 3, 1, 28); g.fillRect(14, 3, 1, 28); g.fillRect(5, 3, 10, 1);
    g.fillStyle = PAL.ink; g.fillRect(2, 30, 16, 3); g.beginPath(); g.arc(5, 35, 4, 0, 7); g.arc(15, 35, 4, 0, 7); g.fill();
    g.fillStyle = '#777'; g.fillRect(4, 34, 2, 2); g.fillRect(14, 34, 2, 2);
  });
  // Baie réseau 30x58
  SPR.rack = mk(30, 58, (g) => {
    box(g, 1, 1, 28, 56, '#24262c');
    for (let i = 0; i < 6; i++) { box(g, 4, 5 + i * 8, 22, 7, '#363944'); g.fillStyle = i % 2 ? '#5fb36a' : '#f2c94c'; g.fillRect(7, 8 + i * 8, 2, 2); g.fillStyle = '#3d72c4'; g.fillRect(11, 8 + i * 8, 2, 2); }
  });
  // Téléphone standard 18x12
  SPR.phone = mk(18, 12, (g) => { box(g, 1, 3, 16, 8, '#2f2e35'); g.fillStyle = '#d8433b'; g.fillRect(2, 1, 14, 3); g.fillStyle = '#9ad0ff'; g.fillRect(4, 5, 5, 2); });
  // Gâteau
  SPR.cake = mk(20, 16, (g) => { box(g, 1, 6, 18, 9, '#f4d9b0'); g.fillStyle = '#de2286'; g.fillRect(2, 6, 16, 3); g.fillStyle = '#f2c94c'; g.fillRect(9, 1, 2, 5); });
  // Banderole
  SPR.banner = mk(70, 16, (g) => {
    g.fillStyle = PAL.ink; g.fillRect(0, 2, 70, 1);
    const c = ['#d8433b', '#f2c94c', '#3d72c4', '#5fb36a'];
    for (let i = 0; i < 7; i++) { g.fillStyle = c[i % 4]; g.beginPath(); g.moveTo(2 + i * 10, 3); g.lineTo(10 + i * 10, 3); g.lineTo(6 + i * 10, 13); g.fill(); }
  });
  // Tableau de liège (mural) 48x30
  SPR.cork = mk(48, 30, (g) => {
    box(g, 0, 0, 48, 30, '#a5794a'); g.fillStyle = PAL.cork; g.fillRect(2, 2, 44, 26);
    g.fillStyle = '#f4f4f0'; g.fillRect(6, 5, 10, 12); g.fillStyle = '#f2c94c'; g.fillRect(20, 7, 9, 9); g.fillStyle = '#9ad0ff'; g.fillRect(33, 5, 10, 13);
    g.fillStyle = '#d8433b'; g.fillRect(10, 5, 2, 2); g.fillRect(24, 7, 2, 2); g.fillRect(37, 5, 2, 2);
  });
  // Tapis d'entrée
  SPR.mat = mk(60, 22, (g) => { box(g, 0, 0, 60, 22, '#5b3b2e'); g.fillStyle = '#7a5040'; for (let i = 3; i < 58; i += 4) g.fillRect(i, 3, 2, 16); });
}
