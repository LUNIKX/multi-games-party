// 12. Tug of War — tape vite pour tirer le nœud vers toi
import { MiniGameBase } from './base.js';
import { W, H, text } from '../core.js';
import { sound } from '../audio.js';
const CX = 640, CY = 400;
export default class TugOfWar extends MiniGameBase {
  init() { this.knot = { x: CX, y: CY }; this.anchors = this.players.map((_, i) => { const a = this.n === 2 ? (i ? 0 : Math.PI) : Math.PI + i / this.n * Math.PI * 2; return { x: CX + Math.cos(a) * 470, y: CY + Math.sin(a) * 260 }; }); this.pulse = this.players.map(() => 0); this.botRate = 0; }
  scoreText(i) { return Math.round(this.scores[i]) + '%'; }
  onPress(i) { const a = this.anchors[i], dx = a.x - this.knot.x, dy = a.y - this.knot.y, d = Math.hypot(dx, dy) || 1; this.knot.x += dx / d * 9; this.knot.y += dy / d * 9; this.pulse[i] = 0.12; sound.tap(); }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i)) { if (Math.random() < (2 + this.bot.skill * 7) / 60) { this.press(i); this.release(i); } } }
  update(dt) {
    for (let i = 0; i < this.n; i++) {
      if (this.pulse[i] > 0) this.pulse[i] -= dt;
      const a = this.anchors[i], d0 = Math.hypot(a.x - CX, a.y - CY), d = Math.hypot(a.x - this.knot.x, a.y - this.knot.y);
      this.scores[i] = Math.max(0, Math.min(100, (d0 - d) / (d0 - 110) * 100));
      if (d < 110) { this.scores[i] = 100; this.finish(); }
    }
  }
  draw(g) {
    g.fillStyle = '#386641'; g.fillRect(0, 0, W, H); g.fillStyle = '#6a994e'; g.beginPath(); g.arc(CX, CY, 90, 0, 7); g.fill();
    for (let i = 0; i < this.n; i++) {
      const a = this.anchors[i];
      g.strokeStyle = '#d4a373'; g.lineWidth = 10; g.beginPath(); g.moveTo(a.x, a.y - 40); g.lineTo(this.knot.x, this.knot.y); g.stroke();
      g.fillStyle = this.color(i); g.globalAlpha = 0.3; g.beginPath(); g.arc(a.x, a.y, 110, 0, 7); g.fill(); g.globalAlpha = 1;
      this.stick(g, i, a.x + (this.pulse[i] > 0 ? (a.x - CX) * 0.03 : 0), a.y, 1.2, this.pulse[i] > 0 ? 'jump' : 'idle', a.x < CX ? 1 : -1);
    }
    g.fillStyle = '#e63946'; g.beginPath(); g.arc(this.knot.x, this.knot.y, 22, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke();
    text(g, this.opts.lang === 'en' ? 'TAP FAST!' : 'TAPE VITE !', CX, 670, 34, '#ffd60a');
  }
}
