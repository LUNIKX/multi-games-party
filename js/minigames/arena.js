// arena.js — physique partagée « flèche qui tourne + dash » (Sumo, King of the Hill, Ball Arena)
import { MiniGameBase } from './base.js';
import { W, H, rand } from '../core.js';
import { sound } from '../audio.js';
export class ArenaBase extends MiniGameBase {
  makeBodies(cx, cy, rad) {
    this.b = this.players.map((_, i) => { const a = i / this.n * Math.PI * 2 + 0.6; return { x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad, vx: 0, vy: 0, r: 30, ang: a + Math.PI, spin: (i % 2 ? -1 : 1) * 3.2, cd: 0 }; });
  }
  onPress(i) { const p = this.b[i]; if (p.cd > 0) return; p.vx += Math.cos(p.ang) * 620; p.vy += Math.sin(p.ang) * 620; p.cd = 0.45; p.spin *= -1; sound.jump(); }
  physics(dt, fric = 2.2) {
    for (let i = 0; i < this.n; i++) {
      const p = this.b[i]; if (!this.alive[i]) continue;
      p.ang += p.spin * dt; if (p.cd > 0) p.cd -= dt;
      p.x += p.vx * dt; p.y += p.vy * dt; const f = Math.exp(-fric * dt); p.vx *= f; p.vy *= f;
    }
    // collisions élastiques entre joueurs
    for (let i = 0; i < this.n; i++) for (let j = i + 1; j < this.n; j++) {
      if (!this.alive[i] || !this.alive[j]) continue;
      const a = this.b[i], c = this.b[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 1, ov = a.r + c.r - d;
      if (ov > 0) {
        const nx = dx / d, ny = dy / d; a.x -= nx * ov / 2; a.y -= ny * ov / 2; c.x += nx * ov / 2; c.y += ny * ov / 2;
        const rel = (a.vx - c.vx) * nx + (a.vy - c.vy) * ny;
        if (rel > 0) { const imp = rel * 1.15; a.vx -= nx * imp; a.vy -= ny * imp; c.vx += nx * imp; c.vy += ny * imp; if (imp > 150) { sound.hit(); this.burst((a.x + c.x) / 2, (a.y + c.y) / 2, '#fff', 8); } }
      }
    }
  }
  // bot : dash quand la flèche pointe vers (tx,ty)
  aimAt(i, tx, ty, tol = 0.35) {
    const p = this.b[i]; const want = Math.atan2(ty - p.y, tx - p.x);
    let d = Math.atan2(Math.sin(want - p.ang), Math.cos(want - p.ang));
    if (Math.abs(d) < tol * (1.4 - this.bot.skill * 0.6) && p.cd <= 0) this.botTap(i, 0.25);
  }
  drawBody(g, i, scale = 0.75) {
    const p = this.b[i]; if (!this.alive[i]) return;
    g.strokeStyle = this.color(i); g.lineWidth = 6; g.globalAlpha = 0.85;
    const ax = p.x + Math.cos(p.ang) * 58, ay = p.y + Math.sin(p.ang) * 58;
    g.beginPath(); g.moveTo(p.x + Math.cos(p.ang) * 34, p.y + Math.sin(p.ang) * 34); g.lineTo(ax, ay); g.stroke();
    g.fillStyle = this.color(i); g.beginPath(); g.moveTo(ax + Math.cos(p.ang) * 14, ay + Math.sin(p.ang) * 14); g.lineTo(ax + Math.cos(p.ang + 2.3) * 12, ay + Math.sin(p.ang + 2.3) * 12); g.lineTo(ax + Math.cos(p.ang - 2.3) * 12, ay + Math.sin(p.ang - 2.3) * 12); g.fill();
    g.globalAlpha = 1;
    const sp = Math.hypot(p.vx, p.vy);
    this.stick(g, i, p.x, p.y + 30, scale, sp > 250 ? 'jump' : sp > 40 ? 'run' : 'idle', Math.cos(p.ang) < 0 ? -1 : 1);
  }
}
