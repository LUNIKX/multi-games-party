// 9. King of the Hill — reste dans la zone mobile pour marquer des points (dash)
import { ArenaBase } from './arena.js';
import { W, H, clamp } from '../core.js';
import { sound } from '../audio.js';
export default class KingHill extends ArenaBase {
  init() { this.makeBodies(640, 400, 250); this.z = { x: 640, y: 400, r: 110 }; this.tick5 = 0; }
  scoreText(i) { return this.scores[i].toFixed(1); }
  zonePos() { const t = this.time * 0.35; return { x: 640 + Math.sin(t * 1.3) * 380, y: 400 + Math.sin(t * 2.1) * 180 }; }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i)) { const p = this.b[i]; if (Math.hypot(p.x - this.z.x, p.y - this.z.y) > this.z.r * 0.6) this.aimAt(i, this.z.x, this.z.y); else { for (let j = 0; j < this.n; j++) if (j !== i && Math.hypot(this.b[j].x - p.x, this.b[j].y - p.y) < 120) this.aimAt(i, this.b[j].x, this.b[j].y, 0.25); } } }
  update(dt) {
    Object.assign(this.z, this.zonePos()); this.physics(dt, 2.6);
    for (let i = 0; i < this.n; i++) {
      const p = this.b[i];
      if (p.x < 40 || p.x > W - 40) { p.vx *= -0.8; p.x = clamp(p.x, 40, W - 40); }
      if (p.y < 100 || p.y > H - 70) { p.vy *= -0.8; p.y = clamp(p.y, 100, H - 70); }
      const inside = Math.hypot(p.x - this.z.x, p.y - this.z.y) < this.z.r;
      const count = this.b.filter(q => Math.hypot(q.x - this.z.x, q.y - this.z.y) < this.z.r).length;
      if (inside && count === 1) this.scores[i] += dt; // seul dans la zone = roi !
    }
    this.tick5 += dt; if (this.tick5 > 1) { this.tick5 = 0; sound.beat(330); }
  }
  draw(g) {
    g.fillStyle = '#2d6a4f'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.05)'; for (let x = 0; x < W; x += 80) for (let y = 70; y < H; y += 80) if ((x + y) / 80 % 2 === 0) g.fillRect(x, y, 80, 80);
    const owners = this.b.filter(q => Math.hypot(q.x - this.z.x, q.y - this.z.y) < this.z.r);
    g.fillStyle = owners.length === 1 ? 'rgba(255,214,10,.45)' : 'rgba(255,255,255,.2)';
    g.beginPath(); g.arc(this.z.x, this.z.y, this.z.r, 0, 7); g.fill(); g.strokeStyle = '#ffd60a'; g.lineWidth = 6; g.setLineDash([14, 10]); g.lineDashOffset = -this.anim * 40; g.stroke(); g.setLineDash([]);
    g.font = '50px serif'; g.textAlign = 'center'; g.fillText('👑', this.z.x, this.z.y - this.z.r - 10);
    for (let i = 0; i < this.n; i++) this.drawBody(g, i);
  }
}
