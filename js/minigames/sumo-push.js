// 8. Sumo Push — toucher = dash dans le sens de ta flèche, pousse les autres hors du ring
import { ArenaBase } from './arena.js';
import { W, H } from '../core.js';
const CX = 640, CY = 400, R = 280;
export default class SumoPush extends ArenaBase {
  init() { this.rankMode = 'elim'; this.makeBodies(CX, CY, 160); this.ringR = R; }
  scoreText(i) { return this.alive[i] ? '❤' : '✖'; }
  bots() {
    for (let i = 0; i < this.n; i++) if (this.isBot(i) && this.alive[i]) {
      const p = this.b[i], dc = Math.hypot(p.x - CX, p.y - CY);
      if (dc > this.ringR - 90) { this.aimAt(i, CX, CY, 0.5); continue; }
      let best = -1, bd = 1e9; for (let j = 0; j < this.n; j++) if (j !== i && this.alive[j]) { const d = Math.hypot(this.b[j].x - p.x, this.b[j].y - p.y); if (d < bd) { bd = d; best = j; } }
      if (best >= 0) this.aimAt(i, this.b[best].x, this.b[best].y);
    }
  }
  update(dt) {
    this.ringR = Math.max(170, R - Math.max(0, this.time - 20) * 3);
    this.physics(dt);
    for (let i = 0; i < this.n; i++) if (this.alive[i] && Math.hypot(this.b[i].x - CX, this.b[i].y - CY) > this.ringR + 10) { this.burst(this.b[i].x, this.b[i].y, this.color(i), 20); this.eliminate(i); }
  }
  draw(g) {
    g.fillStyle = '#264653'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e9c46a'; g.beginPath(); g.ellipse(CX, CY, this.ringR + 20, this.ringR + 20, 0, 0, 7); g.fill();
    g.fillStyle = '#f4e3b2'; g.beginPath(); g.arc(CX, CY, this.ringR, 0, 7); g.fill();
    g.strokeStyle = '#b5651d'; g.lineWidth = 8; g.stroke();
    g.strokeStyle = 'rgba(181,101,29,.4)'; g.lineWidth = 4; g.beginPath(); g.moveTo(CX - 40, CY); g.lineTo(CX + 40, CY); g.stroke();
    for (let i = 0; i < this.n; i++) this.drawBody(g, i);
  }
}
