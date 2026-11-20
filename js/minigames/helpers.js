// helpers.js — décors et géométrie partagés par plusieurs mini-jeux
import { W, H, rr } from '../core.js';
export const TOP = 66; // hauteur réservée au HUD
// bande horizontale (couloir) pour le joueur i parmi n
export function lane(i, n) { const h = (H - TOP - 46) / n; return { y0: TOP + i * h, h, floor: TOP + (i + 1) * h - 14 }; }
// ciel dégradé + collines animées
export function sky(g, a = '#3a1c71', b = '#ff7e5f', t = 0) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.08)';
  for (let k = 0; k < 6; k++) { const x = ((k * 260 - t * 20) % 1560 + 1560) % 1560 - 140; g.beginPath(); g.arc(x, H - 30, 160, Math.PI, 0); g.fill(); }
}
export function laneBg(g, i, n, color, scroll = 0) {
  const L = lane(i, n);
  g.fillStyle = i % 2 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'; g.fillRect(0, L.y0, W, L.h);
  g.fillStyle = color; g.globalAlpha = 0.9; g.fillRect(0, L.floor, W, 14); g.globalAlpha = 1;
  g.fillStyle = 'rgba(0,0,0,.25)';
  for (let x = -((scroll % 80) + 80) % 80; x < W; x += 80) g.fillRect(x, L.floor + 4, 40, 4);
  return L;
}
export function panel(g, x, y, w, h, c = 'rgba(20,10,40,.5)', r = 18) { g.fillStyle = c; rr(g, x, y, w, h, r); g.fill(); }
// colonne verticale pour le joueur i parmi n
export function column(i, n) { const w = W / n; return { x0: i * w, w, cx: i * w + w / 2 }; }
