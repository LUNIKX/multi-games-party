// main.js — point d'entrée : canvas, boucle, liaison UI ↔ mini-jeux, PWA
import { Loop } from './core.js';
import { save } from './save.js';
import { loadLang } from './i18n.js';
import { TouchZones } from './input.js';
import { initUI, showBoot, showMenu, showIOSGuide, showPause } from './ui.js';
import { ensureMissions } from './rewards.js';
import { persist } from './save.js';

const canvas = document.getElementById('game'), g = canvas.getContext('2d');
const zones = new TouchZones(canvas);
let game = null, paused = false, cw = 0, ch = 0, quiz = { fr: null, en: null };

// Résolution adaptée : devicePixelRatio plafonné à 2 (1 en qualité basse)
function resize() {
  const dpr = Math.min(save.settings.quality === 'low' ? 1 : 2, window.devicePixelRatio || 1);
  cw = window.innerWidth; ch = window.innerHeight;
  canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize); window.addEventListener('orientationchange', () => setTimeout(resize, 200)); resize();

async function loadQuiz(lang) { if (!quiz[lang]) quiz[lang] = (await (await fetch(`data/quiz_${lang}.json`)).json()).questions; return quiz[lang]; }

const loop = new Loop(dt => {
  const cur = game; if (!cur) return;
  if (!paused) cur.tick(dt);
  if (game === cur) cur.render(g, cw, ch); // la partie peut se terminer pendant tick()
});

// ---- installation PWA ----
let deferred = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone;

const pauseBtn = document.getElementById('pause');
pauseBtn.addEventListener('click', () => { if (!game) return; paused = true; zones.releaseAll(); showPause(() => { paused = false; }, () => { paused = false; showMenu(); }); });
// mise en pause automatique quand on quitte l'application
document.addEventListener('visibilitychange', () => { if (document.hidden && game && !paused && game.state === 'play') pauseBtn.click(); });

initUI(document.getElementById('ui'), {
  async startGame(def, players, difficulty, onEnd) {
    const data = def.id === 'quiz' ? { quiz: await loadQuiz(save.settings.lang) } : {};
    game = new def.cls({ def, players, difficulty, quality: save.settings.quality, lang: save.settings.lang, data, onEnd });
    zones.count = players.filter(p => !p.isBot).length; zones.enabled = true; paused = false;
    zones.onPress = z => { const i = players.findIndex(p => p.slot === z); if (i >= 0 && game) game.press(i); };
    zones.onRelease = z => { const i = players.findIndex(p => p.slot === z); if (i >= 0 && game) game.release(i); };
    document.body.classList.add('playing'); canvas.focus();
  },
  stopGame() { game = null; zones.enabled = false; zones.releaseAll(); document.body.classList.remove('playing'); g.clearRect(0, 0, cw, ch); },
  canInstall: () => !!deferred && !standalone,
  async install() { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; showMenu(); },
  maybeIOSGuide() { if (isIOS && !standalone && !save.settings.iosGuideShown) { save.settings.iosGuideShown = true; persist(); setTimeout(showIOSGuide, 600); } },
  resize,
});

// Bloque zoom au double toucher / pinch sur iOS
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());

(async () => {
  await loadLang(save.settings.lang); ensureMissions(); loop.start();
  showBoot(showMenu);
})();

// Service worker (cache hors ligne) — jamais dans un aperçu/iframe de développement
(function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  const host = location.hostname.toLowerCase(), qs = new URLSearchParams(location.search);
  const preview = window.self !== window.top || /^(id-preview|preview)(-[a-z0-9]+)?--/.test(host) || host.endsWith('lovableproject.com') || host.endsWith('lovableproject-dev.com') || host.includes('beta.lovable.dev') || host === 'localhost' && qs.has('nosw');
  if (preview || qs.has('sw') && qs.get('sw') === 'off') { navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.active && r.active.scriptURL.endsWith('/sw.js') && r.unregister())); return; }
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
})();
