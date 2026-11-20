// 22. Rope Swing — toucher = lâcher la corde, toucher en vol = s'accrocher à la suivante
// Physique en unités « longueur de corde » (1 = une corde), mise à l'échelle au dessin.
import { MiniGameBase } from './base.js';
import { W, H, clamp } from '../core.js';
import { lane, sky } from './helpers.js';
import { sound } from '../audio.js';
const OM = 3, AMP = 0.9, K = 1.7, GRAV = 6, GAP = 2.7, REACH = 1.1, FLOOR = 1.8, GOAL = 12;
export default class RopeSwing extends MiniGameBase {
  init() { this.rankMode = 'race'; this.s = this.players.map((_, i) => ({ rope: 0, ph: i * 0.7, fly: false, x: 0, y: 0, vx: 0, vy: 0, respawn: 0 })); }
  unit(i) { return lane(i, this.n).h / 2.3; }          // pixels par unité
  progress(i) { const s = this.s[i]; return s.rope + (s.fly ? 0.5 : 0); }
  scoreText(i) { return this.s[i].rope + '/' + GOAL; }
  ang(s) { return AMP * Math.sin(s.ph); }
  onPress(i) {
    const s = this.s[i]; if (s.respawn > 0 || this.finishOrder.includes(i)) return;
    if (!s.fly) { const a = this.ang(s), av = OM * AMP * Math.cos(s.ph); s.fly = true; s.x = s.rope * GAP + Math.sin(a); s.y = Math.cos(a); s.vx = Math.cos(a) * av * K; s.vy = -Math.sin(a) * av * K - 1; sound.jump(); return; }
    const nx = (s.rope + 1) * GAP, d = Math.hypot(s.x - nx, s.y);
    if (d < REACH) { s.fly = false; s.rope++; const a = clamp(Math.atan2(s.x - nx, s.y), -AMP * 0.99, AMP * 0.99); s.ph = Math.asin(a / AMP); sound.good(); this.scores[i] = s.rope; if (s.rope >= GOAL) this.finishPlayer(i); }
  }
  bots() {
    for (let i = 0; i < this.n; i++) if (this.isBot(i)) {
      const s = this.s[i]; if (s.respawn > 0 || this.finishOrder.includes(i)) continue;
      const a = this.ang(s), fwd = Math.cos(s.ph) > 0;
      if (!s.fly && fwd && a > 0.25 && a < 0.45) this.botTap(i, 0.04);
      if (s.fly && Math.hypot(s.x - (s.rope + 1) * GAP, s.y) < REACH * 0.85) this.botTap(i, 0.04);
    }
  }
  update(dt) {
    for (let i = 0; i < this.n; i++) {
      const s = this.s[i]; if (this.finishOrder.includes(i)) { s.ph += OM * dt; continue; }
      if (s.respawn > 0) { s.respawn -= dt; continue; }
      if (!s.fly) s.ph += OM * dt;
      else { s.vy += GRAV * dt; s.x += s.vx * dt; s.y += s.vy * dt; if (s.y > FLOOR) { s.fly = false; s.respawn = 0.9; s.ph = -1.2; sound.bad(); } }
    }
  }
  draw(g) {
    sky(g, '#1b4332', '#95d5b2', this.anim);
    for (let i = 0; i < this.n; i++) {
      const L = lane(i, this.n), s = this.s[i], u = this.unit(i), top = L.y0 + 10;
      const camU = s.rope * GAP - 1.2, X = xu => (xu - camU) * u + 60, Y = yu => top + yu * u;
      g.fillStyle = '#6f4518'; g.fillRect(0, top - 8, W, 6);
      g.fillStyle = '#081c15'; g.fillRect(0, Y(FLOOR), W, L.y0 + L.h - Y(FLOOR));
      g.fillStyle = '#2d6a4f'; for (let k = 0; k < 30; k++) { const x = ((k * 50 - camU * u) % 1500 + 1500) % 1500 - 50; g.beginPath(); g.moveTo(x, Y(FLOOR)); g.lineTo(x + 25, Y(FLOOR) - 14); g.lineTo(x + 50, Y(FLOOR)); g.fill(); }
      for (let k = Math.max(0, s.rope - 1); k <= Math.min(GOAL, s.rope + 6); k++) {
        const ax = X(k * GAP); g.fillStyle = k === GOAL ? '#ffd60a' : '#bc6c25'; g.fillRect(ax - 8, top - 10, 16, 10);
        if (k === s.rope && !s.fly && s.respawn <= 0) continue;
        const sw = Math.sin(this.anim * 1.5 + k) * 0.15; g.strokeStyle = 'rgba(188,108,37,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(ax, top); g.lineTo(ax + Math.sin(sw) * u, top + Math.cos(sw) * u); g.stroke();
      }
      const sc = Math.min(0.7, u / 75); let px, py;
      if (s.respawn > 0) { g.globalAlpha = 0.4; px = X(s.rope * GAP); py = Y(1) + 60 * sc; }
      else if (s.fly) { px = X(s.x); py = Y(s.y) + 60 * sc; }
      else { const a = this.ang(s), hx = X(s.rope * GAP + Math.sin(a)), hy = Y(Math.cos(a)); g.strokeStyle = '#a0522d'; g.lineWidth = 4; g.beginPath(); g.moveTo(X(s.rope * GAP), top); g.lineTo(hx, hy); g.stroke(); px = hx; py = hy + 60 * sc; }
      this.stick(g, i, px, py, sc, this.finishOrder.includes(i) ? 'win' : s.respawn > 0 ? 'stun' : 'jump');
      g.globalAlpha = 1;
    }
  }
}
