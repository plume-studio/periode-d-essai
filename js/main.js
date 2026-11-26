// ===== Démarrage =====
const fontsReady = Promise.race([Promise.all(["400 20px Anton", "700 20px 'Space Grotesk'", "500 20px 'Space Grotesk'", "700 20px 'JetBrains Mono'", "500 20px 'JetBrains Mono'", "400 20px 'Special Elite'"].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]);
loadImages(() => fontsReady.then(() => {
  buildCustomSprites(); buildMap();
  const q = new URLSearchParams(location.search);
  if (q.get('day')) { G.rep = 0; G.clues = (q.get('clues') || '').split(',').filter(Boolean); startDay(+q.get('day'), q.has('skip')); if (q.has('night')) { G.nightDone = true; startNight(); } }
  requestAnimationFrame(loop);
}));
