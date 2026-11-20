// 1. Race Stickman — toucher = sauter les caisses, premier à l'arrivée
import { RunnerBase } from './runner.js';
import { rand } from '../core.js';
export default class Race extends RunnerBase {
  setup() { let x = 600; while (x < this.trackLen - 200) { this.obs.push({ x, w: 44, h: rand(36, 56) }); x += rand(300, 560); } }
  hits(p, o) { return p.d + 18 > o.x && p.d - 18 < o.x + o.w && p.y < o.h; }
  drawObs(g, o, sx, L) {
    const sc = Math.min(1, L.h / 150), h = o.h * sc;
    g.fillStyle = '#c47a2c'; g.strokeStyle = '#5a3210'; g.lineWidth = 4; g.fillRect(sx - 4, L.floor - h, o.w * sc, h); g.strokeRect(sx - 4, L.floor - h, o.w * sc, h);
    g.beginPath(); g.moveTo(sx - 4, L.floor - h); g.lineTo(sx - 4 + o.w * sc, L.floor); g.stroke();
  }
}
