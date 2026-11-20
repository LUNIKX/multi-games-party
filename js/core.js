// core.js — boucle de jeu, bus d'événements, utilitaires communs
export const W = 1280, H = 720; // monde logique du jeu (paysage)

// Bus d'événements minimaliste
const handlers = {};
export const bus = {
  on(ev, fn) { (handlers[ev] ||= []).push(fn); },
  emit(ev, data) { (handlers[ev] || []).forEach(fn => fn(data)); }
};

// Utilitaires mathématiques
export const rand = (a, b) => a + Math.random() * (b - a);
export const randi = (a, b) => Math.floor(rand(a, b + 1));
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

// Boucle principale (requestAnimationFrame, dt plafonné)
export class Loop {
  constructor(tick) { this.tick = tick; this.last = 0; this.running = false; this._f = this._frame.bind(this); }
  start() { if (this.running) return; this.running = true; this.last = performance.now(); requestAnimationFrame(this._f); }
  _frame(t) {
    if (!this.running) return;
    const dt = Math.min(0.05, (t - this.last) / 1000); this.last = t;
    this.tick(dt);
    requestAnimationFrame(this._f);
  }
}

// Dessin : helpers de texte et formes
export function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
export function text(g, s, x, y, size = 32, color = '#fff', align = 'center', stroke = true) {
  g.font = `900 ${size}px "Baloo 2", "Arial Rounded MT Bold", system-ui, sans-serif`;
  g.textAlign = align; g.textBaseline = 'middle';
  if (stroke) { g.lineWidth = Math.max(3, size / 7); g.strokeStyle = 'rgba(25,15,50,.85)'; g.lineJoin = 'round'; g.strokeText(s, x, y); }
  g.fillStyle = color; g.fillText(s, x, y);
}
