// profile.js — profil local du joueur
import { save, persist } from './save.js';
import { xpForLevel } from './rewards.js';
export const profile = {
  get name() { return save.profile.name; },
  setName(n) { save.profile.name = (n || '').trim().slice(0, 14) || 'Joueur'; persist(); },
  summary() { const p = save.profile, s = save.stats; return { ...p, need: xpForLevel(p.level), games: s.games, wins: s.wins, rate: s.games ? Math.round(s.wins / s.games * 100) : 0, tournaments: s.tournaments, tournamentWins: s.tournamentWins }; }
};
