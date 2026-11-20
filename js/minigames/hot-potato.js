// 11. Hot Potato — la bombe passe de joueur en joueur : toucher = la passer au suivant
import { MiniGameBase } from './base.js';
import { W, H, rand, randi, text } from '../core.js';
import { sound, vibrate } from '../audio.js';
export default class HotPotato extends MiniGameBase {
  init() { this.rankMode = 'elim'; this.endOnLastAlive = true; this.duration = 0; this.newRound(); }
  newRound() {
    const al = [...Array(this.n).keys()].filter(i => this.alive[i]);
    this.holder = al[randi(0, al.length - 1)]; this.fuse = rand(5, 10); this.recv = 0.25; this.fly = 0; this.from = this.holder;
  }
  scoreText(i) { return this.alive[i] ? (this.holder === i ? '💣' : '🙂') : '💥'; }
  nextAlive(i) { for (let k = 1; k <= this.n; k++) { const j = (i + k) % this.n; if (this.alive[j]) return j; } return i; }
  onPress(i) { if (i !== this.holder || this.recv > 0) return; this.from = i; this.holder = this.nextAlive(i); this.recv = 0.3; this.fly = 0.3; sound.tap(); }
  bots() { if (this.isBot(this.holder) && this.recv <= 0) this.botTap(this.holder, 0.6); }
  pos(i) { const a = -Math.PI / 2 + i / this.n * Math.PI * 2; return { x: W / 2 + Math.cos(a) * 340, y: 400 + Math.sin(a) * 210 }; }
  update(dt) {
    if (this.recv > 0) this.recv -= dt; if (this.fly > 0) this.fly -= dt;
    this.fuse -= dt;
    if (this.fuse <= 0) { const p = this.pos(this.holder); sound.boom(); vibrate(200); this.shake = 0.5; this.burst(p.x, p.y - 40, '#ff7b00', 40, 500, 8); this.eliminate(this.holder); if (this.state === 'play') this.newRound(); }
  }
  draw(g) {
    const gr = g.createRadialGradient(W / 2, 400, 50, W / 2, 400, 700); gr.addColorStop(0, '#6a040f'); gr.addColorStop(1, '#03071e'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 4; g.beginPath(); g.ellipse(W / 2, 400, 340, 210, 0, 0, 7); g.stroke();
    for (let i = 0; i < this.n; i++) { const p = this.pos(i); if (this.alive[i]) this.stick(g, i, p.x, p.y + 40, 1.1, this.holder === i ? 'stun' : 'idle'); else text(g, '💀', p.x, p.y, 50); }
    // bombe (vole entre joueurs)
    const a = this.pos(this.from), b = this.pos(this.holder), k = this.fly > 0 ? 1 - this.fly / 0.3 : 1;
    const bx = a.x + (b.x - a.x) * k, by = a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * 120 - 70;
    const urgent = this.fuse < 2, s = 1 + (urgent ? Math.sin(this.anim * 30) * 0.15 : 0);
    g.save(); g.translate(bx, by); g.scale(s, s); g.fillStyle = '#222'; g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fill();
    g.strokeStyle = '#8d6e63'; g.lineWidth = 4; g.beginPath(); g.moveTo(10, -20); g.quadraticCurveTo(20, -40, 30, -34); g.stroke();
    g.fillStyle = urgent ? '#ff0' : '#ff7b00'; g.beginPath(); g.arc(30, -34, 5 + Math.random() * 4, 0, 7); g.fill(); g.restore();
    text(g, this.isBot(this.holder) ? '' : this.players[this.holder].name + ' : ' + (this.opts.lang === 'en' ? 'PASS IT!' : 'PASSE-LA !'), W / 2, 680, 30, '#ffd60a');
  }
}
