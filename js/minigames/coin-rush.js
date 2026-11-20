// 16. Coin Rush — tu avances seul, toucher = tourner de 90°. Ramasse un max de pièces !
import { MiniGameBase } from './base.js';
import { W, H, rand, clamp } from '../core.js';
import { sound } from '../audio.js';
const X0 = 40, X1 = 1240, Y0 = 90, Y1 = 680, DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
export default class CoinRush extends MiniGameBase {
  init() {
    this.p = this.players.map((_, i) => ({ x: i % 2 ? 1000 : 280, y: i < 2 ? 220 : 560, d: i % 4 }));
    this.coins = Array.from({ length: 14 }, () => this.spawn({})); this.bombs = Array.from({ length: 3 }, () => ({ x: rand(200, 1080), y: rand(150, 620), vx: rand(-150, 150), vy: rand(-150, 150) }));
  }
  spawn(c) { c.x = rand(X0 + 30, X1 - 30); c.y = rand(Y0 + 30, Y1 - 30); c.gold = Math.random() < 0.15; return c; }
  onPress(i) { const p = this.p[i]; p.d = (p.d + 1) % 4; sound.tap(); }
  bots() {
    for (let i = 0; i < this.n; i++) if (this.isBot(i)) {
      const p = this.p[i]; let best = null, bd = 1e9; for (const c of this.coins) { const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bd) { bd = d; best = c; } }
      const [dx, dy] = DIRS[p.d], ahead = (best.x - p.x) * dx + (best.y - p.y) * dy, side = Math.abs((best.x - p.x) * dy - (best.y - p.y) * dx);
      const nearWall = p.x + dx * 60 < X0 || p.x + dx * 60 > X1 || p.y + dy * 60 < Y0 || p.y + dy * 60 > Y1;
      if (nearWall || ahead < -10 || (side > 40 && ahead < 20)) this.botTap(i, 0.4);
    }
  }
  update(dt) {
    for (let i = 0; i < this.n; i++) {
      const p = this.p[i], [dx, dy] = DIRS[p.d]; p.x += dx * 260 * dt; p.y += dy * 260 * dt;
      if (p.x < X0 + 20 || p.x > X1 - 20 || p.y < Y0 + 20 || p.y > Y1 - 20) { p.d = (p.d + 2) % 4; p.x = clamp(p.x, X0 + 20, X1 - 20); p.y = clamp(p.y, Y0 + 20, Y1 - 20); }
      for (const c of this.coins) if (Math.hypot(c.x - p.x, c.y - (p.y - 25)) < 40) { this.scores[i] += c.gold ? 5 : 1; sound.coin(); this.burst(c.x, c.y, '#ffd60a', 8); this.spawn(c); }
      for (const b of this.bombs) if (Math.hypot(b.x - p.x, b.y - (p.y - 25)) < 38 && !p.hitT) { this.scores[i] = Math.max(0, this.scores[i] - 3); p.hitT = 1; sound.hit(); this.burst(p.x, p.y - 25, '#ff4d6d', 14); }
      if (p.hitT) { p.hitT -= dt; if (p.hitT <= 0) p.hitT = 0; }
    }
    for (const b of this.bombs) { b.x += b.vx * dt; b.y += b.vy * dt; if (b.x < X0 || b.x > X1) b.vx *= -1; if (b.y < Y0 || b.y > Y1) b.vy *= -1; }
  }
  draw(g) {
    g.fillStyle = '#3d348b'; g.fillRect(0, 0, W, H); g.fillStyle = '#7678ed'; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    g.fillStyle = 'rgba(255,255,255,.07)'; for (let x = X0; x < X1; x += 60) g.fillRect(x, Y0, 2, Y1 - Y0);
    for (const c of this.coins) { const s = Math.abs(Math.cos(this.anim * 4 + c.x)); g.fillStyle = c.gold ? '#ff9f1c' : '#ffd60a'; g.beginPath(); g.ellipse(c.x, c.y, 14 * s + 3, c.gold ? 18 : 14, 0, 0, 7); g.fill(); g.strokeStyle = '#b5838d'; g.lineWidth = 2; g.stroke(); }
    g.font = '40px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (const b of this.bombs) g.fillText('💣', b.x, b.y);
    for (let i = 0; i < this.n; i++) { const p = this.p[i]; g.globalAlpha = p.hitT ? 0.5 : 1; this.stick(g, i, p.x, p.y, 0.7, 'run', DIRS[p.d][0] < 0 ? -1 : 1); g.globalAlpha = 1; const [dx, dy] = DIRS[p.d]; g.fillStyle = this.color(i); g.beginPath(); g.arc(p.x + dx * 40, p.y - 25 + dy * 40, 7, 0, 7); g.fill(); }
  }
}
