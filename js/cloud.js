// cloud.js — interfaces auth / classement / cloud, version LOCALE uniquement.
// Pour brancher Firebase plus tard : créer une classe avec les mêmes méthodes et remplacer l'export.
import { save, persist } from './save.js';
export class LocalAuth {
  async currentUser() { return { id: 'local', name: save.profile.name, provider: 'local' }; }
  async signIn() { return this.currentUser(); }
  async signOut() { return true; }
}
export class LocalLeaderboard {
  // entry : {name, points, win:bool} — cumule par nom
  async submit(entry) {
    let e = save.leaderboard.find(x => x.name === entry.name);
    if (!e) { e = { name: entry.name, points: 0, games: 0, wins: 0 }; save.leaderboard.push(e); }
    e.points += entry.points; e.games++; if (entry.win) e.wins++;
    save.leaderboard.sort((a, b) => b.points - a.points); save.leaderboard = save.leaderboard.slice(0, 50); persist();
  }
  async top(n = 20) { return save.leaderboard.slice(0, n); }
}
export class LocalCloudSave {
  async upload() { persist(); return true; }
  async download() { return save; }
}
export const services = { auth: new LocalAuth(), leaderboard: new LocalLeaderboard(), cloud: new LocalCloudSave() };
