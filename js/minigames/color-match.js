// 30. Color Match (effet Stroop) — touche SEULEMENT si la couleur de l'encre correspond au mot
import { MiniGameBase } from './base.js';
import { W, H, randi, text } from '../core.js';
import { sound } from '../audio.js';
const COLS = [{ fr: 'ROUGE', en: 'RED', c: '#ef233c' }, { fr: 'BLEU', en: 'BLUE', c: '#3a86ff' }, { fr: 'VERT', en: 'GREEN', c: '#2ec27e' }, { fr: 'JAUNE', en: 'YELLOW', c: '#ffd60a' }, { fr: 'VIOLET', en: 'PURPLE', c: '#9d4edd' }];
export default class ColorMatch extends MiniGameBase {
  init() { this.next(); }
  next() { this.w = randi(0, 4); this.ink = Math.random() < 0.4 ? this.w : (this.w + randi(1, 4)) % 5; this.wt = 0; this.tapped = this.players.map(() => 0); this.first = -1; this.fb = this.players.map(() => 0); }
  match() { return this.w === this.ink; }
  onPress(i) {
    if (this.tapped[i]) return;
    if (this.match()) { this.tapped[i] = 1; this.scores[i] += this.first < 0 ? 2 : 1; if (this.first < 0) this.first = i; sound.good(); }
    else { this.tapped[i] = -1; this.scores[i]--; sound.bad(); }
  }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i) && !this.tapped[i] && this.wt > 0.15) { if (this.match()) this.botTap(i, 1.1); else if (this.wt < 0.2 && Math.random() < this.bot.p.error * 0.6) this.botTap(i, 1); } }
  update(dt) { this.wt += dt; if (this.wt > Math.max(0.9, 1.6 - this.time / 60)) this.next(); }
  draw(g) {
    g.fillStyle = '#f8f9fa'; g.fillRect(0, 0, W, H); g.fillStyle = '#212529'; g.fillRect(0, 0, W, 64);
    const word = COLS[this.w][this.opts.lang === 'en' ? 'en' : 'fr'], s = 1 + Math.max(0, 0.15 - this.wt) * 2;
    g.save(); g.translate(640, 310); g.scale(s, s); text(g, word, 0, 0, 150, COLS[this.ink].c, 'center', false); g.restore();
    text(g, this.opts.lang === 'en' ? 'Tap only if the INK matches the WORD' : "Touche seulement si la COULEUR = le MOT", 640, 470, 28, '#495057', 'center', false);
    for (let i = 0; i < this.n; i++) { const x = W / (this.n + 1) * (i + 1); this.stick(g, i, x, 660, 0.9, this.tapped[i] === 1 ? 'win' : this.tapped[i] === -1 ? 'stun' : 'idle'); if (this.tapped[i]) text(g, this.tapped[i] > 0 ? '✔' : '✖', x, 540, 40, this.tapped[i] > 0 ? '#2ec27e' : '#ef233c'); }
  }
}
