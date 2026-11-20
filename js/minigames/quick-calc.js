// 28. Quick Calculation — le curseur parcourt 4 résultats : touche quand il est sur le BON. Faux = -1.
import { MiniGameBase } from './base.js';
import { W, H, randi, shuffle, text, rr } from '../core.js';
import { sound } from '../audio.js';
export default class QuickCalc extends MiniGameBase {
  init() { this.next(); }
  next() {
    const lvl = Math.min(3, Math.floor(this.time / 15)), op = ['+', '-', '×'][randi(0, lvl >= 1 ? 2 : 1)];
    let a = randi(2, 9 + lvl * 8), b = randi(2, 9 + lvl * 4); if (op === '-' && b > a) [a, b] = [b, a]; if (op === '×') { a = randi(2, 9); b = randi(2, 9 + lvl); }
    this.ans = op === '+' ? a + b : op === '-' ? a - b : a * b; this.expr = `${a} ${op} ${b}`;
    const opts = new Set([this.ans]); while (opts.size < 4) opts.add(Math.max(0, this.ans + randi(-10, 10))); this.opts4 = shuffle([...opts]);
    this.cur = randi(0, 3); this.ct = 0; this.locked = this.players.map(() => false); this.solved = -1; this.st = 0;
  }
  onPress(i) {
    if (this.solved !== -1 || this.locked[i]) return;
    if (this.opts4[this.cur] === this.ans) { this.solved = i; this.scores[i] += 2; this.st = 1; sound.good(); this.burst(640, 300, this.color(i), 20); }
    else { this.locked[i] = true; this.scores[i]--; sound.bad(); }
  }
  bots() { if (this.solved !== -1) return; for (let i = 0; i < this.n; i++) if (this.isBot(i) && !this.locked[i] && this.opts4[this.cur] === this.ans && this.ct < 0.3) this.botTap(i, 0.9); }
  update(dt) {
    this.qt = (this.qt || 0) + dt;
    if (this.solved !== -1) { this.st -= dt; if (this.st <= 0) { this.qt = 0; this.next(); } return; }
    if (this.locked.every(Boolean) || this.qt > 10) { this.solved = -2; this.st = 1; return; }
    this.ct += dt; if (this.ct > Math.max(0.55, 0.95 - this.time / 100)) { this.ct = 0; this.cur = (this.cur + 1) % 4; }
  }
  draw(g) {
    g.fillStyle = '#3a0ca3'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.12)'; rr(g, 340, 90, 600, 150, 30); g.fill(); text(g, this.expr + ' = ?', 640, 165, 80, '#fff');
    this.opts4.forEach((v, k) => {
      const x = 130 + k * 270, y = 300, on = k === this.cur && this.solved === -1, good = this.solved !== -1 && v === this.ans;
      g.fillStyle = good ? '#2ec27e' : on ? '#ffd60a' : 'rgba(255,255,255,.15)'; rr(g, x, y, 240, 150, 26); g.fill();
      text(g, String(v), x + 120, y + 75, 70, on ? '#3a0ca3' : '#fff', 'center', !on);
    });
    for (let i = 0; i < this.n; i++) { const x = W / (this.n + 1) * (i + 1); this.stick(g, i, x, 660, 0.9, this.locked[i] ? 'stun' : this.solved === i ? 'win' : 'idle'); }
  }
}
