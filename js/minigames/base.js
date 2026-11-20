// base.js — MiniGameBase : tout ce qui est commun aux 30 mini-jeux
// (compte à rebours, scores, classement, bots, particules, HUD, zones tactiles)
import { W, H, text, rr, clamp } from '../core.js';
import { BotController } from '../ai.js';
import { sound, vibrate } from '../audio.js';
import { drawStickman, COLORS, charById } from '../characters.js';
import { KEY_LABELS } from '../input.js';
import { L } from '../i18n.js';

const MAXP = 220; // particules pré-allouées (pas de création d'objets dans la boucle)

export class MiniGameBase {
  // opts : { def, players:[{name,color,char,isBot,slot}], difficulty, quality, onEnd, data }
  constructor(opts) {
    this.def = opts.def; this.opts = opts; this.players = opts.players; this.n = this.players.length;
    this.data = opts.data || {};
    this.duration = this.def.duration;     // durée max (s)
    this.rankMode = 'score';               // 'score' | 'elim' | 'race'
    this.lowerIsBetter = false;
    this.endOnLastAlive = true;
    this.scores = new Array(this.n).fill(0);
    this.alive = new Array(this.n).fill(true);
    this.held = new Array(this.n).fill(false);
    this.elimOrder = []; this.finishOrder = [];
    this.state = 'countdown'; this.cd = 3.5; this.time = 0; this.anim = 0;
    this.bot = new BotController(opts.difficulty);
    this.botS = this.players.map(() => ({ timer: -1, act: 0, cool: 0 }));
    this.parts = Array.from({ length: MAXP }, () => ({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, c: '#fff', s: 4 }));
    this.partLimit = opts.quality === 'low' ? 60 : MAXP;
    this.shake = 0; this.banner = null; this.bannerT = 0;
    this.init();
  }
  // ---- hooks à surcharger ----
  init() { }
  update(dt) { }
  draw(g) { }
  onPress(i) { }
  onRelease(i) { }
  bots(dt) { }                   // logique de décision des bots (appelée à chaque frame)
  progress(i) { return this.scores[i]; }
  scoreText(i) { return String(Math.round(this.scores[i])); }

  // ---- helpers communs ----
  color(i) { return COLORS[this.players[i].color].hex; }
  acc(i) { return charById(this.players[i].char).acc; }
  stick(g, i, x, y, s, pose, dir = 1, t = this.anim) { drawStickman(g, x, y, s, this.color(i), this.acc(i), pose, t + i * 0.37, dir); }
  isBot(i) { return this.players[i].isBot; }
  aliveCount() { return this.alive.reduce((a, b) => a + (b ? 1 : 0), 0); }
  say(msg, t = 1.2) { this.banner = msg; this.bannerT = t; }

  // Bot : programme un appui après le temps de réaction (ou le rate selon le taux d'erreur)
  botTap(i, mult = 1) {
    const s = this.botS[i]; if (s.timer >= 0 || s.cool > 0) return;
    if (this.bot.fails()) { s.cool = this.bot.reaction() * 1.5; return; }
    s.timer = this.bot.reaction() * mult; s.act = 0;
  }
  // Bot : maintenir/relâcher (jeux avec « tenir »)
  botHold(i, want) {
    const s = this.botS[i]; if (this.held[i] === want) { s.timer = -1; return; }
    if (s.timer >= 0) return; s.timer = this.bot.reaction() * 0.7; s.act = want ? 1 : 2;
  }
  _botTick(dt) {
    for (let i = 0; i < this.n; i++) {
      if (!this.isBot(i)) continue; const s = this.botS[i];
      if (s.cool > 0) s.cool -= dt;
      if (s.timer >= 0) {
        s.timer -= dt;
        if (s.timer < 0) {
          if (s.act === 0) { this.press(i); this.release(i); }
          else if (s.act === 1) this.press(i); else this.release(i);
          s.cool = 0.08;
        }
      }
    }
    this.bots(dt);
  }

  press(i) {
    if (this.state !== 'play' || !this.alive[i] && this.rankMode === 'elim') return;
    if (this.held[i]) return; this.held[i] = true; this.onPress(i);
  }
  release(i) { if (!this.held[i]) return; this.held[i] = false; if (this.state === 'play') this.onRelease(i); }

  eliminate(i) {
    if (!this.alive[i]) return; this.alive[i] = false; this.elimOrder.push(i);
    sound.lose(); vibrate(120); this.shake = 0.3;
    if (this.endOnLastAlive && this.aliveCount() <= (this.n > 1 ? 1 : 0)) this.finish();
  }
  finishPlayer(i) {
    if (this.finishOrder.includes(i)) return; this.finishOrder.push(i); sound.good();
    if (this.finishOrder.length >= this.n) this.finish();
  }
  burst(x, y, c, n = 12, sp = 300, sz = 5) {
    let made = 0;
    for (let k = 0; k < this.partLimit && made < n; k++) {
      const p = this.parts[k]; if (p.on) continue;
      const a = Math.random() * Math.PI * 2, v = sp * (0.3 + Math.random() * 0.7);
      p.on = true; p.x = x; p.y = y; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - 80; p.life = p.max = 0.5 + Math.random() * 0.5; p.c = c; p.s = sz * (0.6 + Math.random() * 0.8); made++;
    }
  }

  // Classement final : [{i, rank, score}] (ex æquo = même rang)
  ranking() {
    const idx = [...Array(this.n).keys()]; let key;
    if (this.rankMode === 'race') key = i => { const f = this.finishOrder.indexOf(i); return f >= 0 ? 1e6 - f : this.progress(i); };
    else if (this.rankMode === 'elim') key = i => this.alive[i] ? 1e6 + this.scores[i] : this.elimOrder.indexOf(i);
    else key = i => this.lowerIsBetter ? -this.scores[i] : this.scores[i];
    idx.sort((a, b) => key(b) - key(a));
    const res = []; let rank = 1;
    idx.forEach((i, k) => { if (k > 0 && key(i) !== key(idx[k - 1])) rank = k + 1; res.push({ i, rank, score: this.scoreText(i) }); });
    return res;
  }
  finish() {
    if (this.state !== 'play') return; this.state = 'done'; this.doneT = 1.4; sound.win();
  }

  // ---- boucle ----
  tick(dt) {
    this.anim += dt; if (this.shake > 0) this.shake -= dt; if (this.bannerT > 0) this.bannerT -= dt;
    for (let k = 0; k < MAXP; k++) { const p = this.parts[k]; if (!p.on) continue; p.life -= dt; if (p.life <= 0) { p.on = false; continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; }
    if (this.state === 'countdown') {
      const before = Math.ceil(this.cd - 0.5); this.cd -= dt; const after = Math.ceil(this.cd - 0.5);
      if (after !== before && after > 0) sound.count();
      if (this.cd <= 0.5) { this.state = 'play'; sound.go(); vibrate(30); }
      return;
    }
    if (this.state === 'play') {
      this.time += dt; this._botTick(dt); this.update(dt);
      if (this.duration && this.time >= this.duration) this.finish();
    } else if (this.state === 'done') {
      this.update(dt * 0.25); this.doneT -= dt;
      if (this.doneT <= 0 && !this.ended) { this.ended = true; this.opts.onEnd(this.ranking()); }
    }
  }
  render(g, cw, ch, zones) {
    // letterbox : le monde 1280x720 est mis à l'échelle de l'écran
    const sc = Math.min(cw / W, ch / H), ox = (cw - W * sc) / 2, oy = (ch - H * sc) / 2;
    g.fillStyle = '#1b1035'; g.fillRect(0, 0, cw, ch);
    g.save(); g.translate(ox, oy); g.scale(sc, sc);
    if (this.shake > 0) g.translate((Math.random() - .5) * 14, (Math.random() - .5) * 14);
    g.beginPath(); g.rect(0, 0, W, H); g.clip();
    this.draw(g);
    for (let k = 0; k < MAXP; k++) { const p = this.parts[k]; if (!p.on) continue; g.globalAlpha = p.life / p.max; g.fillStyle = p.c; g.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
    g.globalAlpha = 1;
    this.drawHUD(g);
    g.restore();
    this.drawZones(g, cw, ch, zones);
  }
  drawHUD(g) {
    // chronomètre + scores
    g.fillStyle = 'rgba(20,10,40,.55)'; rr(g, 8, 6, W - 16, 52, 16); g.fill();
    const left = this.duration ? Math.max(0, this.duration - this.time) : this.time;
    text(g, (this.duration ? '⏱ ' : '') + Math.ceil(left), W / 2, 32, 30, left < 6 && this.duration ? '#ff5d5d' : '#fff');
    const slotW = 260;
    for (let i = 0; i < this.n; i++) {
      const x = i < 2 ? 20 + i * slotW : W - 20 - (4 - i) * slotW + 0;
      g.globalAlpha = this.alive[i] ? 1 : 0.45;
      g.fillStyle = this.color(i); rr(g, x, 14, slotW - 20, 36, 12); g.fill();
      text(g, (this.players[i].isBot ? '🤖 ' : '') + this.players[i].name, x + 12, 32, 20, '#fff', 'left');
      text(g, this.scoreText(i), x + slotW - 32, 32, 22, '#fff', 'right');
      g.globalAlpha = 1;
    }
    if (this.state === 'countdown') {
      const c = Math.ceil(this.cd - 0.5); g.fillStyle = 'rgba(15,5,35,.45)'; g.fillRect(0, 0, W, H);
      const k = 1 + (this.cd - 0.5 - Math.floor(this.cd - 0.5)) * 0.5;
      text(g, c > 0 ? String(c) : 'GO !', W / 2, H / 2, 150 * k, '#ffd60a');
    }
    if (this.bannerT > 0 && this.banner) text(g, this.banner, W / 2, 110, 46, '#ffd60a');
    if (this.state === 'done') { g.fillStyle = 'rgba(15,5,35,.4)'; g.fillRect(0, 0, W, H); text(g, L({ fr: 'TERMINÉ !', en: 'FINISHED!' }), W / 2, H / 2, 110, '#ffd60a'); }
  }
  // indicateurs des zones tactiles (bandes verticales, une par humain)
  drawZones(g, cw, ch, zones) {
    const humans = this.players.filter(p => !p.isBot); const n = humans.length; if (!n) return;
    for (const p of humans) {
      const z = p.slot, x0 = cw * z / n, w = cw / n, i = this.players.indexOf(p);
      g.fillStyle = this.color(i); g.globalAlpha = this.held[i] ? 0.35 : 0.12; g.fillRect(x0, ch - 46, w, 46); g.globalAlpha = 1;
      if (n > 1) { g.fillStyle = 'rgba(255,255,255,.25)'; if (z > 0) g.fillRect(x0 - 1, ch - 46, 2, 46); }
      text(g, `${p.name} · ${KEY_LABELS[z]}`, x0 + w / 2, ch - 23, 18, '#fff');
    }
  }
}
