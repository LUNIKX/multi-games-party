// 26. Simon Party — mémorise la séquence, puis touche quand TON curseur est sur la bonne couleur
import { MiniGameBase } from './base.js';
import { W, H, randi, text, rr } from '../core.js';
import { column } from './helpers.js';
import { sound } from '../audio.js';
const CS = ['#ef233c', '#3a86ff', '#2ec27e', '#ffbe0b'], FQ = [330, 392, 494, 587];
export default class SimonParty extends MiniGameBase {
  init() { this.duration = 0; this.round = 0; this.seq = []; this.newRound(); }
  newRound() {
    this.round++; this.seq.push(randi(0, 3)); if (this.round === 1) this.seq.push(randi(0, 3));
    this.phase = 'show'; this.si = 0; this.st = 0; this.flash = -1;
    this.p = this.players.map((_, i) => ({ idx: 0, cur: i % 4, ct: 0, out: false, done: false, flash: 0 })); this.it = 0; this.order = 0;
  }
  onPress(i) {
    if (this.phase !== 'input') return; const p = this.p[i]; if (p.out || p.done) return;
    if (p.cur === this.seq[p.idx]) { p.idx++; p.flash = 0.2; sound.beat(FQ[p.cur]); if (p.idx >= this.seq.length) { p.done = true; this.scores[i] += 1 + (this.order === 0 ? 1 : 0); this.order++; sound.good(); } }
    else { p.out = true; sound.bad(); }
  }
  bots() { if (this.phase !== 'input') return; for (let i = 0; i < this.n; i++) if (this.isBot(i)) { const p = this.p[i]; if (!p.out && !p.done && p.cur === this.seq[p.idx] && p.ct < 0.2) this.botTap(i, 0.25); } }
  update(dt) {
    if (this.phase === 'show') {
      this.st += dt; const per = Math.max(0.35, 0.6 - this.round * 0.03);
      if (this.st > per) { this.st = 0; if (this.si < this.seq.length) { this.flash = this.seq[this.si]; sound.beat(FQ[this.flash]); this.si++; } else { this.phase = 'input'; this.flash = -1; this.it = 0; } }
      else if (this.st > per * 0.7) this.flash = -1;
      return;
    }
    if (this.phase === 'input') {
      this.it += dt;
      for (const p of this.p) { p.ct += dt; if (p.flash > 0) p.flash -= dt; if (p.ct > 0.55) { p.ct = 0; p.cur = (p.cur + 1) % 4; } }
      if (this.p.every(p => p.out || p.done) || this.it > 6 + this.seq.length * 2.4) { this.phase = 'pause'; this.pt = 1.2; }
      return;
    }
    this.pt -= dt; if (this.pt <= 0) { if (this.round >= 6 || this.p.every(p => p.out)) this.finish(); else this.newRound(); }
  }
  draw(g) {
    g.fillStyle = '#1a1a2e'; g.fillRect(0, 0, W, H);
    if (this.phase === 'show') {
      for (let k = 0; k < 4; k++) { const x = 640 + (k % 2 ? 10 : -230), y = 120 + (k >= 2 ? 240 : 0); g.fillStyle = CS[k]; g.globalAlpha = this.flash === k ? 1 : 0.25; rr(g, x, y, 220, 220, 30); g.fill(); }
      g.globalAlpha = 1; text(g, (this.opts.lang === 'en' ? 'WATCH! ' : 'REGARDE ! ') + this.si + '/' + this.seq.length, 640, 650, 34, '#fff');
      return;
    }
    for (let i = 0; i < this.n; i++) {
      const c = column(i, this.n), p = this.p[i], s = Math.min(110, c.w / 2 - 20);
      for (let k = 0; k < 4; k++) { const x = c.cx + (k % 2 ? 6 : -s - 6), y = 150 + (k >= 2 ? s + 12 : 0); g.fillStyle = CS[k]; g.globalAlpha = p.cur === k ? 1 : 0.22; rr(g, x, y, s, s, 18); g.fill(); if (p.cur === k) { g.strokeStyle = '#fff'; g.lineWidth = 5; g.stroke(); } }
      g.globalAlpha = 1;
      text(g, p.out ? '✖' : p.done ? '✔' : p.idx + '/' + this.seq.length, c.cx, 130 + 2 * s + 70, 36, p.out ? '#ff4d6d' : p.done ? '#2ec27e' : '#fff');
      this.stick(g, i, c.cx, 660, 0.8, p.out ? 'stun' : p.done ? 'win' : 'idle');
    }
  }
}
