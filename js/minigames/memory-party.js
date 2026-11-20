// 25. Memory Party — chacun son tour : le curseur passe sur les cartes, touche pour retourner. Trouve les paires !
import { MiniGameBase } from './base.js';
import { W, H, shuffle, text, rr } from '../core.js';
import { sound } from '../audio.js';
const ICONS = ['🍕', '🚀', '🐸', '⚽', '🎸', '🌵', '🍩', '👑'], CW = 120, CH = 120, GX = 640 - 2 * 135 + 7, GY = 130;
export default class MemoryParty extends MiniGameBase {
  init() {
    this.cards = shuffle([...ICONS, ...ICONS]).map(ic => ({ ic, up: false, done: false }));
    this.turn = 0; this.cur = 0; this.step = 0.6; this.ct = 0; this.picks = []; this.wait = 0; this.known = this.players.map(() => ({}));
  }
  hidden() { return this.cards.map((c, k) => k).filter(k => !this.cards[k].up && !this.cards[k].done); }
  onPress(i) {
    if (i !== this.turn || this.wait > 0) return; const c = this.cards[this.cur]; if (!c || c.up || c.done) return;
    c.up = true; this.picks.push(this.cur); sound.tap(); this.remember(this.cur);
    if (this.picks.length === 2) {
      const [a, b] = this.picks;
      if (this.cards[a].ic === this.cards[b].ic) { this.cards[a].done = this.cards[b].done = true; this.scores[i]++; sound.good(); this.burst(640, 360, this.color(i), 20); this.picks = []; if (this.cards.every(c => c.done)) this.finish(); }
      else { this.wait = 1; sound.bad(); }
    }
    this.advance();
  }
  remember(k) { for (let p = 0; p < this.n; p++) if (Math.random() < 0.3 + this.bot.skill * 0.65) this.known[p][k] = this.cards[k].ic; }
  advance() { const h = this.hidden(); if (!h.length) return; const nx = h.find(k => k > this.cur); this.cur = nx === undefined ? h[0] : nx; this.ct = 0; }
  botWant(i) {
    const kn = this.known[i], h = this.hidden();
    if (this.picks.length === 1) { const ic = this.cards[this.picks[0]].ic; const m = h.find(k => kn[k] === ic); if (m !== undefined) return m; }
    else { for (const a of h) for (const b of h) if (a < b && kn[a] && kn[a] === kn[b]) return a; }
    const unk = h.filter(k => !kn[k]); return (unk.length ? unk : h)[0];
  }
  bots() { if (this.isBot(this.turn) && this.wait <= 0 && this.cur === this.botWant(this.turn)) this.botTap(this.turn, 0.2); }
  update(dt) {
    if (this.wait > 0) { this.wait -= dt; if (this.wait <= 0) { for (const k of this.picks) this.cards[k].up = false; this.picks = []; this.turn = (this.turn + 1) % this.n; this.advance(); } return; }
    this.ct += dt; if (this.ct >= this.step) { this.advance(); }
  }
  draw(g) {
    g.fillStyle = '#22223b'; g.fillRect(0, 0, W, H);
    this.cards.forEach((c, k) => {
      const x = GX + (k % 4) * 135, y = GY + Math.floor(k / 4) * 135;
      const sel = k === this.cur && this.wait <= 0;
      g.fillStyle = c.done ? 'rgba(255,255,255,.1)' : c.up ? '#f2e9e4' : '#4a4e69'; rr(g, x, y, CW, CH, 16); g.fill();
      if (sel) { g.strokeStyle = this.color(this.turn); g.lineWidth = 8; rr(g, x - 4, y - 4, CW + 8, CH + 8, 18); g.stroke(); }
      if (c.up || c.done) { g.globalAlpha = c.done ? 0.5 : 1; g.font = '64px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c.ic, x + CW / 2, y + CH / 2 + 4); g.globalAlpha = 1; }
      else text(g, '?', x + CW / 2, y + CH / 2, 50, '#9a8c98');
    });
    for (let i = 0; i < this.n; i++) { const x = i < 2 ? 120 + i * 0 : 1160, y = 220 + (i % 2) * 260; const px = i % 2 === 0 ? (i < 2 ? 130 : 1150) : (i < 2 ? 130 : 1150); this.stick(g, i, i < 2 ? 140 : 1140, 300 + (i % 2) * 250 + (i >= 2 ? 0 : 0), 1, this.turn === i ? 'win' : 'idle'); if (this.turn === i) text(g, '▼', i < 2 ? 140 : 1140, 300 + (i % 2) * 250 - 110, 30, this.color(i)); }
    text(g, (this.opts.lang === 'en' ? 'Turn: ' : 'Tour : ') + this.players[this.turn].name, 640, 690, 30, this.color(this.turn));
  }
}
