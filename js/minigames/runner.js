// runner.js — base partagée des jeux de course en couloirs (Race, Obstacle Race, Platforms, Laser Dodge)
import { MiniGameBase } from './base.js';
import { W, rand, text } from '../core.js';
import { lane, sky, laneBg } from './helpers.js';
import { sound, vibrate } from '../audio.js';
export const GRAV = 2200, PX = 220;
export class RunnerBase extends MiniGameBase {
  init() {
    this.rankMode = 'race'; this.trackLen = 4200; this.speed = 380; this.jumpV = 760; this.maxJumps = 1;
    this.r = this.players.map(() => ({ d: 0, y: 0, vy: 0, jumps: 0, stun: 0, duck: false, fall: 0 }));
    this.obs = []; this.setup();
  }
  setup() { }
  ground(p) { return true; }            // sol présent sous le joueur ?
  hits(p, o, i) { return false; }       // collision avec un obstacle ?
  speedOf(i) { return this.speed; }
  progress(i) { return this.r[i].d; }
  scoreText(i) { return Math.min(100, Math.floor(this.r[i].d / this.trackLen * 100)) + '%'; }
  onPress(i) { this.jump(i); }
  jump(i) {
    const p = this.r[i]; if (p.stun > 0 || p.fall > 0 || this.finishOrder.includes(i)) return;
    if (p.jumps < this.maxJumps) { p.vy = -this.jumpV * (p.jumps ? 0.85 : 1); p.jumps++; sound.jump(); }
  }
  stunP(i, t = 0.7) { const p = this.r[i]; if (p.stun > 0) return; p.stun = t; p.d = Math.max(0, p.d - 60); sound.hit(); if (!this.isBot(i)) vibrate(60); this.burst(PX, lane(i, this.n).floor - 40 - p.y, '#fff', 10); }
  nextObs(i, ahead = 0) { const d = this.r[i].d; return this.obs.find(o => o.x + (o.w || 40) > d + PX * 0 + ahead - 20 && o.x > d - 10); }
  update(dt) {
    for (let i = 0; i < this.n; i++) {
      const p = this.r[i];
      if (this.finishOrder.includes(i)) { p.d += 100 * dt; continue; }
      if (p.fall > 0) { p.fall -= dt; p.y -= 600 * dt; if (p.fall <= 0) { p.y = 0; p.vy = 0; p.d = this.safeBack(p.d); } continue; }
      if (p.stun > 0) p.stun -= dt; else p.d += this.speedOf(i) * dt;
      p.vy += GRAV * dt; p.y -= p.vy * dt;
      if (p.y <= 0) {
        if (this.ground(p)) { p.y = 0; p.vy = 0; p.jumps = 0; }
        else if (p.y < -20) { p.fall = 0.8; sound.bad(); }
      }
      for (const o of this.obs) if (!o.hit?.[i] && this.hits(p, o, i)) { (o.hit ||= [])[i] = true; this.stunP(i); }
      if (p.d >= this.trackLen) this.finishPlayer(i);
    }
    this.extraUpdate && this.extraUpdate(dt);
  }
  safeBack(d) { return d - 140; }
  bots() {
    for (let i = 0; i < this.n; i++) if (this.isBot(i)) this.botLogic(i);
  }
  botLogic(i) {
    const p = this.r[i], o = this.nextObs(i); if (!o || p.y > 0) return;
    const gap = o.x - p.d; const look = this.speedOf(i) * 0.18 + 30;
    if (gap < look + 40 && gap > 0) this.botTap(i, 0.25);
  }
  drawObs(g, o, sx, L, i) { }
  draw(g) {
    sky(g, '#2b1055', '#7597de', this.anim);
    for (let i = 0; i < this.n; i++) {
      const p = this.r[i], L = laneBg(g, i, this.n, this.color(i), p.d);
      // ligne d'arrivée
      const fx = this.trackLen - p.d + PX; if (fx < W + 40) { for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#fff' : '#111'; g.fillRect(fx, L.y0 + k * L.h / 6, 16, L.h / 6); } }
      this.drawLane && this.drawLane(g, i, L, p);
      for (const o of this.obs) { const sx = o.x - p.d + PX; if (sx > -260 && sx < W + 100) this.drawObs(g, o, sx, L, i); }
      const sc = Math.min(1, L.h / 200);
      const pose = this.finishOrder.includes(i) ? 'win' : p.fall > 0 || p.stun > 0 ? 'stun' : p.duck ? 'duck' : p.y > 0 ? 'jump' : 'run';
      this.stick(g, i, PX, L.floor - p.y * sc, sc, pose);
      const f = this.finishOrder.indexOf(i); if (f >= 0) text(g, '#' + (f + 1), PX + 70, L.floor - 50, 34, '#ffd60a');
    }
  }
}
