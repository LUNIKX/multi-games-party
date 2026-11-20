// 21. Stack Tower — le bloc glisse, toucher = le poser. Le débord est coupé. La plus haute tour gagne.
import { MiniGameBase } from './base.js';
import { W, H, text } from '../core.js';
import { column } from './helpers.js';
import { sound } from '../audio.js';
const BH = 28, BASE = 660;
export default class StackTower extends MiniGameBase {
  init() {
    this.endOnLastAlive = false;
    this.t = this.players.map((_, i) => { const c = column(i, this.n), w = c.w * 0.6; return { stack: [{ x: c.cx - w / 2, w }], cur: { x: c.x0 + 10, w, dir: 1 }, sp: 220, over: false, falls: [] }; });
  }
  scoreText(i) { return String(this.t[i].stack.length - 1) + (this.t[i].over ? ' ✖' : ''); }
  onPress(i) {
    const T = this.t[i]; if (T.over) return; const top = T.stack[T.stack.length - 1], c = T.cur;
    const l = Math.max(top.x, c.x), r = Math.min(top.x + top.w, c.x + c.w);
    if (r - l <= 4) { T.over = true; T.falls.push({ x: c.x, w: c.w, y: 0, vy: 0, h: T.stack.length }); sound.bad(); if (this.t.every(t => t.over)) this.finish(); return; }
    if (c.x < l) T.falls.push({ x: c.x, w: l - c.x, y: 0, vy: 0, h: T.stack.length }); if (c.x + c.w > r) T.falls.push({ x: r, w: c.x + c.w - r, y: 0, vy: 0, h: T.stack.length });
    const perfect = Math.abs(c.x - top.x) < 5; T.stack.push(perfect ? { x: top.x, w: top.w } : { x: l, w: r - l }); this.scores[i] = T.stack.length - 1;
    const col = column(i, this.n); T.cur = { x: T.cur.dir > 0 ? col.x0 + col.w - 10 - (r - l) : col.x0 + 10, w: perfect ? top.w : r - l, dir: -T.cur.dir }; T.sp += 12;
    perfect ? sound.coin() : sound.tap();
  }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i) && !this.t[i].over) { const T = this.t[i], top = T.stack[T.stack.length - 1], lead = T.cur.dir * T.sp * 0.12 * (1 - this.bot.skill * 0.5); if (Math.abs(T.cur.x + lead - top.x) < 10 + (1 - this.bot.skill) * 25) this.botTap(i, 0.03); } }
  update(dt) {
    for (let i = 0; i < this.n; i++) {
      const T = this.t[i], col = column(i, this.n);
      if (!T.over) { T.cur.x += T.cur.dir * T.sp * dt; if (T.cur.x < col.x0 + 4) { T.cur.x = col.x0 + 4; T.cur.dir = 1; } if (T.cur.x + T.cur.w > col.x0 + col.w - 4) { T.cur.x = col.x0 + col.w - 4 - T.cur.w; T.cur.dir = -1; } }
      for (const f of T.falls) { f.vy += 1500 * dt; f.y += f.vy * dt; } T.falls = T.falls.filter(f => f.y < 800);
    }
  }
  draw(g) {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#023047'); gr.addColorStop(1, '#219ebc'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < this.n; i++) {
      const T = this.t[i], col = column(i, this.n), cam = Math.max(0, (T.stack.length - 14) * BH);
      g.save(); g.beginPath(); g.rect(col.x0, 60, col.w, H); g.clip();
      const Y = k => BASE - k * BH + cam;
      T.stack.forEach((b, k) => { g.fillStyle = k === 0 ? '#555' : `hsl(${(k * 18 + i * 90) % 360},75%,58%)`; g.fillRect(b.x, Y(k), b.w, BH - 2); });
      if (!T.over) { g.fillStyle = '#fff'; g.fillRect(T.cur.x, Y(T.stack.length), T.cur.w, BH - 2); }
      for (const f of T.falls) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(f.x, Y(f.h) + f.y, f.w, BH - 2); }
      g.restore();
      this.stick(g, i, col.x0 + 30, BASE + BH, 0.7, T.over ? 'stun' : 'idle');
      if (i > 0) { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(col.x0 - 1, 60, 2, H); }
    }
  }
}
