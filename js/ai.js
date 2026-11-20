// ai.js — BotController commun : temps de réaction et taux d'erreur selon la difficulté
export const BOT_LEVELS = {
  easy:   { react: [0.45, 0.85], error: 0.28, skill: 0.45 },
  normal: { react: [0.25, 0.5],  error: 0.13, skill: 0.7 },
  hard:   { react: [0.12, 0.28], error: 0.05, skill: 0.92 },
};
export class BotController {
  constructor(level = 'normal', overrides) { this.p = { ...BOT_LEVELS[level], ...(overrides || {}) }; this.level = level; }
  reaction() { const [a, b] = this.p.react; return a + Math.random() * (b - a); }
  fails() { return Math.random() < this.p.error; }   // le bot se trompe ?
  get skill() { return this.p.skill; }              // 0..1 : précision générale
}
