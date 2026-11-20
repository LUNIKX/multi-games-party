// ui.js — écrans et navigation (DOM, boutons ≥ 48 px, aucune action au survol)
import { save, persist, resetSave } from './save.js';
import { t, L, loadLang } from './i18n.js';
import { sound, applyVolumes, unlockAudio, startMusic } from './audio.js';
import { GAMES, CATEGORIES, gameById } from './minigames/registry.js';
import { CHARACTERS, COLORS, charById, previewCanvas } from './characters.js';
import { rewardGame, rewardTournament, ensureMissions, claimMission, ACHIEVEMENTS, xpForLevel } from './rewards.js';
import { Tournament, POINTS } from './tournament.js';
import { profile } from './profile.js';
import { submitResult, top } from './leaderboard.js';
import { pick, shuffle } from './core.js';
import { KEY_LABELS } from './input.js';

let root, host; // host : fonctions fournies par main.js (startGame, stopGame, installPrompt)
export function initUI(el, h) { root = el; host = h; }

// petit utilitaire de création d'éléments
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs) { const v = attrs[k]; if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), ev => { if (k === 'onclick') sound.click(); v(ev); }); else if (v !== undefined && v !== false) e.setAttribute(k, v); }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
function screen(title, body, back = showMenu, cls = '') {
  root.innerHTML = ''; root.className = 'ui ' + cls; root.hidden = false;
  const head = h('header', { class: 'bar' }, back ? h('button', { class: 'btn ghost', onclick: back }, '← ' + t('back')) : h('span'), h('h2', {}, title), coinsChip());
  root.append(head, h('main', { class: 'content' }, body)); root.scrollTop = 0;
}
const coinsChip = () => h('div', { class: 'chip' }, `⭐ ${save.profile.level}  ·  🪙 ${save.profile.coins}`);
function toast(msg) { const e = h('div', { class: 'toast' }, msg); document.body.append(e); setTimeout(() => e.remove(), 2600); }

// ---------- écran « touche pour commencer » + intro ----------
export function showBoot(next) {
  root.hidden = false; root.className = 'ui boot'; root.innerHTML = '';
  const b = h('button', { class: 'boot-btn', onclick: () => { unlockAudio(); startMusic(); save.settings.intro ? showIntro(next) : next(); } }, logo(), h('span', { class: 'pulse' }, t('tap_start')));
  root.append(b);
}
function logo() { return h('div', { class: 'logo' }, h('span', { class: 'l1' }, 'MULTI GAMES'), h('span', { class: 'l2' }, 'PARTY')); }
function showIntro(next) {
  root.innerHTML = ''; root.className = 'ui intro';
  const parts = h('div', { class: 'parts' }); for (let i = 0; i < 40; i++) { const s = h('i'); s.style.cssText = `--x:${Math.random() * 100}%;--d:${Math.random() * 2}s;--c:${pick(COLORS).hex};--s:${4 + Math.random() * 10}px`; parts.append(s); }
  const sticks = h('div', { class: 'intro-sticks' }); [0, 1, 2, 3].forEach(k => { const c = previewCanvas(CHARACTERS[k].id, k, 110, 'win'); c.style.animationDelay = k * 0.15 + 's'; sticks.append(c); });
  let done = false; const go = () => { if (done) return; done = true; clearTimeout(tm); next(); };
  root.append(h('div', { class: 'lights' }), parts, logo(), sticks, h('button', { class: 'btn ghost skip', onclick: go }, t('skip') + ' ⏭'));
  sound.win(); const tm = setTimeout(go, 6000);
}

// ---------- menu principal ----------
export function showMenu() {
  host.stopGame();
  const items = [
    ['play', '▶️', () => quickPlay()], ['multi', '👥', () => showSetup(() => showGameList('multi'))], ['tournament', '🏆', () => showSetup(showTournamentSetup)],
    ['minigames', '🎮', () => showGameList('list')], ['characters', '🧍', showCharacters], ['rewards', '🎁', showRewards],
    ['leaderboard', '📊', showLeaderboard], ['profile', '👤', showProfile], ['settings', '⚙️', showSettings],
  ];
  root.innerHTML = ''; root.className = 'ui menu'; root.hidden = false;
  const grid = h('div', { class: 'menu-grid' }, items.map(([k, ic, fn], n) => h('button', { class: 'btn menu-btn' + (n === 0 ? ' hero' : ''), onclick: fn, style: `animation-delay:${n * 0.05}s` }, h('span', { class: 'ic' }, ic), t(k))));
  const extra = h('div', { class: 'row center' });
  if (host.canInstall()) extra.append(h('button', { class: 'btn accent', onclick: () => host.install() }, t('install')));
  root.append(h('div', { class: 'menu-top' }, logo(), coinsChip()), grid, extra);
  host.maybeIOSGuide();
}
function quickPlay() { const g = pick(GAMES); showRules(g, { mode: 'quick' }); }

// ---------- configuration des joueurs ----------
export function buildPlayers() {
  const s = save.setup, list = [], used = new Set();
  for (let k = 0; k < s.humans; k++) { const p = s.players[k]; list.push({ name: k === 0 ? save.profile.name : L({ fr: 'J', en: 'P' }) + (k + 1), char: p.char, color: p.color, isBot: false, slot: k }); used.add(p.color); }
  const free = COLORS.map((_, i) => i).filter(i => !used.has(i));
  for (let k = s.humans; k < s.total; k++) list.push({ name: t('bot') + ' ' + (k - s.humans + 1), char: pick(CHARACTERS).id, color: free.shift() ?? k, isBot: true, slot: -1 });
  return list;
}
function showSetup(next) {
  const s = save.setup, body = h('div', { class: 'stack' });
  const render = () => {
    body.innerHTML = '';
    s.total = Math.max(s.total, s.humans, 2);
    body.append(
      h('label', { class: 'lbl' }, t('humans')), seg([1, 2, 3, 4], s.humans, v => { s.humans = v; persist(); render(); }),
      h('label', { class: 'lbl' }, t('total')), seg([2, 3, 4], s.total, v => { s.total = Math.max(v, s.humans); persist(); render(); }, v => v < s.humans),
      h('label', { class: 'lbl' }, t('difficulty')), seg(['easy', 'normal', 'hard'], s.difficulty, v => { s.difficulty = v; persist(); render(); }, null, v => t(v)),
      h('div', { class: 'players' }, Array.from({ length: s.humans }, (_, k) => playerCard(k, render))),
      h('p', { class: 'hint' }, t('zones_hint')),
      h('button', { class: 'btn hero big', onclick: next }, t('continue') + ' →'));
  };
  render(); screen(t('players_setup'), body);
}
function seg(vals, cur, fn, disabled, label = v => String(v)) { return h('div', { class: 'seg' }, vals.map(v => h('button', { class: 'btn' + (v === cur ? ' on' : ''), disabled: disabled && disabled(v) ? 'disabled' : undefined, onclick: () => fn(v) }, label(v)))); }
function playerCard(k, rerender) {
  const p = save.setup.players[k], chars = CHARACTERS.filter(c => save.unlockedChars.includes(c.id)), cols = save.unlockedColors;
  const cyc = (arr, cur, d) => arr[(arr.indexOf(cur) + d + arr.length) % arr.length];
  return h('div', { class: 'pcard', style: `--pc:${COLORS[p.color].hex}` },
    h('b', {}, (k === 0 ? save.profile.name : L({ fr: 'J', en: 'P' }) + (k + 1)) + ' · ' + KEY_LABELS[k]), previewCanvas(p.char, p.color, 90),
    h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => { p.char = cyc(chars.map(c => c.id), p.char, -1); persist(); rerender(); } }, '◀'), h('span', { class: 'nm' }, L(charById(p.char).name)), h('button', { class: 'btn sm', onclick: () => { p.char = cyc(chars.map(c => c.id), p.char, 1); persist(); rerender(); } }, '▶')),
    h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => { p.color = cyc(cols, p.color, -1); persist(); rerender(); } }, '◀'), h('span', { class: 'dot', style: `background:${COLORS[p.color].hex}` }), h('button', { class: 'btn sm', onclick: () => { p.color = cyc(cols, p.color, 1); persist(); rerender(); } }, '▶')));
}

// ---------- liste des mini-jeux ----------
function showGameList(mode, onPick) {
  const body = h('div', {});
  if (mode !== 'pick') body.append(h('button', { class: 'btn accent', onclick: () => showRules(pick(GAMES), { mode }) }, t('random')));
  for (const c in CATEGORIES) {
    body.append(h('h3', { class: 'cat' }, CATEGORIES[c].icon + ' ' + L(CATEGORIES[c])));
    body.append(h('div', { class: 'games' }, GAMES.filter(g => g.cat === c).map(g => {
      const n = GAMES.indexOf(g) + 1, best = save.best[g.id];
      return h('button', { class: 'btn game-card', onclick: () => onPick ? onPick(g) : showRules(g, { mode }) }, h('span', { class: 'gi' }, g.icon), h('span', { class: 'gn' }, n + '. ' + L(g.name)), h('small', {}, L(g.rules).slice(0, 70) + '…'), h('small', { class: 'best' }, '★'.repeat(g.diff) + (best !== undefined ? `  ·  ${t('best')} : ${best}` : '')));
    })));
  }
  screen(mode === 'pick' ? t('choose_game') : mode === 'multi' ? t('choose_game') : t('all_games'), body, mode === 'pick' ? showTournamentSetup : showMenu);
}

// ---------- règles puis partie ----------
function showRules(def, ctx) {
  const players = ctx.players || buildPlayers();
  const body = h('div', { class: 'rules' },
    h('div', { class: 'big-ic' }, def.icon), h('p', { class: 'rule-txt' }, L(def.rules)),
    h('p', { class: 'hint' }, t('zones_hint')),
    h('div', { class: 'row center wrap' }, players.map(p => h('span', { class: 'tag', style: `background:${COLORS[p.color].hex}` }, (p.isBot ? '🤖 ' : '') + p.name + (p.isBot ? '' : ' · ' + KEY_LABELS[p.slot])))),
    h('div', { class: 'row center' }, h('button', { class: 'btn hero big', onclick: () => launch(def, players, ctx) }, t('start'))));
  screen((ctx.tour ? t('round', { n: ctx.tour.round + 1, t: ctx.tour.rounds }) + ' · ' : '') + L(def.name), body, ctx.tour ? null : showMenu);
}
function launch(def, players, ctx) {
  root.hidden = true;
  host.startGame(def, players, save.setup.difficulty, ranking => showResults(def, players, ranking, ctx));
}
function showResults(def, players, ranking, ctx) {
  host.stopGame();
  const me = ranking.find(r => r.i === 0), rew = rewardGame(def, me.rank, players.length, me.score);
  ranking.forEach(r => { if (!players[r.i].isBot) submitResult(players[r.i].name, r.rank); });
  if (ctx.tour) ctx.tour.record(ranking);
  const medal = ['🥇', '🥈', '🥉', '4'];
  const body = h('div', { class: 'stack center' },
    h('ol', { class: 'podium' }, ranking.map(r => h('li', { style: `--pc:${COLORS[players[r.i].color].hex}` }, h('span', { class: 'm' }, medal[r.rank - 1]), previewCanvas(players[r.i].char, players[r.i].color, 56, r.rank === 1 ? 'win' : 'idle'), h('b', {}, (players[r.i].isBot ? '🤖 ' : '') + players[r.i].name), h('span', { class: 'sc' }, r.score), ctx.tour ? h('span', { class: 'pts' }, '+' + (POINTS[r.rank - 1] || 0)) : null))),
    h('p', { class: 'earned' }, t('earned', { x: rew.xp, c: rew.coins })));
  rew.ups.forEach(l => toast(t('new_level', { n: l }))); rew.ach.forEach(a => toast('🏅 ' + t('new_ach', { n: L(a) })));
  const row = h('div', { class: 'row center wrap' });
  if (ctx.tour) row.append(h('button', { class: 'btn hero big', onclick: () => showStandings(ctx.tour) }, t('continue') + ' →'));
  else row.append(h('button', { class: 'btn hero big', onclick: () => launch(ctx.mode === 'quick' ? pick(GAMES) : def, players, ctx) }, t('replay')), h('button', { class: 'btn big', onclick: showMenu }, t('menu')));
  body.append(row);
  screen(t('results') + ' · ' + L(def.name), body, null);
}

// ---------- tournoi ----------
function showTournamentSetup() {
  const st = showTournamentSetup.st ||= { rounds: 5, mode: 'random', picked: [] };
  const body = h('div', { class: 'stack' },
    h('label', { class: 'lbl' }, t('rounds')), seg([3, 5, 10], st.rounds, v => { st.rounds = v; showTournamentSetup(); }),
    h('label', { class: 'lbl' }, t('games_choice')), seg(['random', 'pick'], st.mode, v => { st.mode = v; showTournamentSetup(); }, null, v => t(v === 'random' ? 'random_games' : 'pick_games')));
  if (st.mode === 'pick') body.append(h('div', { class: 'checks' }, GAMES.map(g => h('button', { class: 'btn sm chk' + (st.picked.includes(g.id) ? ' on' : ''), onclick: () => { const k = st.picked.indexOf(g.id); k >= 0 ? st.picked.splice(k, 1) : st.picked.push(g.id); showTournamentSetup(); } }, g.icon + ' ' + L(g.name)))));
  body.append(h('button', { class: 'btn hero big', disabled: st.mode === 'pick' && !st.picked.length ? 'disabled' : undefined, onclick: () => { const tour = new Tournament(buildPlayers(), st.rounds, st.mode === 'pick' ? shuffle([...st.picked]) : null); showRules(gameById(tour.current), { tour, players: tour.players }); } }, t('start')));
  screen(t('tournament'), body);
}
function showStandings(tour) {
  const s = tour.standings(), over = tour.over;
  const body = h('div', { class: 'stack center' },
    over ? h('div', { class: 'winner' }, h('div', {}, '🏆 ' + t('winner')), previewCanvas(s[0].p.char, s[0].p.color, 140, 'win'), h('b', {}, s[0].p.name)) : null,
    h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, '#'), h('th', {}, ''), h('th', {}, 'Pts')), s.map((r, k) => h('tr', {}, h('td', {}, k + 1), h('td', {}, h('span', { class: 'dot', style: `background:${COLORS[r.p.color].hex}` }), ' ', r.p.name), h('td', {}, r.pts)))),
    h('p', { class: 'hint' }, tour.history.map((x, k) => (k + 1) + '. ' + gameById(x.game).icon).join('   ')));
  if (over) { const ach = rewardTournament(s[0].i === 0); ach.forEach(a => toast('🏅 ' + t('new_ach', { n: L(a) }))); sound.win(); body.append(h('button', { class: 'btn hero big', onclick: showMenu }, t('menu'))); }
  else body.append(h('p', {}, t('round', { n: tour.round + 1, t: tour.rounds }) + ' : ' + gameById(tour.current).icon + ' ' + L(gameById(tour.current).name)), h('button', { class: 'btn hero big', onclick: () => showRules(gameById(tour.current), { tour, players: tour.players }) }, t('continue') + ' →'));
  screen(t('standings'), body, over ? showMenu : null);
}

// ---------- personnages ----------
function showCharacters(slot = 0) {
  if (typeof slot !== 'number') slot = 0;
  const p = save.setup.players[slot];
  const body = h('div', {},
    h('div', { class: 'seg' }, [0, 1, 2, 3].map(k => h('button', { class: 'btn' + (k === slot ? ' on' : ''), onclick: () => showCharacters(k) }, t('select_for') + ' ' + L({ fr: 'J', en: 'P' }) + (k + 1)))),
    h('div', { class: 'chars' }, CHARACTERS.map(c => {
      const own = save.unlockedChars.includes(c.id), sel = p.char === c.id;
      const act = () => { if (own) { p.char = c.id; persist(); showCharacters(slot); } else if (c.cost && save.profile.coins >= c.cost) { save.profile.coins -= c.cost; save.unlockedChars.push(c.id); p.char = c.id; persist(); sound.coin(); showCharacters(slot); } else sound.bad(); };
      return h('button', { class: 'btn char' + (sel ? ' on' : '') + (own ? '' : ' lock'), onclick: act }, previewCanvas(c.id, p.color, 84, sel ? 'win' : 'idle'), h('b', {}, L(c.name)), h('small', {}, own ? (sel ? '✔' : '') : c.cost ? t('buy', { n: c.cost }) : '🔒 ' + t('unlock_level', { n: c.level })));
    })),
    h('h3', { class: 'cat' }, t('color')),
    h('div', { class: 'row wrap center' }, COLORS.map((c, k) => { const own = save.unlockedColors.includes(k); return h('button', { class: 'btn swatch' + (p.color === k ? ' on' : ''), style: `--sw:${c.hex}`, onclick: () => { if (own) p.color = k; else if (save.profile.coins >= c.cost) { save.profile.coins -= c.cost; save.unlockedColors.push(k); p.color = k; sound.coin(); } else { sound.bad(); return; } persist(); showCharacters(slot); } }, own ? '' : c.cost + '🪙'); })));
  screen(t('characters'), body);
}

// ---------- récompenses ----------
function showRewards() {
  const m = ensureMissions(), pr = save.profile;
  const mission = x => h('div', { class: 'mission' + (x.done ? ' done' : '') }, h('span', {}, L(x).replace('{n}', x.n)), h('span', { class: 'prog' }, Math.min(x.p, x.n) + '/' + x.n), h('button', { class: 'btn sm' + (x.done && !x.claimed ? ' hero' : ''), disabled: !x.done || x.claimed ? 'disabled' : undefined, onclick: () => { const c = claimMission(x); if (c) { sound.coin(); toast('+' + c + ' 🪙'); } showRewards(); } }, x.claimed ? t('claimed') : t('claim') + ' ' + x.r + '🪙'));
  const body = h('div', { class: 'stack' },
    h('div', { class: 'xp' }, h('b', {}, t('level') + ' ' + pr.level), h('div', { class: 'xpbar' }, h('i', { style: `width:${pr.xp / xpForLevel(pr.level) * 100}%` })), h('small', {}, pr.xp + ' / ' + xpForLevel(pr.level) + ' ' + t('xp'))),
    h('h3', { class: 'cat' }, '📅 ' + t('daily')), m.daily.list.map(mission),
    h('h3', { class: 'cat' }, '🗓️ ' + t('weekly')), m.weekly.list.map(mission),
    h('h3', { class: 'cat' }, '🏅 ' + t('achievements')), h('div', { class: 'achs' }, ACHIEVEMENTS.map(a => h('div', { class: 'ach' + (save.achievements[a.id] ? ' got' : '') }, (save.achievements[a.id] ? '🏅 ' : '🔒 ') + L(a), h('small', {}, ' +' + a.r + '🪙')))));
  screen(t('rewards'), body);
}
// ---------- classement ----------
async function showLeaderboard() {
  const rows = await top(20);
  const body = rows.length ? h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, '#'), h('th', {}, t('name')), h('th', {}, 'Pts'), h('th', {}, t('wins')), h('th', {}, t('games_played'))), rows.map((r, k) => h('tr', {}, h('td', {}, ['🥇', '🥈', '🥉'][k] || k + 1), h('td', {}, r.name), h('td', {}, r.points), h('td', {}, r.wins), h('td', {}, r.games)))) : h('p', { class: 'hint' }, t('empty'));
  const best = h('div', { class: 'games' }, GAMES.filter(g => save.best[g.id] !== undefined).map(g => h('div', { class: 'tag dark' }, g.icon + ' ' + L(g.name) + ' : ' + save.best[g.id])));
  screen(t('leaderboard'), h('div', { class: 'stack' }, body, h('h3', { class: 'cat' }, '★ ' + t('best')), best));
}
// ---------- profil ----------
function showProfile() {
  const s = profile.summary(), inp = h('input', { class: 'inp', value: s.name, maxlength: 14, 'aria-label': t('name') });
  inp.addEventListener('change', () => { profile.setName(inp.value); save.setup.players[0] && persist(); });
  const body = h('div', { class: 'stack' },
    h('div', { class: 'row center' }, previewCanvas(save.setup.players[0].char, save.setup.players[0].color, 130, 'win')),
    h('label', { class: 'lbl' }, t('name')), inp,
    h('table', { class: 'tbl' }, [[t('level'), s.level], [t('xp'), s.xp + ' / ' + s.need], [t('coins'), s.coins], [t('games_played'), s.games], [t('wins'), s.wins], [t('winrate'), s.rate + '%'], [t('tournaments'), s.tournaments + ' (' + s.tournamentWins + ')']].map(([a, b]) => h('tr', {}, h('td', {}, a), h('td', {}, b)))));
  screen(t('profile'), body);
}
// ---------- paramètres ----------
function showSettings() {
  const st = save.settings;
  const slider = (k) => { const i = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: st[k], class: 'range', 'aria-label': t(k === 'master' ? 'volume' : k) }); i.addEventListener('input', () => { st[k] = +i.value; applyVolumes(); persist(); }); return i; };
  const body = h('div', { class: 'stack' },
    h('label', { class: 'lbl' }, t('language')), seg(['fr', 'en'], st.lang, async v => { st.lang = v; persist(); await loadLang(v); showSettings(); }, null, v => v === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'),
    h('label', { class: 'lbl' }, t('volume')), slider('master'), h('label', { class: 'lbl' }, t('music')), slider('music'), h('label', { class: 'lbl' }, t('sfx')), slider('sfx'),
    h('label', { class: 'lbl' }, t('vibration')), seg([true, false], st.vibration, v => { st.vibration = v; persist(); showSettings(); }, null, v => t(v ? 'on' : 'off')),
    h('label', { class: 'lbl' }, t('quality')), seg(['high', 'low'], st.quality, v => { st.quality = v; persist(); host.resize(); showSettings(); }, null, v => t(v)),
    h('label', { class: 'lbl' }, t('intro')), seg([true, false], st.intro, v => { st.intro = v; persist(); showSettings(); }, null, v => t(v ? 'on' : 'off')),
    h('button', { class: 'btn danger', onclick: () => { if (confirm(t('reset_confirm'))) resetSave(); } }, '🗑 ' + t('reset')),
    h('h3', { class: 'cat' }, t('about')), h('p', { class: 'hint' }, t('about_text')), h('p', { class: 'hint' }, 'v1.0 · schéma ' + save.version));
  screen(t('settings'), body);
}
export function showIOSGuide() { const d = h('div', { class: 'modal' }, h('div', { class: 'card' }, h('h3', {}, t('ios_title')), h('p', {}, '⬆️ ' + t('ios_text')), h('button', { class: 'btn hero', onclick: () => d.remove() }, t('ok')))); document.body.append(d); }
export function showPause(resume, quit) { const d = h('div', { class: 'modal' }, h('div', { class: 'card' }, h('h3', {}, '⏸'), h('button', { class: 'btn hero big', onclick: () => { d.remove(); resume(); } }, '▶'), h('button', { class: 'btn big', onclick: () => { d.remove(); quit(); } }, t('menu')))); document.body.append(d); }
