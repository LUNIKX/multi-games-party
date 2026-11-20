// rewards.js — XP, niveaux, pièces, missions quotidiennes/hebdo, succès
import { save, persist } from './save.js';
import { CHARACTERS } from './characters.js';
import { pick, shuffle } from './core.js';

export const xpForLevel = lvl => 100 + (lvl - 1) * 60;
export function addXP(n) {
  const p = save.profile, ups = []; p.xp += n;
  while (p.xp >= xpForLevel(p.level)) { p.xp -= xpForLevel(p.level); p.level++; ups.push(p.level); p.coins += 25; }
  // déblocage automatique des personnages par niveau
  for (const c of CHARACTERS) if (c.level && p.level >= c.level && !save.unlockedChars.includes(c.id)) save.unlockedChars.push(c.id);
  return ups;
}
const MISSION_TPL = [
  { k: 'play', n: 3, fr: 'Joue {n} mini-jeux', en: 'Play {n} mini-games', r: 30 },
  { k: 'win', n: 2, fr: 'Gagne {n} mini-jeux', en: 'Win {n} mini-games', r: 50 },
  { k: 'cat:race', n: 2, fr: 'Joue {n} courses', en: 'Play {n} races', r: 30 },
  { k: 'cat:mind', n: 2, fr: 'Joue {n} jeux de logique', en: 'Play {n} logic games', r: 30 },
  { k: 'cat:arena', n: 2, fr: 'Joue {n} jeux d\'arène', en: 'Play {n} arena games', r: 30 },
  { k: 'cat:ball', n: 2, fr: 'Joue {n} jeux de balle', en: 'Play {n} ball games', r: 30 },
  { k: 'podium', n: 3, fr: 'Finis {n} fois sur le podium', en: 'Finish on the podium {n} times', r: 40 },
];
const WEEKLY_TPL = [
  { k: 'play', n: 25, fr: 'Joue {n} mini-jeux', en: 'Play {n} mini-games', r: 200 },
  { k: 'win', n: 12, fr: 'Gagne {n} mini-jeux', en: 'Win {n} mini-games', r: 250 },
  { k: 'tournament', n: 2, fr: 'Termine {n} tournois', en: 'Finish {n} tournaments', r: 200 },
];
const dayKey = () => new Date().toISOString().slice(0, 10);
const weekKey = () => { const d = new Date(); const j = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + '-W' + Math.ceil(((d - j) / 864e5 + j.getDay() + 1) / 7); };
export function ensureMissions() {
  const m = save.missions;
  if (!m.daily || m.daily.key !== dayKey()) m.daily = { key: dayKey(), list: shuffle([...MISSION_TPL]).slice(0, 3).map(t => ({ ...t, p: 0, done: false, claimed: false })) };
  if (!m.weekly || m.weekly.key !== weekKey()) m.weekly = { key: weekKey(), list: WEEKLY_TPL.map(t => ({ ...t, p: 0, done: false, claimed: false })) };
  persist(); return m;
}
function bump(keys) { ensureMissions(); for (const l of [save.missions.daily.list, save.missions.weekly.list]) for (const m of l) if (keys.includes(m.k) && !m.done) { m.p++; if (m.p >= m.n) m.done = true; } }
export function claimMission(m) { if (!m.done || m.claimed) return 0; m.claimed = true; save.profile.coins += m.r; persist(); return m.r; }

export const ACHIEVEMENTS = [
  { id: 'first', fr: 'Première partie', en: 'First game', test: s => s.stats.games >= 1, r: 20 },
  { id: 'firstwin', fr: 'Première victoire', en: 'First win', test: s => s.stats.wins >= 1, r: 30 },
  { id: 'g25', fr: 'Fêtard (25 parties)', en: 'Party animal (25 games)', test: s => s.stats.games >= 25, r: 80 },
  { id: 'w25', fr: 'Champion (25 victoires)', en: 'Champion (25 wins)', test: s => s.stats.wins >= 25, r: 150 },
  { id: 'all30', fr: 'Touche-à-tout (30 jeux différents)', en: 'Jack of all trades (30 games)', test: s => Object.keys(s.stats.perGame).length >= 30, r: 200 },
  { id: 'tour1', fr: 'Premier tournoi gagné', en: 'First tournament win', test: s => s.stats.tournamentWins >= 1, r: 100 },
  { id: 'lvl5', fr: 'Niveau 5', en: 'Level 5', test: s => s.profile.level >= 5, r: 60 },
  { id: 'lvl10', fr: 'Niveau 10', en: 'Level 10', test: s => s.profile.level >= 10, r: 150 },
  { id: 'rich', fr: '1000 pièces', en: '1000 coins', test: s => s.profile.coins >= 1000, r: 100 },
  { id: 'collector', fr: 'Collectionneur (8 persos)', en: 'Collector (8 characters)', test: s => s.unlockedChars.length >= 8, r: 120 },
];
export function checkAchievements() {
  const got = [];
  for (const a of ACHIEVEMENTS) if (!save.achievements[a.id] && a.test(save)) { save.achievements[a.id] = Date.now(); save.profile.coins += a.r; got.push(a); }
  return got;
}
// Récompenses après un mini-jeu pour le profil (joueur 1)
export function rewardGame(def, rank, n, rawScore) {
  const st = save.stats; st.games++; st.perGame[def.id] = (st.perGame[def.id] || 0) + 1;
  const won = rank === 1; if (won) st.wins++;
  const xp = 15 + (n - rank) * 10 + (won ? 15 : 0), coins = 5 + (n - rank) * 4 + (won ? 10 : 0);
  save.profile.coins += coins; const ups = addXP(xp);
  const keys = ['play', 'cat:' + def.cat]; if (won) keys.push('win'); if (rank <= 3) keys.push('podium'); bump(keys);
  const num = parseFloat(rawScore); if (!isNaN(num) && (save.best[def.id] === undefined || num > save.best[def.id])) save.best[def.id] = num;
  const ach = checkAchievements(); persist();
  return { xp, coins, ups, ach };
}
export function rewardTournament(won) { save.stats.tournaments++; if (won) { save.stats.tournamentWins++; save.profile.coins += 100; addXP(100); } bump(['tournament']); const ach = checkAchievements(); persist(); return ach; }
