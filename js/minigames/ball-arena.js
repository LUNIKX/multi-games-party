// 14. Ball Arena — dash pour pousser la balle dans le but adverse ; défends le tien
import { ArenaBase } from './arena.js';
import { W, H, clamp } from '../core.js';
import { sound } from '../audio.js';
const X0 = 140, X1 = 1140, Y0 = 90, Y1 = 690, GW = 200;
export default class BallArena extends ArenaBase {
  init() {
    this.makeBodies(640, 390, 200); this.ball = { x: 640, y: 390, vx: 0, vy: 0, r: 24 }; this.last = -1;
    // but de chaque joueur : gauche, droite, haut, bas
    this.goal = ['L', 'R', 'T', 'B'].slice(0, this.n);
  }
  inGoal(side, x, y) { const cx = 640, cy = 390; if (side === 'L') return x < X0 && Math.abs(y - cy) < GW / 2; if (side === 'R') return x > X1 && Math.abs(y - cy) < GW / 2; if (side === 'T') return y < Y0 && Math.abs(x - cx) < GW / 2; return y > Y1 && Math.abs(x - cx) < GW / 2; }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i)) this.aimAt(i, this.ball.x, this.ball.y, 0.3); }
  update(dt) {
    this.physics(dt, 2.4); const b = this.ball;
    for (let i = 0; i < this.n; i++) {
      const p = this.b[i]; if (p.x < X0 + 30 || p.x > X1 - 30) { p.vx *= -0.7; p.x = clamp(p.x, X0 + 30, X1 - 30); } if (p.y < Y0 + 30 || p.y > Y1 - 30) { p.vy *= -0.7; p.y = clamp(p.y, Y0 + 30, Y1 - 30); }
      const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (d < p.r + b.r) { const nx = dx / d, ny = dy / d, ov = p.r + b.r - d; b.x += nx * ov; b.y += ny * ov; const rel = (p.vx - b.vx) * nx + (p.vy - b.vy) * ny; if (rel > 0) { b.vx += nx * rel * 1.6; b.vy += ny * rel * 1.6; this.last = i; sound.tap(); } }
    }
    b.x += b.vx * dt; b.y += b.vy * dt; const f = Math.exp(-0.9 * dt); b.vx *= f; b.vy *= f;
    for (let i = 0; i < this.n; i++) if (this.inGoal(this.goal[i], b.x, b.y)) {
      this.scores[i]--; if (this.last >= 0 && this.last !== i) this.scores[this.last] += 2;
      this.say('BUT !'); sound.win(); this.burst(b.x, b.y, this.color(i), 30); Object.assign(b, { x: 640, y: 390, vx: 0, vy: 0 }); this.last = -1; return;
    }
    const open = s => this.goal.includes(s);
    if ((b.x < X0 + b.r && !(open('L') && Math.abs(b.y - 390) < GW / 2)) || (b.x > X1 - b.r && !(open('R') && Math.abs(b.y - 390) < GW / 2))) { b.vx *= -0.9; b.x = clamp(b.x, X0 + b.r, X1 - b.r); }
    if ((b.y < Y0 + b.r && !(open('T') && Math.abs(b.x - 640) < GW / 2)) || (b.y > Y1 - b.r && !(open('B') && Math.abs(b.x - 640) < GW / 2))) { b.vy *= -0.9; b.y = clamp(b.y, Y0 + b.r, Y1 - b.r); }
  }
  draw(g) {
    g.fillStyle = '#14213d'; g.fillRect(0, 0, W, H); g.fillStyle = '#1f4e79'; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    g.strokeStyle = '#8ecae6'; g.lineWidth = 6; g.strokeRect(X0, Y0, X1 - X0, Y1 - Y0);
    this.goal.forEach((s, i) => { g.fillStyle = this.color(i); if (s === 'L') g.fillRect(X0 - 30, 390 - GW / 2, 30, GW); if (s === 'R') g.fillRect(X1, 390 - GW / 2, 30, GW); if (s === 'T') g.fillRect(640 - GW / 2, Y0 - 24, GW, 24); if (s === 'B') g.fillRect(640 - GW / 2, Y1, GW, 24); });
    for (let i = 0; i < this.n; i++) this.drawBody(g, i, 0.7);
    const b = this.ball; g.fillStyle = '#ffd60a'; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
  }
}
