// leaderboard.js — classement local (via services.leaderboard, branchable sur un cloud plus tard)
import { services } from './cloud.js';
export const submitResult = (name, rank) => services.leaderboard.submit({ name, points: [10, 6, 3, 1][rank - 1] || 0, win: rank === 1 });
export const top = n => services.leaderboard.top(n);
