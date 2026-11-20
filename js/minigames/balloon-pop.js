// 18. Balloon Pop — tenir = gonfler, relâcher = valider avant que ça éclate ! 5 manches.
import { MiniGameBase } from './base.js';
import { W, H, rand, text } from '../core.js';
import { column } from './helpers.js';
import { sound, vibrate } from '../audio.js';
export default class BalloonPop extends MiniGameBase {
  init() { this.round = 0; this.duration = 0; this.newRound(); }
  newRound() { this.round++; this.limit = rand(0.45, 1); this.b = this.players.map(() => ({ size: 0, state: 'wait' })); this.rt = 8; this.botTarget = this.players.map(() => this.limit * (0.55 + Math.random() * 0.4 * this.bot.skill) + (Math.random() < this.bot.p.error ? 0.25 : 0)); this.say((this.opts.lang === 'en' ? 'ROUND ' : 'MANCHE ') + this.round + '/5'); }
  scoreText(i) { return String(Math.round(this.scores[i])); }
  onPress(i) { const b = this.b[i]; if (b.state === 'wait') b.state = 'grow'; }
  onRelease(i) { const b = this.b[i]; if (b.state === 'grow') { b.state = 'bank'; this.scores[i] += Math.round(b.size * 100); sound.good(); } }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i)) { const b = this.b[i]; if (b.state === 'wait' && this.rt < 7.5) this.botHold(i, true); if (b.state === 'grow' && b.size >= this.botTarget[i]) this.botHold(i, false); } }
  update(dt) {
    this.rt -= dt;
    for (let i = 0; i < this.n; i++) { const b = this.b[i]; if (b.state === 'grow') { b.size += dt * 0.22; if (b.size > this.limit) { b.state = 'pop'; sound.pop(); vibrate(80); const c = column(i, this.n); this.burst(c.cx, 350, this.color(i), 30); } } }
    const allDone = this.b.every(b => b.state === 'bank' || b.state === 'pop');
    if (this.rt <= 0 || allDone) { if (this.rtEnd === undefined) this.rtEnd = 1.3; }
    if (this.rtEnd !== undefined) { this.rtEnd -= dt; if (this.rtEnd <= 0) { this.rtEnd = undefined; for (let i = 0; i < this.n; i++) this.held[i] = false; if (this.round >= 5) this.finish(); else this.newRound(); } }
  }
  draw(g) {
    g.fillStyle = '#90e0ef'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < this.n; i++) {
      const c = column(i, this.n), b = this.b[i], r = 30 + b.size * 190;
      g.strokeStyle = '#333'; g.lineWidth = 2; g.beginPath(); g.moveTo(c.cx, 600); g.lineTo(c.cx, 360 + r); g.stroke();
      if (b.state !== 'pop') { g.fillStyle = this.color(i); g.beginPath(); g.ellipse(c.cx, 360, r * 0.85 * (1 + Math.sin(this.anim * 20) * 0.01 * b.size * 5), r, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(c.cx - r * 0.3, 360 - r * 0.4, r * 0.15, r * 0.25, -0.5, 0, 7); g.fill(); }
      else text(g, 'POP!', c.cx, 360, 60, '#ff4d6d');
      this.stick(g, i, c.cx - 50, 640, 0.9, b.state === 'grow' ? 'run' : b.state === 'pop' ? 'stun' : 'idle');
      text(g, b.state === 'bank' ? '✔ ' + Math.round(b.size * 100) : b.state === 'pop' ? '0' : Math.round(b.size * 100), c.cx, 140, 36, '#fff');
    }
    text(g, (this.opts.lang === 'en' ? 'HOLD to inflate, RELEASE to bank' : 'TIENS pour gonfler, LÂCHE pour valider'), W / 2, 690, 26, '#023e8a', 'center', false);
  }
}
