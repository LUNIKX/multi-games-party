// 23. Rhythm Tap — touche quand la note arrive sur la ligne, en rythme avec la musique
import { MiniGameBase } from './base.js';
import { W, H, rand, text } from '../core.js';
import { lane } from './helpers.js';
import { sound } from '../audio.js';
const HIT = 220, SPEED = 420;
export default class RhythmTap extends MiniGameBase {
  init() {
    const bpm = 112, beat = 60 / bpm; this.notes = []; let t = 1.2;
    while (t < this.duration - 1) { this.notes.push({ t, judged: this.players.map(() => null) }); t += beat * (Math.random() < 0.25 ? 0.5 : Math.random() < 0.2 ? 2 : 1); }
    this.fx = this.players.map(() => ({ txt: '', t: 0 })); this.combo = this.players.map(() => 0); this.lastBeat = -1;
  }
  judge(i, txt, pts) { this.fx[i] = { txt, t: 0.5 }; this.scores[i] += pts; }
  onPress(i) {
    const n = this.notes.find(n => !n.judged[i] && Math.abs(n.t - this.time) < 0.22);
    if (!n) { this.judge(i, '✖', -1); this.combo[i] = 0; return; }
    const e = Math.abs(n.t - this.time); n.judged[i] = true; this.combo[i]++;
    if (e < 0.06) { this.judge(i, 'PERFECT', 3 + Math.floor(this.combo[i] / 10)); sound.coin(); } else if (e < 0.13) { this.judge(i, 'GOOD', 2); sound.tap(); } else { this.judge(i, 'OK', 1); }
  }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i)) { const n = this.notes.find(n => !n.judged[i] && n.t > this.time); if (n && !n.bot?.[i]) { (n.bot ||= [])[i] = 1; if (!this.bot.fails()) { const off = (Math.random() - 0.5) * (1 - this.bot.skill) * 0.3; n.at = n.at || []; n.at[i] = n.t + off; } } for (const m of this.notes) if (m.at && m.at[i] && !m.judged[i] && this.time >= m.at[i]) { m.at[i] = 0; this.press(i); this.release(i); } } }
  update(dt) {
    for (const n of this.notes) for (let i = 0; i < this.n; i++) if (!n.judged[i] && this.time - n.t > 0.22) { n.judged[i] = 'miss'; this.combo[i] = 0; this.fx[i] = { txt: 'MISS', t: 0.4 }; }
    for (const f of this.fx) if (f.t > 0) f.t -= 0; this.fx.forEach(f => f.t -= dt);
    const nb = this.notes.findIndex(n => n.t > this.time) - 1; if (nb !== this.lastBeat && nb >= 0) { this.lastBeat = nb; sound.beat(nb % 4 ? 220 : 330); }
  }
  draw(g) {
    g.fillStyle = '#10002b'; g.fillRect(0, 0, W, H);
    const pulse = 1 - ((this.time % (60 / 112)) / (60 / 112));
    for (let i = 0; i < this.n; i++) {
      const L = lane(i, this.n), cy = L.y0 + L.h / 2;
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, L.y0 + 6, W, L.h - 12);
      g.strokeStyle = this.color(i); g.lineWidth = 6 + pulse * 6; g.beginPath(); g.arc(HIT, cy, Math.min(40, L.h / 2 - 8), 0, 7); g.stroke();
      for (const n of this.notes) {
        if (n.judged[i]) continue; const x = HIT + (n.t - this.time) * SPEED; if (x < -40 || x > W + 40) continue;
        g.fillStyle = this.color(i); g.beginPath(); g.arc(x, cy, Math.min(26, L.h / 2 - 14), 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
      }
      this.stick(g, i, 80, L.floor, Math.min(0.9, L.h / 160), pulse > 0.7 ? 'jump' : 'idle');
      if (this.fx[i].t > 0) text(g, this.fx[i].txt, HIT + 150, cy, 32, this.fx[i].txt === 'PERFECT' ? '#ffd60a' : this.fx[i].txt === 'MISS' || this.fx[i].txt === '✖' ? '#ff4d6d' : '#fff');
      if (this.combo[i] > 2) text(g, 'x' + this.combo[i], W - 80, cy, 28, '#c77dff');
    }
  }
}
