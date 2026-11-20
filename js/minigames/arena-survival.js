// 7. Arena Survival — la plateforme rétrécit, des barres balaient le sol : toucher = sauter
import { MiniGameBase } from './base.js';
import { W, H, rand, clamp, text } from '../core.js';
import { sky } from './helpers.js';
import { sound } from '../audio.js';
const FLOOR = 520;
export default class ArenaSurvival extends MiniGameBase {
  init() {
    this.rankMode = 'elim'; this.half = 560; this.bars = []; this.next = 2;
    this.p = this.players.map((_, i) => ({ x: W / 2 - 300 + i * 200, dir: i % 2 ? -1 : 1, y: 0, vy: 0, push: 0 }));
  }
  scoreText(i) { return this.alive[i] ? '❤' : '✖'; }
  onPress(i) { const p = this.p[i]; if (p.y === 0) { p.vy = 820; sound.jump(); } }
  bots() {
    for (let i = 0; i < this.n; i++) if (this.isBot(i) && this.alive[i]) {
      const p = this.p[i];
      for (const b of this.bars) { const d = (p.x - b.x) * b.dir; if (d > 0 && d < 30 + b.sp * 0.2) this.botTap(i, 0.2); }
    }
  }
  update(dt) {
    this.half = Math.max(160, 560 - this.time * 9);
    this.next -= dt;
    if (this.next <= 0) { const dir = Math.random() < 0.5 ? 1 : -1, sp = 360 + this.time * 6; this.bars.push({ x: dir > 0 ? -40 : W + 40, dir, sp }); this.next = rand(1.3, 2.6) - Math.min(0.8, this.time / 60); }
    for (const b of this.bars) b.x += b.dir * b.sp * dt;
    this.bars = this.bars.filter(b => b.x > -80 && b.x < W + 80);
    for (let i = 0; i < this.n; i++) {
      if (!this.alive[i]) continue; const p = this.p[i];
      p.x += (p.dir * 130 + p.push) * dt; p.push *= Math.exp(-3 * dt);
      if (Math.abs(p.x - W / 2) > this.half - 40 && Math.sign(p.x - W / 2) === p.dir) p.dir *= -1;
      p.vy -= 2400 * dt; p.y = Math.max(0, p.y + p.vy * dt); if (p.y === 0) p.vy = 0;
      for (const b of this.bars) if (Math.abs(b.x - p.x) < 22 && p.y < 40 && !b['h' + i]) { b['h' + i] = 1; p.push = b.dir * 900; sound.hit(); this.burst(p.x, FLOOR - 30, '#fff', 10); }
      if (Math.abs(p.x - W / 2) > this.half + 10) { p.y = -1; this.eliminate(i); }
    }
  }
  draw(g) {
    sky(g, '#1d2671', '#c33764', this.anim);
    g.fillStyle = '#ff4500'; g.fillRect(0, FLOOR + 80, W, H); // lave
    g.fillStyle = '#6c757d'; g.fillRect(W / 2 - this.half, FLOOR, this.half * 2, 26); g.fillStyle = '#495057'; g.fillRect(W / 2 - this.half, FLOOR + 26, this.half * 2, 50);
    g.fillStyle = '#ffd60a'; for (const b of this.bars) { g.fillRect(b.x - 10, FLOOR - 34, 20, 34); g.fillStyle = 'rgba(255,214,10,.3)'; g.fillRect(b.x - 10 - b.dir * 40, FLOOR - 30, 40, 26); g.fillStyle = '#ffd60a'; }
    for (let i = 0; i < this.n; i++) if (this.alive[i]) { const p = this.p[i]; this.stick(g, i, p.x, FLOOR - p.y, 1, p.y > 0 ? 'jump' : Math.abs(p.push) > 200 ? 'stun' : 'run', p.dir); }
  }
}
