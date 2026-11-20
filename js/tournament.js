// tournament.js — tournoi : manches, points par rang, tableau, vainqueur
import { GAMES } from './minigames/registry.js';
import { shuffle } from './core.js';
export const POINTS = [10, 6, 3, 1]; // points selon le rang
export class Tournament {
  constructor(players, rounds, gameIds) {
    this.players = players; this.rounds = rounds; this.round = 0;
    const pool = gameIds && gameIds.length ? gameIds : shuffle(GAMES.map(g => g.id));
    this.games = Array.from({ length: rounds }, (_, k) => pool[k % pool.length]);
    this.points = players.map(() => 0); this.history = [];
  }
  get current() { return this.games[this.round]; }
  record(ranking) { ranking.forEach(r => this.points[r.i] += POINTS[r.rank - 1] || 0); this.history.push({ game: this.current, ranking }); this.round++; }
  get over() { return this.round >= this.rounds; }
  standings() { return this.players.map((p, i) => ({ i, p, pts: this.points[i] })).sort((a, b) => b.pts - a.pts); }
}
