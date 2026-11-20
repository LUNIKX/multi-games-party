// 24. Cannon Dodge — boulets au sol : toucher = sauter ; boulets hauts : tenir = rouler par-dessous
import { MiniGameBase } from './base.js';
import { W, H, rand, text } from '../core.js';
import { lane, sky } from './helpers.js';
import { sound } from '../audio.js';
const PX = 640;
export default class CannonDodge extends MiniGameBase {
  init() {
    this.rankMode = 'elim'; this.balls = []; this.next = 1.2; this.pressT = [];
    this.p = this.players.map(() => ({ y: 0, vy: 0, roll: false, lives: 3, inv: 0 }));
  }
  scoreText(i) { return '❤'.repeat(this.p[i].lives) || '✖'; }
  onPress(i) { this.pressT[i] = this.time; this.p[i].roll = true; }
  onRelease(i) { const p = this.p[i]; p.roll = false; if (this.time - (this.pressT[i] || 0) < 0.2 && p.y === 0) { p.vy = 800; sound.jump(); } }
  bots() {
    for (let i = 0; i < this.n; i++) if (this.isBot(i) && this.alive[i]) {
      const b = this.balls.find(b => !b['p' + i] && (b.x - PX) * -b.dir > 0 && Math.abs(b.x - PX) < 260); if (!b) { this.botHold(i, false); continue; }
      const d = Math.abs(b.x - PX);
      if (b.high) this.botHold(i, d < 200); else if (d < 40 + b.sp * 0.2 && this.p[i].y === 0) this.botTap(i, 0.1);
    }
  }
  update(dt) {
    this.next -= dt;
    if (this.next <= 0) {
      const dir = Math.random() < 0.5 ? 1 : -1, high = Math.random() < 0.4, sp = rand(320, 420) + this.time * 5;
      this.balls.push({ x: dir > 0 ? 40 : W - 40, dir, high, sp }); sound.boom(); this.next = Math.max(0.7, rand(1.2, 2) - this.time / 50);
    }
    for (const b of this.balls) b.x += b.dir * b.sp * dt;
    this.balls = this.balls.filter(b => b.x > -50 && b.x < W + 50);
    for (let i = 0; i < this.n; i++) {
      const p = this.p[i]; if (!this.alive[i]) continue; if (p.inv > 0) p.inv -= dt;
      p.vy -= 2400 * dt; p.y = Math.max(0, p.y + p.vy * dt); if (p.y === 0) p.vy = 0;
      for (const b of this.balls) {
        if (b['p' + i] || Math.abs(b.x - PX) > 22) continue;
        const hit = b.high ? !p.roll && p.y < 90 : p.y < 34;
        b['p' + i] = 1;
        if (hit && p.inv <= 0) { p.lives--; p.inv = 0.8; sound.hit(); this.burst(PX, lane(i, this.n).floor - 30, '#fff', 12); if (p.lives <= 0) this.eliminate(i); }
      }
    }
  }
  draw(g) {
    sky(g, '#3c096c', '#ff6d00', this.anim);
    for (let i = 0; i < this.n; i++) {
      const L = lane(i, this.n), p = this.p[i], sc = Math.min(1, L.h / 150);
      g.fillStyle = '#6c584c'; g.fillRect(0, L.floor, W, 14);
      for (const side of [0, 1]) { g.save(); g.translate(side ? W - 50 : 50, L.floor - 22 * sc); if (side) g.scale(-1, 1); g.fillStyle = '#222'; g.fillRect(-10, -14 * sc, 60 * sc, 28 * sc); g.beginPath(); g.arc(0, 8 * sc, 18 * sc, 0, 7); g.fill(); g.restore(); }
      for (const b of this.balls) { const y = L.floor - (b.high ? 60 : 16) * sc; g.fillStyle = '#111'; g.beginPath(); g.arc(b.x, y, 15 * sc, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.arc(b.x - 4, y - 4, 4, 0, 7); g.fill(); }
      if (this.alive[i]) { g.globalAlpha = p.inv > 0 && Math.sin(this.anim * 30) > 0 ? 0.4 : 1; this.stick(g, i, PX, L.floor - p.y * sc, sc, p.roll ? 'roll' : p.y > 0 ? 'jump' : 'idle'); g.globalAlpha = 1; }
    }
  }
}
