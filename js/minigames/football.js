// 13. Football Party — 1c1 ou 2c2 : ton joueur va et vient, toucher = tirer quand la balle est proche
import { MiniGameBase } from './base.js';
import { W, H, rand, clamp, text } from '../core.js';
import { sound } from '../audio.js';
const T = 110, B = 660, GL = 230, GR = 490; // terrain et poteaux
export default class Football extends MiniGameBase {
  init() {
    this.team = this.players.map((_, i) => i % 2); this.goals = [0, 0];
    this.p = this.players.map((_, i) => ({ x: this.team[i] ? 900 + (i >> 1) * 160 : 380 - (i >> 1) * 160, y: 250 + i * 70, vy: (i % 3 ? 1 : -1) * (190 + i * 15), kick: 0 }));
    this.kickoff();
  }
  kickoff() { this.ball = { x: W / 2, y: (T + B) / 2, vx: rand(-60, 60), vy: rand(-120, 120) }; this.pause = 1; }
  scoreText(i) { return String(this.goals[this.team[i]]); }
  ranking() { this.scores = this.players.map((_, i) => this.goals[this.team[i]]); return super.ranking(); }
  near(i) { return Math.hypot(this.ball.x - this.p[i].x, this.ball.y - (this.p[i].y - 30)) < 85; }
  onPress(i) {
    const p = this.p[i]; p.kick = 0.2; if (!this.near(i)) return;
    const tx = this.team[i] ? 20 : W - 20, ty = rand(GL + 30, GR - 30), dx = tx - this.ball.x, dy = ty - this.ball.y, d = Math.hypot(dx, dy);
    this.ball.vx = dx / d * 900; this.ball.vy = dy / d * 900 + rand(-120, 120); sound.jump(); this.burst(this.ball.x, this.ball.y, '#fff', 6);
  }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i) && this.near(i)) this.botTap(i, 0.2); }
  update(dt) {
    if (this.pause > 0) { this.pause -= dt; return; }
    for (const p of this.p) { p.y += p.vy * dt; if (p.y < T + 60 || p.y > B) { p.vy *= -1; p.y = clamp(p.y, T + 60, B); } if (p.kick > 0) p.kick -= dt; }
    // les joueurs suivent un peu la balle horizontalement
    // attaquant : se place derrière la balle ; défenseur (2c2) : reste entre balle et son but
    this.p.forEach((p, i) => { const side = this.team[i] ? 1 : -1, def = i >= 2; const tx = def ? (this.ball.x + (this.team[i] ? W - 60 : 60)) / 2 : this.ball.x + side * 45; p.x += (clamp(tx, 60, W - 60) - p.x) * dt * 1.8; });
    const b = this.ball; b.x += b.vx * dt; b.y += b.vy * dt; const f = Math.exp(-0.6 * dt); b.vx *= f; b.vy *= f;
    if (b.y < T + 12 || b.y > B - 12) { b.vy *= -1; b.y = clamp(b.y, T + 12, B - 12); }
    // dribble automatique : le ballon rebondit sur les joueurs
    for (const p of this.p) { const dx = b.x - p.x, dy = b.y - (p.y - 30), d = Math.hypot(dx, dy); if (d < 34) { b.vx += dx / d * 200; b.vy += dy / d * 200; } }
    if (b.x < 20 || b.x > W - 20) {
      if (b.y > GL && b.y < GR) { const t = b.x < 20 ? 1 : 0; this.goals[t]++; this.say('GOAL !'); sound.win(); this.burst(b.x, b.y, '#ffd60a', 40); this.kickoff(); }
      else { b.vx *= -1; b.x = clamp(b.x, 20, W - 20); }
    }
  }
  draw(g) {
    g.fillStyle = '#2a9d8f'; g.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 128) { g.fillStyle = x / 128 % 2 ? 'rgba(255,255,255,.05)' : 'transparent'; g.fillRect(x, T, 128, B - T); }
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 5; g.strokeRect(10, T, W - 20, B - T); g.beginPath(); g.moveTo(W / 2, T); g.lineTo(W / 2, B); g.stroke(); g.beginPath(); g.arc(W / 2, (T + B) / 2, 80, 0, 7); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, GL, 14, GR - GL); g.fillRect(W - 14, GL, 14, GR - GL);
    g.fillStyle = 'rgba(0,0,0,.25)'; text(g, `${this.goals[0]} - ${this.goals[1]}`, W / 2, 90, 34);
    this.p.forEach((p, i) => { if (this.near(i) && !this.isBot(i)) { g.strokeStyle = '#ffd60a'; g.lineWidth = 3; g.beginPath(); g.arc(p.x, p.y - 30, 50, 0, 7); g.stroke(); } this.stick(g, i, p.x, p.y, 0.8, p.kick > 0 ? 'jump' : 'run', this.team[i] ? -1 : 1); });
    const b = this.ball; g.fillStyle = '#fff'; g.beginPath(); g.arc(b.x, b.y, 14, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(b.x + 3, b.y - 2, 5, 0, 7); g.fill();
  }
}
