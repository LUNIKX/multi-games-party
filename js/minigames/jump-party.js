// 4. Jump Party — grimpe de plateforme en plateforme, la lave monte : le dernier en vie gagne
import { MiniGameBase } from './base.js';
import { W, H, rand, text } from '../core.js';
import { column, TOP } from './helpers.js';
import { sound } from '../audio.js';
const GAP = 110;
export default class JumpParty extends MiniGameBase {
  init() {
    this.rankMode = 'elim'; this.lava = -160;
    this.pl = this.players.map(() => ({ lvl: 0, anim: 0, from: 0, fallT: 0 }));
    this.plats = Array.from({ length: 400 }, (_, k) => ({ ph: rand(0, 6), sp: rand(1, 1.8) + k * 0.01, w: Math.max(0.28, 0.6 - k * 0.006) }));
  }
  // position relative (-1..1) du centre de la plateforme du niveau k
  platX(k) { if (k === 0) return 0; const p = this.plats[k]; return Math.sin(this.time * p.sp + p.ph) * 0.75; }
  covers(k) { return Math.abs(this.platX(k)) < this.plats[k].w * 0.5 + 0.05; }
  scoreText(i) { return this.pl[i].lvl + 'm'; }
  onPress(i) {
    const p = this.pl[i]; if (p.anim > 0 || p.fallT > 0) return;
    sound.jump(); p.from = p.lvl; p.anim = 0.3;
    if (this.covers(p.lvl + 1)) { p.lvl++; this.scores[i] = p.lvl; } else { p.fallT = 0.5; if (p.lvl > 0) p.lvl--; sound.bad(); }
  }
  bots() { for (let i = 0; i < this.n; i++) if (this.isBot(i) && this.alive[i]) { const p = this.pl[i]; if (Math.abs(this.platX(p.lvl + 1)) < this.plats[p.lvl + 1].w * 0.35 * this.bot.skill + 0.05) this.botTap(i, 0.15); } }
  update(dt) {
    this.lava += (22 + this.time * 1.4) * dt;
    for (let i = 0; i < this.n; i++) {
      const p = this.pl[i]; if (p.anim > 0) p.anim -= dt; if (p.fallT > 0) p.fallT -= dt;
      if (this.alive[i] && p.lvl * GAP < this.lava) { this.eliminate(i); }
    }
  }
  draw(g) {
    const top = Math.max(...this.pl.map((p, i) => this.alive[i] ? p.lvl : 0));
    const cam = Math.max(0, top * GAP - 300);
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0f2027'); gr.addColorStop(1, '#2c5364'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const Y = h => H - 90 - (h - cam);
    for (let i = 0; i < this.n; i++) {
      const c = column(i, this.n), half = c.w / 2 - 20;
      g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(c.x0 + 4, TOP, c.w - 8, H);
      for (let k = Math.max(0, Math.floor(cam / GAP) - 1); k < Math.floor(cam / GAP) + 9; k++) {
        const pw = k === 0 ? c.w - 20 : this.plats[k].w * half, px = c.cx + this.platX(k) * half;
        g.fillStyle = k === 0 ? '#555' : this.color(i); g.fillRect(px - pw / 2, Y(k * GAP), pw, 14); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(px - pw / 2, Y(k * GAP) + 10, pw, 4);
      }
      const p = this.pl[i];
      const jumpOff = p.anim > 0 ? Math.sin((1 - p.anim / 0.3) * Math.PI) * 60 : 0;
      const shownLvl = p.anim > 0 ? p.from + (p.lvl - p.from) * (1 - p.anim / 0.3) : p.lvl;
      const px = c.cx + (p.lvl === 0 ? 0 : this.platX(p.lvl) * half);
      if (this.alive[i] || this.state !== 'play') this.stick(g, i, px, Y(shownLvl * GAP) - jumpOff, 0.8, !this.alive[i] ? 'stun' : p.fallT > 0 ? 'fall' : p.anim > 0 ? 'jump' : 'idle');
    }
    // lave
    const ly = Y(this.lava); g.fillStyle = '#ff4500';
    g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 40) g.lineTo(x, ly + Math.sin(x * 0.03 + this.anim * 4) * 8); g.lineTo(W, H); g.fill();
    g.fillStyle = '#ffbe0b'; g.globalAlpha = 0.5; g.fillRect(0, ly + 12, W, 6); g.globalAlpha = 1;
  }
}
