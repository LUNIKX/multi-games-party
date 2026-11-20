// 17. Basket Shoot — la jauge de puissance oscille, toucher = tirer au bon moment
import { MiniGameBase } from './base.js';
import { W, H, rand, text } from '../core.js';
import { column, TOP } from './helpers.js';
import { sound } from '../audio.js';
const GY = 640;
export default class Basket extends MiniGameBase {
  init() { this.s = this.players.map((_, i) => ({ pw: 0, dir: 1, ball: null, msg: 0, hoop: 0.5, hv: 0, ok: false })); }
  // puissance idéale (0..1) selon la position du panier
  ideal(i) { return 0.35 + this.s[i].hoop * 0.5; }
  onPress(i) {
    const s = this.s[i]; if (s.ball) return; const c = column(i, this.n);
    const err = Math.abs(s.pw - this.ideal(i)); s.ok = err < 0.07;
    s.ball = { t: 0, x0: c.x0 + c.w * 0.18, y0: GY - 80, pw: s.pw }; sound.jump();
  }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i) && !this.s[i].ball) { const s = this.s[i]; const lead = s.dir * 0.12 * (1 - this.bot.skill * 0.6); if (Math.abs(s.pw + lead - this.ideal(i)) < 0.04) this.botTap(i, 0.05); } }
  hoopXY(i) { const c = column(i, this.n); return { x: c.x0 + c.w * (0.55 + this.s[i].hoop * 0.33), y: 300 - this.s[i].hoop * 80 }; }
  update(dt) {
    for (let i = 0; i < this.n; i++) {
      const s = this.s[i]; s.pw += s.dir * dt * (0.9 + this.time / 60); if (s.pw > 1) { s.pw = 1; s.dir = -1; } if (s.pw < 0) { s.pw = 0; s.dir = 1; }
      if (this.time > 15) s.hoop = 0.5 + Math.sin(this.time * 0.8 + i) * 0.5; else s.hoop = 0.5;
      if (s.msg > 0) s.msg -= dt;
      if (s.ball) {
        s.ball.t += dt / 0.9; if (s.ball.t >= 1) { if (s.ok) { this.scores[i] += 2; sound.coin(); const h = this.hoopXY(i); this.burst(h.x, h.y, '#ffd60a', 14); } else sound.bad(); s.msg = 0.7; s.lastOk = s.ok; s.ball = null; }
      }
    }
  }
  draw(g) {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#5f0f40'); gr.addColorStop(1, '#9a031e'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < this.n; i++) {
      const c = column(i, this.n), s = this.s[i], h = this.hoopXY(i);
      g.fillStyle = '#c9a227'; g.fillRect(c.x0 + 4, GY, c.w - 8, 20);
      g.fillStyle = '#eee'; g.fillRect(h.x + 30, h.y - 70, 8, 70 + (GY - h.y)); g.fillRect(h.x + 10, h.y - 70, 40, 56);
      g.strokeStyle = '#ff5400'; g.lineWidth = 5; g.beginPath(); g.ellipse(h.x, h.y, 30, 8, 0, 0, 7); g.stroke();
      // jauge
      const bx = c.x0 + 14, by = 120, bh = 380; g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(bx, by, 22, bh);
      const id = this.ideal(i); g.fillStyle = 'rgba(46,194,126,.8)'; g.fillRect(bx, by + bh * (1 - id - 0.07), 22, bh * 0.14);
      g.fillStyle = this.color(i); g.fillRect(bx - 4, by + bh * (1 - s.pw) - 4, 30, 8);
      this.stick(g, i, c.x0 + c.w * 0.18, GY, 0.9, s.ball ? 'jump' : 'idle');
      if (s.ball) {
        const t = s.ball.t, tx = s.ok ? h.x : h.x + (s.ball.pw - id) * 260, ty = s.ok ? h.y : h.y + 30;
        const x = s.ball.x0 + (tx - s.ball.x0) * t, y = s.ball.y0 + (ty - s.ball.y0) * t - Math.sin(t * Math.PI) * 220;
        g.fillStyle = '#ff7b00'; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); g.strokeStyle = '#1e1436'; g.lineWidth = 2; g.stroke();
      }
      if (s.msg > 0) text(g, s.lastOk ? '+2' : '✖', h.x, h.y - 100, 40, s.lastOk ? '#2ec27e' : '#ff4d6d');
    }
  }
}
