// 2. Obstacle Race — scies mobiles : toucher = sauter, tenir = ralentir
import { RunnerBase } from './runner.js';
import { rand } from '../core.js';
export default class ObstacleRace extends RunnerBase {
  setup() { this.speed = 360; let x = 700; while (x < this.trackLen - 200) { this.obs.push({ x, w: 50, ph: rand(0, 6), sp: rand(1.6, 2.6) }); x += rand(420, 640); } }
  sawY(o) { return (Math.sin(this.time * o.sp + o.ph) + 1) / 2 * 150; } // hauteur du bas de la scie
  speedOf(i) { return this.held[i] ? 140 : this.speed; }
  hits(p, o) { const sy = this.sawY(o); return p.d + 16 > o.x && p.d - 16 < o.x + o.w && p.y < sy + 50 && p.y + 75 > sy; }
  botLogic(i) {
    const p = this.r[i], o = this.nextObs(i); if (!o) { this.botHold(i, false); return; }
    const gap = o.x - p.d, sy = this.sawY(o);
    // si la scie est basse et proche : ralentir ; sinon foncer
    if (gap < 200 && gap > 40 && sy < 100 && sy > 20) this.botHold(i, true); else this.botHold(i, false);
    if (gap < 90 && gap > 0 && sy < 25 && p.y === 0) this.botTap(i, 0.2);
  }
  drawObs(g, o, sx, L) {
    const sc = Math.min(1, L.h / 150), y = L.floor - (this.sawY(o) + 25) * sc;
    g.strokeStyle = '#999'; g.lineWidth = 3; g.beginPath(); g.moveTo(sx + 25, L.y0 + 4); g.lineTo(sx + 25, y); g.stroke();
    g.save(); g.translate(sx + 25 * sc, y); g.rotate(this.anim * 10); g.fillStyle = '#d9d9d9'; g.strokeStyle = '#333';
    g.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 18 * sc : 27 * sc, a = k / 16 * Math.PI * 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#e63946'; g.beginPath(); g.arc(0, 0, 6 * sc, 0, 7); g.fill(); g.restore();
  }
}
