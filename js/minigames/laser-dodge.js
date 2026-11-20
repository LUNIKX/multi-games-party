// 6. Laser Dodge — lasers bas (toucher = sauter) et hauts (tenir = se baisser), ils clignotent
import { RunnerBase } from './runner.js';
import { rand, pick } from '../core.js';
import { sound } from '../audio.js';
export default class LaserDodge extends RunnerBase {
  setup() { this.speed = 340; this.pressT = []; let x = 650; while (x < this.trackLen - 200) { this.obs.push({ x, w: 14, high: Math.random() < 0.5, ph: rand(0, 3) }); x += rand(360, 560); } }
  on(o) { return Math.sin(this.time * 2.2 + o.ph) > -0.6; }
  onPress(i) { this.r[i].duck = true; this.pressT[i] = this.time; }
  onRelease(i) { const p = this.r[i]; p.duck = false; if (this.time - (this.pressT[i] || 0) < 0.2) this.jump(i); }
  hits(p, o) {
    if (!this.on(o) || p.d + 14 < o.x || p.d - 14 > o.x + o.w) return false;
    return o.high ? !p.duck && p.y < 80 : p.y < 40;
  }
  botLogic(i) {
    const p = this.r[i], o = this.nextObs(i); if (!o) { this.botHold(i, false); return; }
    const gap = o.x - p.d;
    if (o.high) this.botHold(i, gap < 160 && gap > -20);
    else if (gap < 90 && gap > 0 && p.y === 0 && !this.held[i]) this.botTap(i, 0.2);
  }
  drawObs(g, o, sx, L) {
    const sc = Math.min(1, L.h / 150), lo = o.high ? 55 : 0, hi = o.high ? L.h - 20 : 38;
    g.fillStyle = '#444'; g.fillRect(sx - 6, L.floor - hi * sc - 10, 26, 10); g.fillRect(sx - 6, L.floor - lo * sc, 26, 6);
    if (this.on(o)) { g.fillStyle = '#ff2e63'; g.globalAlpha = 0.6 + Math.sin(this.anim * 40) * 0.3; g.fillRect(sx, L.floor - hi * sc, o.w, (hi - lo) * sc); g.globalAlpha = 1; }
    else { g.strokeStyle = 'rgba(255,46,99,.3)'; g.setLineDash([4, 6]); g.strokeRect(sx, L.floor - hi * sc, o.w, (hi - lo) * sc); g.setLineDash([]); }
  }
}
