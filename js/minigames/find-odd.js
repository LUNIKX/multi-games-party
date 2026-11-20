// 29. Find The Odd One — un symbole est différent : touche quand le curseur est dessus. Erreur = bloqué 1,5 s.
import { MiniGameBase } from './base.js';
import { W, H, randi, pick, text, rr } from '../core.js';
import { sound } from '../audio.js';
const PAIRS = [['😀', '😃'], ['🐶', '🐱'], ['🍎', '🍅'], ['⭐', '🌟'], ['🔵', '🟣'], ['🌲', '🌳'], ['🙂', '🙃'], ['🚗', '🚙'], ['🐟', '🐠'], ['🌕', '🌝'], ['☁️', '⛅'], ['🍋', '🍌']];
const C = 6, R = 3, SZ = 130;
export default class FindOdd extends MiniGameBase {
  init() { this.round = 0; this.duration = 0; this.next(); }
  next() { this.round++; if (this.round > 8) { this.finish(); return; } const p = pick(PAIRS), flip = Math.random() < 0.5; this.base = flip ? p[1] : p[0]; this.odd = flip ? p[0] : p[1]; this.oddAt = randi(0, C * R - 1); this.cur = randi(0, C * R - 1); this.ct = 0; this.lock = this.players.map(() => 0); this.solved = -1; this.st = 0; this.seen = this.players.map(() => 0); }
  onPress(i) {
    if (this.solved >= 0 || this.lock[i] > 0) return;
    if (this.cur === this.oddAt) { this.solved = i; this.scores[i] += 2; this.st = 1.3; sound.good(); this.burst(this.cx(this.cur), this.cy(this.cur), this.color(i), 24); }
    else { this.lock[i] = 1.5; sound.bad(); }
  }
  cx(k) { return 640 - (C * SZ) / 2 + (k % C) * SZ + SZ / 2; }
  cy(k) { return 150 + Math.floor(k / C) * SZ + SZ / 2; }
  bots() { if (this.solved >= 0) return; for (let i = 0; i < this.n; i++) if (this.isBot(i) && this.cur === this.oddAt && this.ct < 0.15) { this.seen[i]++; if (this.seen[i] > (this.bot.skill > 0.8 ? 0 : this.bot.skill > 0.6 ? 1 : 2) || Math.random() < 0.3) this.botTap(i, 0.7); } }
  update(dt) {
    for (let i = 0; i < this.n; i++) if (this.lock[i] > 0) this.lock[i] -= dt;
    if (this.solved >= 0) { this.st -= dt; if (this.st <= 0) this.next(); return; }
    this.ct += dt; if (this.ct > 0.42) { this.ct = 0; this.cur = (this.cur + 1) % (C * R); }
    if (this.time > this.round * 14) { this.solved = -2; this.st = 1; this.solved = 99; }
  }
  draw(g) {
    g.fillStyle = '#ffafcc'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < C * R; k++) {
      const x = this.cx(k), y = this.cy(k), on = k === this.cur && this.solved < 0, rev = this.solved >= 0 && k === this.oddAt;
      g.fillStyle = rev ? '#2ec27e' : on ? '#ffd60a' : 'rgba(255,255,255,.6)'; rr(g, x - SZ / 2 + 6, y - SZ / 2 + 6, SZ - 12, SZ - 12, 20); g.fill();
      g.font = '70px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(k === this.oddAt ? this.odd : this.base, x, y + 4);
    }
    text(g, (this.opts.lang === 'en' ? 'Round ' : 'Manche ') + Math.min(8, this.round) + '/8', 640, 100, 30);
    for (let i = 0; i < this.n; i++) { const x = W / (this.n + 1) * (i + 1); this.stick(g, i, x, 680, 0.6, this.lock[i] > 0 ? 'stun' : this.solved === i ? 'win' : 'idle'); }
  }
}
