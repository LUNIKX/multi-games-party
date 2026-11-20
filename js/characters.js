// characters.js — stickmen dessinés par code + animations
export const COLORS = [
  { hex: '#ff4d6d', cost: 0 }, { hex: '#3a86ff', cost: 0 }, { hex: '#2ec27e', cost: 0 }, { hex: '#ffbe0b', cost: 0 },
  { hex: '#a259ff', cost: 0 }, { hex: '#ff7b00', cost: 80 }, { hex: '#00d1d1', cost: 80 }, { hex: '#ff5dc8', cost: 120 },
  { hex: '#8a5a2b', cost: 150 }, { hex: '#f5f5f5', cost: 200 }
];
// Personnages : accessoire + condition de déblocage (niveau ou pièces)
export const CHARACTERS = [
  { id: 'classic', name: { fr: 'Classique', en: 'Classic' }, acc: 'none', level: 1 },
  { id: 'cap', name: { fr: 'Casquette', en: 'Cap' }, acc: 'cap', level: 1 },
  { id: 'headband', name: { fr: 'Bandeau', en: 'Headband' }, acc: 'headband', level: 1 },
  { id: 'cat', name: { fr: 'Chat', en: 'Cat' }, acc: 'cat', level: 2 },
  { id: 'tophat', name: { fr: 'Gentleman', en: 'Gentleman' }, acc: 'tophat', level: 3 },
  { id: 'mohawk', name: { fr: 'Punk', en: 'Punk' }, acc: 'mohawk', cost: 100 },
  { id: 'horns', name: { fr: 'Diablotin', en: 'Imp' }, acc: 'horns', level: 4 },
  { id: 'antenna', name: { fr: 'Robot', en: 'Robot' }, acc: 'antenna', cost: 150 },
  { id: 'wizard', name: { fr: 'Sorcier', en: 'Wizard' }, acc: 'wizard', level: 6 },
  { id: 'ninja', name: { fr: 'Ninja', en: 'Ninja' }, acc: 'ninja', cost: 250 },
  { id: 'halo', name: { fr: 'Ange', en: 'Angel' }, acc: 'halo', level: 8 },
  { id: 'crown', name: { fr: 'Roi', en: 'King' }, acc: 'crown', cost: 500 },
];
export const charById = id => CHARACTERS.find(c => c.id === id) || CHARACTERS[0];

// Dessine un stickman : (x,y) = position des pieds, s = échelle (1 ≈ 70 px)
// pose : 'idle' | 'run' | 'jump' | 'duck' | 'fall' | 'win' | 'stun' | 'roll', t = temps d'animation
export function drawStickman(g, x, y, s, color, acc = 'none', pose = 'idle', t = 0, dir = 1) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  if (pose === 'duck') g.scale(1, 0.6);
  if (pose === 'roll') { g.translate(0, -25); g.rotate(t * 14); g.translate(0, 25); g.scale(0.8, 0.8); }
  // ombre
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, 2, 20, 5, 0, 0, Math.PI * 2); g.fill();
  const bob = pose === 'run' ? Math.abs(Math.sin(t * 12)) * 4 : pose === 'idle' ? Math.sin(t * 3) * 1.5 : 0;
  const hipY = -30 - bob, neckY = -56 - bob, headY = -70 - bob;
  g.lineCap = 'round'; g.lineJoin = 'round';
  // contour sombre puis couleur (effet cartoon)
  for (const pass of [0, 1]) {
    g.strokeStyle = pass ? color : '#1e1436'; g.lineWidth = pass ? 6 : 10;
    g.beginPath();
    let la, ra, ll, rl; // angles bras/jambes
    if (pose === 'run') { const p = Math.sin(t * 12); ll = p * 0.8; rl = -p * 0.8; la = -p; ra = p; }
    else if (pose === 'jump') { ll = -0.6; rl = 0.3; la = -2.4; ra = 2.4; }
    else if (pose === 'win') { ll = -0.3; rl = 0.3; la = -2.6 + Math.sin(t * 10) * 0.3; ra = 2.6 - Math.sin(t * 10) * 0.3; }
    else if (pose === 'fall' || pose === 'stun') { ll = -0.9; rl = 0.9; la = -1.8 + Math.sin(t * 20) * 0.5; ra = 1.8 + Math.cos(t * 20) * 0.5; }
    else { ll = -0.25; rl = 0.25; la = -0.4 + Math.sin(t * 3) * 0.05; ra = 0.4; }
    // jambes
    g.moveTo(0, hipY); g.lineTo(Math.sin(ll) * 30, hipY + Math.cos(ll) * 30);
    g.moveTo(0, hipY); g.lineTo(Math.sin(rl) * 30, hipY + Math.cos(rl) * 30);
    // corps
    g.moveTo(0, hipY); g.lineTo(0, neckY);
    // bras
    g.moveTo(0, neckY + 4); g.lineTo(Math.sin(la) * 24, neckY + 4 + Math.cos(la) * 24);
    g.moveTo(0, neckY + 4); g.lineTo(Math.sin(ra) * 24, neckY + 4 + Math.cos(ra) * 24);
    g.stroke();
  }
  // tête
  g.fillStyle = color; g.strokeStyle = '#1e1436'; g.lineWidth = 4;
  g.beginPath(); g.arc(0, headY, 14, 0, Math.PI * 2); g.fill(); g.stroke();
  // yeux
  g.fillStyle = '#fff';
  if (pose === 'stun' || pose === 'fall') { g.strokeStyle = '#1e1436'; g.lineWidth = 2; for (const ex of [-1, 6]) { g.beginPath(); g.moveTo(ex - 3, headY - 5); g.lineTo(ex + 3, headY + 1); g.moveTo(ex + 3, headY - 5); g.lineTo(ex - 3, headY + 1); g.stroke(); } }
  else { g.beginPath(); g.arc(-1, headY - 2, 4, 0, 7); g.arc(7, headY - 2, 4, 0, 7); g.fill(); g.fillStyle = '#1e1436'; g.beginPath(); g.arc(0.5, headY - 2, 2, 0, 7); g.arc(8.5, headY - 2, 2, 0, 7); g.fill(); }
  drawAcc(g, acc, headY, t);
  g.restore();
}
function drawAcc(g, acc, hy, t) {
  g.lineWidth = 3; g.strokeStyle = '#1e1436';
  const f = (c) => { g.fillStyle = c; g.fill(); g.stroke(); };
  switch (acc) {
    case 'cap': g.beginPath(); g.arc(0, hy - 4, 14, Math.PI, 0); g.lineTo(24, hy - 4); g.lineTo(14, hy - 4); f('#222'); break;
    case 'headband': g.beginPath(); g.rect(-14, hy - 9, 28, 6); f('#e63946'); g.beginPath(); g.moveTo(-14, hy - 6); g.lineTo(-26, hy - 2 + Math.sin(t * 8) * 3); g.stroke(); break;
    case 'cat': for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 4, hy - 12); g.lineTo(sx * 12, hy - 26); g.lineTo(sx * 13, hy - 8); f('#333'); } break;
    case 'tophat': g.beginPath(); g.rect(-16, hy - 14, 32, 4); f('#111'); g.beginPath(); g.rect(-10, hy - 36, 20, 22); f('#111'); break;
    case 'mohawk': for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 4 - 2, hy - 12); g.lineTo(i * 4, hy - 26 + Math.abs(i) * 3); g.lineTo(i * 4 + 2, hy - 12); f('#2ec27e'); } break;
    case 'horns': for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 6, hy - 11); g.quadraticCurveTo(sx * 14, hy - 20, sx * 12, hy - 28); g.lineTo(sx * 11, hy - 11); f('#d62828'); } break;
    case 'antenna': g.beginPath(); g.moveTo(0, hy - 14); g.lineTo(0, hy - 30); g.stroke(); g.beginPath(); g.arc(0, hy - 32, 4 + Math.sin(t * 6), 0, 7); f('#ffbe0b'); break;
    case 'wizard': g.beginPath(); g.moveTo(-17, hy - 8); g.lineTo(4, hy - 44); g.lineTo(17, hy - 8); g.closePath(); f('#3a0ca3'); break;
    case 'ninja': g.beginPath(); g.rect(-14, hy - 4, 28, 9); f('#111'); break;
    case 'halo': g.beginPath(); g.ellipse(0, hy - 24 + Math.sin(t * 4) * 2, 13, 4, 0, 0, 7); g.strokeStyle = '#ffd60a'; g.lineWidth = 4; g.stroke(); break;
    case 'crown': g.beginPath(); g.moveTo(-12, hy - 10); g.lineTo(-12, hy - 26); g.lineTo(-6, hy - 18); g.lineTo(0, hy - 28); g.lineTo(6, hy - 18); g.lineTo(12, hy - 26); g.lineTo(12, hy - 10); g.closePath(); f('#ffd60a'); break;
  }
}
// Rendu d'un aperçu de personnage dans un petit canvas (menus)
export function previewCanvas(charId, colorIdx, size = 96, pose = 'idle') {
  const c = document.createElement('canvas'), dpr = Math.min(2, devicePixelRatio || 1);
  c.width = size * dpr; c.height = size * dpr; c.style.width = c.style.height = size + 'px';
  const g = c.getContext('2d'); g.scale(dpr, dpr);
  drawStickman(g, size / 2, size * 0.92, size / 120, COLORS[colorIdx].hex, charById(charId).acc, pose, 0.3);
  return c;
}
