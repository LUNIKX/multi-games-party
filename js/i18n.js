// i18n.js — traductions FR/EN chargées depuis /data/locales
import { save } from './save.js';
let dict = {};
export async function loadLang(lang) {
  const r = await fetch(`data/locales/${lang}.json`); dict = await r.json();
  document.documentElement.lang = lang;
}
// t('clé', {n:3}) → texte traduit avec remplacement {n}
export function t(key, vars) {
  let s = dict[key] ?? key;
  if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
  return s;
}
export const lang = () => save.settings.lang;
// texte bilingue inline {fr, en}
export const L = o => (typeof o === 'string' ? o : o[save.settings.lang] ?? o.fr);
