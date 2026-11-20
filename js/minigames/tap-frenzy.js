// 20. Tap Frenzy — chaque toucher fait avancer ton stickman. Premier en haut de la colline !
import { MiniGameBase } from './base.js';
import { W, H, text } from '../core.js';
import { lane, sky, laneBg } from './helpers.js';
import { sound } from '../audio.js';
const GOAL = 80;
export default class TapFrenzy extends MiniGameBase {
  init() { this.rankMode = 'race'; this.v = this.players.map(() => 0); }
  progress(i) { return this.scores[i]; }
  scoreText(i) { return Math.round(this.scores[i] / GOAL * 100) + '%'; }
  onPress(i) { if (this.finishOrder.includes(i)) return; this.scores[i]++; this.v[i] = 0.15; sound.tap(); if (this.scores[i] >= GOAL) this.finishPlayer(i); }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i) && Math.random() < (3 + this.bot.skill * 5.5) / 60) { this.press(i); this.release(i); } }
  update(dt) { for (let i = 0; i < this.n; i++) if (this.v[i] > 0) this.v[i] -= dt; }
  draw(g) {
    sky(g, '#ff9e00', '#ff4800', this.anim);
    for (let i = 0; i < this.n; i++) {
      const L = laneBg(g, i, this.n, this.color(i), this.scores[i] * 10), x = 80 + this.scores[i] / GOAL * 1060;
      g.font = '40px serif'; g.textAlign = 'center'; g.fillText('🏁', 1180, L.floor - 30);
      this.stick(g, i, x, L.floor, Math.min(1, L.h / 150), this.finishOrder.includes(i) ? 'win' : this.v[i] > 0 ? 'run' : 'idle');
      const f = this.finishOrder.indexOf(i); if (f >= 0) text(g, '#' + (f + 1), x + 60, L.floor - 50, 34, '#ffd60a');
    }
  }
}
