// 19. Reflex Duel — touche dès que le signal passe au VERT. Faux départ = -1. 7 manches.
import { MiniGameBase } from './base.js';
import { W, H, rand, text } from '../core.js';
import { sound } from '../audio.js';
export default class ReflexDuel extends MiniGameBase {
  init() { this.duration = 0; this.round = 0; this.next(); }
  next() { this.round++; this.phase = 'red'; this.wait = rand(1.5, 4); this.locked = this.players.map(() => false); this.winner = -1; this.green = 0; this.botT = this.players.map(() => -1); }
  onPress(i) {
    if (this.locked[i] || this.phase === 'show') return;
    if (this.phase === 'red') { this.locked[i] = true; this.scores[i]--; sound.bad(); this.say(this.players[i].name + (this.opts.lang === 'en' ? ' false start!' : ' faux départ !'), 0.8); return; }
    this.winner = i; this.scores[i] += 2; this.phase = 'show'; this.show = 1.4; this.rt = this.time - this.green; sound.good(); this.burst(W / 2, 360, this.color(i), 30);
  }
  bots() {
    for (let i = 0; i < this.n; i++) if (this.isBot(i)) {
      if (this.phase === 'green' && this.botT[i] < 0) this.botT[i] = this.time + this.bot.reaction() * 1.1;
      if (this.phase === 'red' && this.botT[i] < 0 && Math.random() < this.bot.p.error * 0.004) { this.press(i); this.release(i); }
      if (this.phase === 'green' && this.botT[i] > 0 && this.time >= this.botT[i]) { this.press(i); this.release(i); }
    }
  }
  update(dt) {
    if (this.phase === 'red') { this.wait -= dt; if (this.wait <= 0) { this.phase = 'green'; this.green = this.time; sound.go(); if (this.locked.every(Boolean)) { this.phase = 'show'; this.show = 1; } } }
    else if (this.phase === 'show') { this.show -= dt; if (this.show <= 0) { if (this.round >= 7) this.finish(); else this.next(); } }
  }
  draw(g) {
    const green = this.phase === 'green' || (this.phase === 'show' && this.winner >= 0);
    g.fillStyle = green ? '#2ec27e' : '#c1121f'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(W / 2, 330, 150, 0, 7); g.fill();
    g.fillStyle = green ? '#b7efc5' : '#ff8fa3'; g.beginPath(); g.arc(W / 2, 330, 120, 0, 7); g.fill();
    text(g, this.phase === 'red' ? (this.opts.lang === 'en' ? 'WAIT…' : 'ATTENDS…') : this.phase === 'green' ? 'GO !' : this.winner >= 0 ? this.players[this.winner].name + ' ' + Math.round(this.rt * 1000) + 'ms' : '—', W / 2, 330, 54);
    text(g, (this.opts.lang === 'en' ? 'Round ' : 'Manche ') + this.round + '/7', W / 2, 120, 30);
    for (let i = 0; i < this.n; i++) { const x = W / (this.n + 1) * (i + 1); this.stick(g, i, x, 650, 1, this.locked[i] ? 'stun' : this.winner === i ? 'win' : 'idle'); }
  }
}
