// input.js — zones tactiles multi-touch (Pointer Events) + clavier + souris
// L'écran est divisé en bandes verticales : une par joueur humain.
export const KEYS = [['KeyA', 'Space'], ['KeyL'], ['KeyV'], ['ArrowUp']];
export const KEY_LABELS = ['A', 'L', 'V', '↑'];
export class TouchZones {
  constructor(el) {
    this.el = el; this.count = 1; this.pointers = new Map(); this.down = [0, 0, 0, 0];
    this.onPress = null; this.onRelease = null; this.enabled = false;
    const opt = { passive: false };
    el.addEventListener('pointerdown', e => this._down(e), opt);
    el.addEventListener('pointerup', e => this._up(e), opt);
    el.addEventListener('pointercancel', e => this._up(e), opt);   // gestion obligatoire de pointercancel
    el.addEventListener('lostpointercapture', e => this._up(e), opt);
    el.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', e => this._key(e, true));
    window.addEventListener('keyup', e => this._key(e, false));
    window.addEventListener('blur', () => this.releaseAll());
  }
  zoneAt(clientX) { const r = this.el.getBoundingClientRect(); return Math.min(this.count - 1, Math.max(0, Math.floor((clientX - r.left) / r.width * this.count))); }
  _down(e) {
    e.preventDefault(); if (!this.enabled) return;
    try { this.el.setPointerCapture(e.pointerId); } catch { }
    const z = this.zoneAt(e.clientX); this.pointers.set(e.pointerId, z);
    if (this.down[z]++ === 0) this.onPress && this.onPress(z);
  }
  _up(e) {
    if (!this.pointers.has(e.pointerId)) return;
    const z = this.pointers.get(e.pointerId); this.pointers.delete(e.pointerId);
    if (--this.down[z] <= 0) { this.down[z] = 0; this.onRelease && this.onRelease(z); }
  }
  _key(e, isDown) {
    if (!this.enabled || e.repeat) return;
    const z = KEYS.findIndex(k => k.includes(e.code)); if (z < 0 || z >= this.count) return;
    e.preventDefault();
    if (isDown) { if (this.down[z]++ === 0) this.onPress && this.onPress(z); }
    else if (this.down[z] > 0) { this.down[z] = 0; this.onRelease && this.onRelease(z); }
  }
  releaseAll() { for (let z = 0; z < 4; z++) if (this.down[z]) { this.down[z] = 0; this.onRelease && this.onRelease(z); } this.pointers.clear(); }
}
