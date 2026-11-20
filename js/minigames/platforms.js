// 3. Platforms — trous dans le sol, double saut possible
import { RunnerBase } from './runner.js';
import { rand } from '../core.js';
export default class Platforms extends RunnerBase {
  setup() { this.maxJumps = 2; this.jumpV = 700; let x = 600; while (x < this.trackLen - 300) { const w = rand(110, 230); this.obs.push({ x, w, gap: true }); x += w + rand(260, 480); } }
  ground(p) { return !this.obs.some(o => p.d > o.x + 6 && p.d < o.x + o.w - 6); }
  safeBack(d) { const o = this.obs.find(o => d > o.x - 10 && d < o.x + o.w + 10); return o ? o.x - 120 : d - 120; }
  botLogic(i) {
    const p = this.r[i], o = this.obs.find(o => o.x + o.w > p.d && o.x > p.d - 5); if (!o) return;
    const gap = o.x - p.d;
    if (p.y === 0 && gap < 70 && gap > 0) this.botTap(i, 0.15);
    else if (p.y > 0 && p.jumps === 1 && p.vy > 0 && o.w > 170 && p.d < o.x + o.w - 100) this.botTap(i, 0.1);
  }
  drawObs(g, o, sx, L) {
    const sc = Math.min(1, L.h / 150);
    g.fillStyle = '#1b1035'; g.fillRect(sx, L.floor, o.w, 14);
    g.fillStyle = '#ff7b00'; for (let k = 0; k < o.w; k += 20) { g.beginPath(); g.moveTo(sx + k, L.floor + 14); g.lineTo(sx + k + 10, L.floor + 4 + Math.sin(this.anim * 8 + k) * 3); g.lineTo(sx + k + 20, L.floor + 14); g.fill(); }
  }
}
