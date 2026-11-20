// 10. Dodge Rain — des objets tombent : toucher = changer de couloir (3 couloirs, 3 vies)
import { MiniGameBase } from './base.js';
import { W, H, rand, randi, pick } from '../core.js';
import { column, TOP } from './helpers.js';
import { sound } from '../audio.js';
const GROUND = 620, ITEMS = ['🪨', '🧱', '🍉', '⚓', '🎳'];
export default class DodgeRain extends MiniGameBase {
  init() {
    this.rankMode = 'elim';
    this.p = this.players.map(() => ({ lane: 1, x: 1, lives: 3, inv: 0, dir: 1 }));
    this.drops = this.players.map(() => []); this.next = 0.8;
  }
  scoreText(i) { return '❤'.repeat(this.p[i].lives) || '✖'; }
  onPress(i) { const p = this.p[i]; if (p.lane === 2) p.dir = -1; if (p.lane === 0) p.dir = 1; p.lane += p.dir; sound.tap(); }
  bots() {
    for (let i = 0; i < this.n; i++) if (this.isBot(i) && this.alive[i]) {
      const p = this.p[i], danger = this.drops[i].some(d => d.lane === p.lane && d.y > GROUND - 360 && d.y < GROUND);
      const nextLane = p.lane + ((p.lane === 2) ? -1 : (p.lane === 0) ? 1 : p.dir);
      const nextDanger = this.drops[i].some(d => d.lane === nextLane && d.y > GROUND - 260);
      if (danger && !nextDanger) this.botTap(i, 0.4);
    }
  }
  update(dt) {
    this.next -= dt;
    if (this.next <= 0) {
      const lane = randi(0, 2), sp = 320 + this.time * 7, it = pick(ITEMS);
      for (let i = 0; i < this.n; i++) this.drops[i].push({ lane, y: TOP, sp, it }); // même pluie pour tous (équitable)
      this.next = Math.max(0.35, 1.1 - this.time / 60);
    }
    for (let i = 0; i < this.n; i++) {
      const p = this.p[i]; p.x += (p.lane - p.x) * Math.min(1, dt * 14); if (p.inv > 0) p.inv -= dt;
      for (const d of this.drops[i]) {
        d.y += d.sp * dt;
        if (!d.done && d.y > GROUND - 70 && d.y < GROUND && Math.abs(p.x - d.lane) < 0.45 && this.alive[i] && p.inv <= 0) {
          d.done = true; p.lives--; p.inv = 1; sound.hit(); this.burst(this.cx(i, d.lane), GROUND - 40, '#fff', 12); if (p.lives <= 0) this.eliminate(i);
        }
      }
      this.drops[i] = this.drops[i].filter(d => d.y < H + 40 && !d.done);
    }
  }
  cx(i, l) { const c = column(i, this.n); return c.x0 + c.w * (0.2 + l * 0.3); }
  draw(g) {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#355c7d'); gr.addColorStop(1, '#6c5b7b'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < this.n; i++) {
      const c = column(i, this.n), p = this.p[i];
      g.fillStyle = 'rgba(255,255,255,.05)'; for (let l = 0; l < 3; l++) g.fillRect(this.cx(i, l) - c.w * 0.13, TOP, c.w * 0.26, GROUND - TOP);
      g.fillStyle = this.color(i); g.fillRect(c.x0 + 6, GROUND, c.w - 12, 12);
      g.font = '46px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (const d of this.drops[i]) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(this.cx(i, d.lane), GROUND + 2, 10 + (d.y / GROUND) * 22, 6, 0, 0, 7); g.fill(); g.fillText(d.it, this.cx(i, d.lane), d.y - 20); }
      if (this.alive[i]) { g.globalAlpha = p.inv > 0 && Math.sin(this.anim * 30) > 0 ? 0.4 : 1; this.stick(g, i, c.x0 + c.w * (0.2 + p.x * 0.3), GROUND, 0.85, Math.abs(p.lane - p.x) > 0.05 ? 'run' : 'idle', p.dir); g.globalAlpha = 1; }
      if (i > 0) { g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(c.x0 - 2, TOP, 4, H); }
    }
  }
}
