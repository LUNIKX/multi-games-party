// save.js — sauvegarde localStorage en JSON avec numéro de version du schéma
const KEY = 'mgp_save';
export const SCHEMA_VERSION = 2;

export function defaultSave() {
  return {
    version: SCHEMA_VERSION,
    profile: { name: 'Joueur', xp: 0, level: 1, coins: 50, created: Date.now() },
    settings: { lang: (navigator.language || 'fr').startsWith('fr') ? 'fr' : 'en', master: 0.8, music: 0.5, sfx: 0.9, vibration: true, quality: 'high', intro: true, iosGuideShown: false },
    unlockedChars: ['classic', 'cap', 'headband'],
    unlockedColors: [0, 1, 2, 3, 4],
    setup: { humans: 1, total: 4, difficulty: 'normal', players: [ { char: 'classic', color: 0 }, { char: 'cap', color: 1 }, { char: 'headband', color: 2 }, { char: 'classic', color: 3 } ] },
    best: {},           // meilleur score par mini-jeu
    stats: { games: 0, wins: 0, tournaments: 0, tournamentWins: 0, perGame: {} },
    missions: { daily: null, weekly: null },
    achievements: {},
    leaderboard: []     // classement local
  };
}

// Migration des anciennes versions vers la version actuelle
function migrate(d) {
  const def = defaultSave();
  if (!d || typeof d !== 'object') return def;
  if (!d.version || d.version < 2) { d.leaderboard ||= []; d.achievements ||= {}; }
  // fusion profonde légère pour ajouter les nouvelles clés
  for (const k of Object.keys(def)) {
    if (d[k] === undefined) d[k] = def[k];
    else if (typeof def[k] === 'object' && !Array.isArray(def[k]) && def[k] !== null) d[k] = { ...def[k], ...d[k] };
  }
  d.version = SCHEMA_VERSION;
  return d;
}

export let save = load();
export function load() {
  try { return migrate(JSON.parse(localStorage.getItem(KEY))); } catch { return defaultSave(); }
}
export function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* stockage plein ou privé */ } }
export function resetSave() { save = defaultSave(); persist(); location.reload(); }
