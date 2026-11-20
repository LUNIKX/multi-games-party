// 5. Gravity Flip — toucher = inverser la gravité, évite les pics au sol et au plafond
import { MiniGameBase } from './base.js';
import { W, rand, text } from '../core.js';
import { lane, sky } from './helpers.js';
import { sound } from '../audio.js';
export default class GravityFlip extends MiniGameBase {
  init() {
    this.rankMode = 'elim'; this.dist = 0; this.speed = 320;
    this.g = this.players.map(() => ({ up: false, y: 0, vy: 0 })); // y 0 = sol, 1 = plafond
    this.spikes = []; let x = 700; for (let k = 0; k < 400; k++) { this.spikes.push({ x, top: Math.random() < 0.5, w: rand(40, 90) }); x += rand(220, 420); }
  }
  scoreText(i) { return Math.floor(this.scores[i] / 10) + 'm'; }
  onPress(i) { this.g[i].up = !this.g[i].up; sound.jump(); }
  bots() {
    for (let i = 0; i < this.n; i++) if (this.isBot(i) && this.alive[i]) {
      const p = this.g[i], s = this.spikes.find(s => s.x + s.w > this.dist + 200 - 20 && s.x > this.dist + 170);
      if (s && s.x - (this.dist + 200) < 140 && s.top === p.up) this.botTap(i, 0.3);
    }
  }
  update(dt) {
    this.speed += dt * 6; this.dist += this.speed * dt;
    for (let i = 0; i < this.n; i++) {
      if (!this.alive[i]) continue; const p = this.g[i];
      const target = p.up ? 1 : 0; p.y += (target - p.y) * Math.min(1, dt * 10);
      this.scores[i] = this.dist;
      for (const s of this.spikes) {
        const px = this.dist + 200; if (px + 14 > s.x && px - 14 < s.x + s.w) {
          if ((s.top && p.y > 0.75) || (!s.top && p.y < 0.25)) { this.burst(200, lane(i, this.n).floor - 40, this.color(i), 16); this.eliminate(i); }
        }
      }
    }
  }
  draw(g) {
    sky(g, '#0b0033', '#370617', this.anim);
    for (let i = 0; i < this.n; i++) {
      const L = lane(i, this.n), ceil = L.y0 + 10, floor = L.floor, p = this.g[i];
      g.fillStyle = this.color(i); g.fillRect(0, ceil - 10, W, 10); g.fillRect(0, floor, W, 10);
      g.fillStyle = '#eee';
      for (const s of this.spikes) {
        const sx = s.x - this.dist; if (sx < -100 || sx > W) continue;
        g.beginPath();
        for (let k = 0; k < s.w; k += 20) { if (s.top) { g.moveTo(sx + k, ceil); g.lineTo(sx + k + 10, ceil + 26); g.lineTo(sx + k + 20, ceil); } else { g.moveTo(sx + k, floor); g.lineTo(sx + k + 10, floor - 26); g.lineTo(sx + k + 20, floor); } }
        g.fill();
      }
      const sc = Math.min(0.9, L.h / 170), yy = floor + (ceil - floor) * p.y;
      g.save(); g.translate(200, yy); if (p.y > 0.5) g.scale(1, -1);
      if (this.alive[i]) this.stick(g, i, 0, 0, sc, 'run'); g.restore();
    }
  }
}
