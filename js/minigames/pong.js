// 15. Pong Party — ta raquette avance seule, toucher = inverser son sens. 3 vies.
import { MiniGameBase } from './base.js';
import { W, H, rand, clamp, text } from '../core.js';
import { sound } from '../audio.js';
const X0 = 240, X1 = 1040, Y0 = 80, Y1 = 700, PL = 130;
export default class Pong extends MiniGameBase {
  init() {
    this.rankMode = 'elim'; this.sides = ['L', 'R', 'T', 'B'].slice(0, this.n);
    this.pad = this.players.map((_, i) => ({ pos: 0.5, dir: i % 2 ? 1 : -1, lives: 3 }));
    this.reset();
  }
  reset() { const a = rand(0, Math.PI * 2); this.ball = { x: (X0 + X1) / 2, y: (Y0 + Y1) / 2, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380 }; if (Math.abs(this.ball.vx) < 150) this.ball.vx = 200; this.wait = 0.8; }
  scoreText(i) { return '❤'.repeat(this.pad[i].lives) || '✖'; }
  onPress(i) { this.pad[i].dir *= -1; sound.tap(); }
  sideOf(s) { return this.sides.indexOf(s); }
  // position pixel de la raquette sur son côté
  padXY(i) { const s = this.sides[i], p = this.pad[i].pos; if (s === 'L') return { x: X0, y: Y0 + p * (Y1 - Y0) }; if (s === 'R') return { x: X1, y: Y0 + p * (Y1 - Y0) }; if (s === 'T') return { x: X0 + p * (X1 - X0), y: Y0 }; return { x: X0 + p * (X1 - X0), y: Y1 }; }
  bots() {
    for (let i = 0; i < this.n; i++) if (this.isBot(i) && this.alive[i]) {
      const s = this.sides[i], b = this.ball, pp = this.padXY(i), target = (s === 'L' || s === 'R') ? b.y : b.x, cur = (s === 'L' || s === 'R') ? pp.y : pp.x;
      const moving = this.pad[i].dir; if ((target - cur) * moving < -30) this.botTap(i, 0.4);
    }
  }
  update(dt) {
    for (let i = 0; i < this.n; i++) { const p = this.pad[i]; if (!this.alive[i]) continue; p.pos += p.dir * 0.75 * dt; if (p.pos < 0.1 || p.pos > 0.9) { p.dir *= -1; p.pos = clamp(p.pos, 0.1, 0.9); } }
    if (this.wait > 0) { this.wait -= dt; return; }
    const b = this.ball; b.x += b.vx * dt; b.y += b.vy * dt;
    const wall = (s) => { const k = this.sideOf(s); return k < 0 || !this.alive[k] ? -1 : k; };
    const test = (s, out, axis) => {
      const k = wall(s);
      if (k < 0) { if (axis === 'x') b.vx *= -1; else b.vy *= -1; sound.beat(200); return; }
      const pp = this.padXY(k), off = axis === 'x' ? b.y - pp.y : b.x - pp.x;
      if (Math.abs(off) < PL / 2 + 12) { if (axis === 'x') { b.vx *= -1.06; b.vy += off * 4; } else { b.vy *= -1.06; b.vx += off * 4; } sound.good(); this.burst(b.x, b.y, this.color(k), 8); }
      else { this.pad[k].lives--; sound.bad(); this.shake = 0.2; if (this.pad[k].lives <= 0) this.eliminate(k); this.reset(); return true; }
    };
    if (b.x < X0 + 10) { b.x = X0 + 10; if (test('L', 0, 'x')) return; }
    if (b.x > X1 - 10) { b.x = X1 - 10; if (test('R', 0, 'x')) return; }
    if (b.y < Y0 + 10) { b.y = Y0 + 10; if (test('T', 0, 'y')) return; }
    if (b.y > Y1 - 10) { b.y = Y1 - 10; if (test('B', 0, 'y')) return; }
    const sp = Math.hypot(b.vx, b.vy); if (sp > 900) { b.vx *= 900 / sp; b.vy *= 900 / sp; }
  }
  draw(g) {
    g.fillStyle = '#0d1b2a'; g.fillRect(0, 0, W, H); g.fillStyle = '#1b263b'; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    g.strokeStyle = 'rgba(255,255,255,.15)'; g.setLineDash([12, 12]); g.beginPath(); g.moveTo(640, Y0); g.lineTo(640, Y1); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#778da9'; for (const s of ['L', 'R', 'T', 'B']) { const k = this.sideOf(s); if (k >= 0 && this.alive[k]) continue; if (s === 'L') g.fillRect(X0 - 10, Y0, 10, Y1 - Y0); if (s === 'R') g.fillRect(X1, Y0, 10, Y1 - Y0); if (s === 'T') g.fillRect(X0, Y0 - 10, X1 - X0, 10); if (s === 'B') g.fillRect(X0, Y1, X1 - X0, 10); }
    for (let i = 0; i < this.n; i++) {
      if (!this.alive[i]) continue; const pp = this.padXY(i), s = this.sides[i]; g.fillStyle = this.color(i);
      if (s === 'L' || s === 'R') g.fillRect(pp.x - 9, pp.y - PL / 2, 18, PL); else g.fillRect(pp.x - PL / 2, pp.y - 9, PL, 18);
      const sx = s === 'L' ? pp.x - 70 : s === 'R' ? pp.x + 70 : pp.x, sy = s === 'T' ? pp.y + 0 : s === 'B' ? pp.y + 0 : pp.y + 35;
      if (s === 'L' || s === 'R') this.stick(g, i, sx, sy, 0.6, 'idle', s === 'L' ? 1 : -1);
    }
    const b = this.ball; g.fillStyle = '#fff'; g.shadowColor = '#fff'; g.shadowBlur = 16; g.beginPath(); g.arc(b.x, b.y, 11, 0, 7); g.fill(); g.shadowBlur = 0;
  }
}
