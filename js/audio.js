// audio.js — sons générés par code (Web Audio API), aucun fichier externe
import { save } from './save.js';
let ctx = null, master, music, sfx, musicTimer = null, step = 0;

export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC(); master = ctx.createGain(); music = ctx.createGain(); sfx = ctx.createGain();
      music.connect(master); sfx.connect(master); master.connect(ctx.destination); applyVolumes();
    }
    if (ctx.state === 'suspended') ctx.resume(); // obligatoire sur iPhone après un toucher
  } catch { /* audio indisponible */ }
}
export function applyVolumes() {
  if (!ctx) return; const s = save.settings;
  master.gain.value = s.master; music.gain.value = s.music * 0.35; sfx.gain.value = s.sfx;
}
// Reprise du son au retour sur l'application
document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); });

function tone(freq, dur, type = 'square', vol = 0.3, slide = 0, dest = sfx, when = 0) {
  if (!ctx) return; const t0 = ctx.currentTime + when;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(dur, vol = 0.3) {
  if (!ctx) return; const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = ctx.createBufferSource(), g = ctx.createGain(); g.gain.value = vol; s.buffer = b; s.connect(g); g.connect(sfx); s.start();
}
export const sound = {
  tap: () => tone(660, 0.05, 'square', 0.12),
  jump: () => tone(300, 0.18, 'square', 0.2, 500),
  hit: () => { tone(160, 0.25, 'sawtooth', 0.3, -100); noise(0.15, 0.2); },
  coin: () => { tone(988, 0.07, 'square', 0.2); tone(1319, 0.15, 'square', 0.2, 0, sfx, 0.07); },
  good: () => { tone(660, 0.08, 'triangle', 0.3); tone(880, 0.12, 'triangle', 0.3, 0, sfx, 0.08); },
  bad: () => tone(200, 0.3, 'sawtooth', 0.25, -80),
  count: () => tone(440, 0.15, 'square', 0.25),
  go: () => tone(880, 0.35, 'square', 0.3),
  boom: () => { noise(0.6, 0.5); tone(90, 0.5, 'sine', 0.5, -50); },
  pop: () => { noise(0.12, 0.4); tone(500, 0.08, 'sine', 0.3, -300); },
  click: () => tone(520, 0.04, 'triangle', 0.2),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'square', 0.22, 0, sfx, i * 0.12)),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.25, 'triangle', 0.25, 0, sfx, i * 0.15)),
  beat: (f = 220) => tone(f, 0.12, 'triangle', 0.3),
};
// Musique simple en boucle (séquenceur basse + arpège)
const BASS = [110, 110, 147, 147, 131, 131, 98, 98], ARP = [440, 523, 659, 523, 587, 698, 880, 698];
export function startMusic() {
  if (!ctx || musicTimer) return;
  musicTimer = setInterval(() => {
    if (!ctx || ctx.state !== 'running') return;
    const b = BASS[(step >> 1) % 8]; if (step % 2 === 0) tone(b, 0.22, 'triangle', 0.5, 0, music);
    tone(ARP[step % 8] * (step % 32 >= 16 ? 0.89 : 1), 0.1, 'square', 0.12, 0, music); step++;
  }, 200);
}
export function stopMusic() { clearInterval(musicTimer); musicTimer = null; }
// Vibration optionnelle (n'existe pas sur iPhone : jamais d'erreur)
export function vibrate(ms = 40) { try { if (save.settings.vibration && navigator.vibrate) navigator.vibrate(ms); } catch { } }
