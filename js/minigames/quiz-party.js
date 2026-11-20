// 27. Quiz Party — ton curseur passe sur A/B/C/D : touche pour verrouiller ta réponse. 8 questions.
import { MiniGameBase } from './base.js';
import { W, H, shuffle, text, rr } from '../core.js';
import { column } from './helpers.js';
import { sound } from '../audio.js';
const LET = ['A', 'B', 'C', 'D'], AC = ['#ef476f', '#118ab2', '#06d6a0', '#ffd166'];
export default class QuizParty extends MiniGameBase {
  init() { this.duration = 0; this.qs = shuffle([...(this.data.quiz || [])]).slice(0, 8); this.qi = -1; this.next(); }
  next() { this.qi++; if (this.qi >= this.qs.length) { this.finish(); return; } this.q = this.qs[this.qi]; this.phase = 'ask'; this.at = 0; this.sel = this.players.map((_, i) => ({ cur: i % 4, ct: 0, lock: -1, t: 0 })); this.firstOk = -1; this.botPick = this.players.map(() => Math.random() < 0.35 + this.bot.skill * 0.55 ? this.q.c : Math.floor(Math.random() * 4)); }
  onPress(i) { if (this.phase !== 'ask') return; const s = this.sel[i]; if (s.lock >= 0) return; s.lock = s.cur; s.t = this.at; sound.tap(); }
  bots() { if (this.phase !== 'ask' || this.at < 1.5) return; for (let i = 0; i < this.n; i++) if (this.isBot(i) && this.sel[i].lock < 0 && this.sel[i].cur === this.botPick[i] && this.sel[i].ct < 0.25) this.botTap(i, 0.3); }
  update(dt) {
    this.at += dt;
    if (this.phase === 'ask') {
      for (const s of this.sel) if (s.lock < 0) { s.ct += dt; if (s.ct > 0.75) { s.ct = 0; s.cur = (s.cur + 1) % 4; } }
      if (this.sel.every(s => s.lock >= 0) || this.at > 14) {
        this.phase = 'reveal'; this.at = 0;
        const ok = this.sel.map((s, i) => ({ i, s })).filter(o => o.s.lock === this.q.c).sort((a, b) => a.s.t - b.s.t);
        ok.forEach((o, k) => this.scores[o.i] += k === 0 ? 3 : 2); ok.length ? sound.good() : sound.bad();
      }
    } else if (this.at > 2.4) this.next();
  }
  draw(g) {
    g.fillStyle = '#073b4c'; g.fillRect(0, 0, W, H); if (!this.q) return;
    g.fillStyle = 'rgba(255,255,255,.1)'; rr(g, 60, 76, W - 120, 100, 20); g.fill();
    g.font = '900 34px "Baloo 2", system-ui'; let s = this.q.q; while (g.measureText(s).width > W - 160 && s.length > 10) s = s.slice(0, -2);
    text(g, s === this.q.q ? s : s + '…', 640, 126, 34, '#fff');
    text(g, (this.qi + 1) + '/' + this.qs.length + '  ⏱ ' + Math.max(0, Math.ceil(14 - (this.phase === 'ask' ? this.at : 14))), 640, 196, 22, '#8ecae6');
    for (let k = 0; k < 4; k++) {
      const x = 80 + (k % 2) * 570, y = 220 + Math.floor(k / 2) * 110, rev = this.phase === 'reveal';
      g.fillStyle = AC[k]; g.globalAlpha = rev && k !== this.q.c ? 0.25 : 1; rr(g, x, y, 550, 90, 18); g.fill(); g.globalAlpha = 1;
      text(g, LET[k] + '. ' + this.q.a[k], x + 22, y + 45, 28, '#fff', 'left');
      this.sel.forEach((sl, i) => { if ((sl.lock >= 0 ? sl.lock : sl.cur) === k && (rev || !this.isBot(i) || sl.lock >= 0)) { g.fillStyle = this.color(i); g.beginPath(); g.arc(x + 470 + i * 0 - (i * 26), y + 45, 15, 0, 7); g.fill(); g.strokeStyle = sl.lock >= 0 ? '#fff' : 'rgba(255,255,255,.3)'; g.lineWidth = 4; g.stroke(); } });
    }
    for (let i = 0; i < this.n; i++) { const c = column(i, this.n), sl = this.sel[i]; this.stick(g, i, c.cx - 40, 690, 0.7, this.phase === 'reveal' ? (sl.lock === this.q.c ? 'win' : 'stun') : 'idle'); text(g, sl.lock >= 0 ? '🔒 ' + LET[sl.lock] : '→ ' + (this.isBot(i) ? '…' : LET[sl.cur]), c.cx + 30, 650, 28, this.color(i)); }
  }
}
