// registry.js — registre central des 30 mini-jeux (nom, règles, catégorie, difficulté, durée)
import Race from './race.js'; import ObstacleRace from './obstacle-race.js'; import Platforms from './platforms.js';
import JumpParty from './jump-party.js'; import GravityFlip from './gravity-flip.js'; import LaserDodge from './laser-dodge.js';
import ArenaSurvival from './arena-survival.js'; import SumoPush from './sumo-push.js'; import KingHill from './king-hill.js';
import DodgeRain from './dodge-rain.js'; import HotPotato from './hot-potato.js'; import TugOfWar from './tug-of-war.js';
import Football from './football.js'; import BallArena from './ball-arena.js'; import Pong from './pong.js';
import CoinRush from './coin-rush.js'; import Basket from './basket.js'; import BalloonPop from './balloon-pop.js';
import ReflexDuel from './reflex-duel.js'; import TapFrenzy from './tap-frenzy.js'; import StackTower from './stack-tower.js';
import RopeSwing from './rope-swing.js'; import RhythmTap from './rhythm-tap.js'; import CannonDodge from './cannon-dodge.js';
import MemoryParty from './memory-party.js'; import SimonParty from './simon-party.js'; import QuizParty from './quiz-party.js';
import QuickCalc from './quick-calc.js'; import FindOdd from './find-odd.js'; import ColorMatch from './color-match.js';

export const CATEGORIES = {
  race: { fr: 'Courses & plateformes', en: 'Races & platforms', icon: '🏃' },
  arena: { fr: 'Arènes & combat', en: 'Arenas & fights', icon: '🥊' },
  ball: { fr: 'Balles & sports', en: 'Balls & sports', icon: '⚽' },
  reflex: { fr: 'Réflexes & précision', en: 'Reflex & precision', icon: '⚡' },
  mind: { fr: 'Mémoire, logique & culture', en: 'Memory, logic & quiz', icon: '🧠' },
};
const d = (id, cls, cat, icon, diff, duration, fr, en, rfr, ren) => ({ id, cls, cat, icon, diff, duration, name: { fr, en }, rules: { fr: rfr, en: ren } });
export const GAMES = [
  d('race', Race, 'race', '🏁', 1, 60, 'Race Stickman', 'Race Stickman', 'Tu cours tout seul. TOUCHE pour sauter les caisses. Premier à la ligne d\'arrivée !', 'You run automatically. TAP to jump over crates. First to the finish wins!'),
  d('obstacle', ObstacleRace, 'race', '🪚', 2, 70, 'Obstacle Race', 'Obstacle Race', 'Des scies montent et descendent. TOUCHE = sauter, MAINTIENS = ralentir pour passer au bon moment.', 'Saws move up and down. TAP = jump, HOLD = slow down to time your pass.'),
  d('platforms', Platforms, 'race', '🧗', 2, 60, 'Platforms', 'Platforms', 'Saute au-dessus des trous de lave. Double saut possible : touche deux fois !', 'Jump over lava pits. Double jump: tap twice!'),
  d('jump', JumpParty, 'race', '🌋', 2, 0, 'Jump Party', 'Jump Party', 'La lave monte ! TOUCHE pour sauter quand la plateforme du dessus est au-dessus de toi. Le dernier en vie gagne.', 'Lava rises! TAP to jump when the platform above is over you. Last one alive wins.'),
  d('gravity', GravityFlip, 'race', '🔃', 2, 0, 'Gravity Flip', 'Gravity Flip', 'TOUCHE pour inverser la gravité (sol ↔ plafond) et éviter les pics. Le dernier en vie gagne.', 'TAP to flip gravity (floor ↔ ceiling) and dodge spikes. Last one alive wins.'),
  d('laser', LaserDodge, 'race', '🔴', 3, 70, 'Laser Dodge', 'Laser Dodge', 'Lasers bas : TOUCHE pour sauter. Lasers hauts : MAINTIENS pour te baisser. Ils clignotent !', 'Low lasers: TAP to jump. High lasers: HOLD to duck. They blink!'),
  d('arena', ArenaSurvival, 'arena', '🏟️', 2, 0, 'Arena Survival', 'Arena Survival', 'La plateforme rétrécit et des barres balaient le sol. TOUCHE pour sauter. Ne tombe pas dans la lave !', 'The platform shrinks and bars sweep the floor. TAP to jump. Don\'t fall in the lava!'),
  d('sumo', SumoPush, 'arena', '🤼', 2, 0, 'Sumo Push', 'Sumo Push', 'Ta flèche tourne. TOUCHE pour foncer dans sa direction et pousser les autres hors du ring.', 'Your arrow spins. TAP to dash that way and push others out of the ring.'),
  d('king', KingHill, 'arena', '👑', 2, 45, 'King of the Hill', 'King of the Hill', 'Reste SEUL dans la zone dorée pour marquer. TOUCHE = foncer dans le sens de ta flèche.', 'Stay ALONE in the golden zone to score. TAP = dash where your arrow points.'),
  d('rain', DodgeRain, 'arena', '🌧️', 1, 0, 'Dodge Rain', 'Dodge Rain', 'Des objets tombent ! TOUCHE pour changer de couloir. 3 vies.', 'Things fall from the sky! TAP to switch lanes. 3 lives.'),
  d('potato', HotPotato, 'arena', '💣', 1, 0, 'Hot Potato', 'Hot Potato', 'Si tu as la bombe, TOUCHE vite pour la passer au suivant avant qu\'elle explose !', 'If you hold the bomb, TAP fast to pass it on before it blows!'),
  d('tug', TugOfWar, 'arena', '🪢', 1, 30, 'Tug of War', 'Tug of War', 'TAPE le plus vite possible pour tirer le nœud jusqu\'à toi !', 'TAP as fast as you can to pull the knot to you!'),
  d('football', Football, 'ball', '⚽', 2, 60, 'Football Party', 'Football Party', 'Équipes 1c1 ou 2c2 (J1+J3 contre J2+J4). TOUCHE pour tirer quand le ballon est près de toi.', 'Teams 1v1 or 2v2 (P1+P3 vs P2+P4). TAP to shoot when the ball is near you.'),
  d('ballarena', BallArena, 'ball', '🥅', 2, 60, 'Ball Arena', 'Ball Arena', 'Chacun défend son but coloré. TOUCHE = foncer pour pousser la balle dans le but des autres.', 'Everyone guards a colored goal. TAP = dash to push the ball into others\' goals.'),
  d('pong', Pong, 'ball', '🏓', 2, 0, 'Pong Party', 'Pong Party', 'Ta raquette bouge seule. TOUCHE pour inverser son sens. 3 vies.', 'Your paddle moves on its own. TAP to reverse it. 3 lives.'),
  d('coins', CoinRush, 'ball', '🪙', 1, 45, 'Coin Rush', 'Coin Rush', 'Tu avances tout seul. TOUCHE pour tourner de 90°. Ramasse les pièces, évite les bombes !', 'You move automatically. TAP to turn 90°. Grab coins, avoid bombs!'),
  d('basket', Basket, 'ball', '🏀', 2, 45, 'Basket Shoot', 'Basket Shoot', 'La jauge monte et descend. TOUCHE quand elle est dans la zone verte pour marquer.', 'The gauge goes up and down. TAP when it\'s in the green zone to score.'),
  d('balloon', BalloonPop, 'ball', '🎈', 2, 0, 'Balloon Pop', 'Balloon Pop', 'MAINTIENS pour gonfler, LÂCHE pour valider. S\'il éclate : 0 point ! 5 manches.', 'HOLD to inflate, RELEASE to bank. If it pops: 0 points! 5 rounds.'),
  d('reflex', ReflexDuel, 'reflex', '🚦', 1, 0, 'Reflex Duel', 'Reflex Duel', 'Attends le VERT puis TOUCHE le premier. Toucher trop tôt = -1 point.', 'Wait for GREEN, then TAP first. Too early = -1 point.'),
  d('frenzy', TapFrenzy, 'reflex', '👆', 1, 40, 'Tap Frenzy', 'Tap Frenzy', 'Chaque toucher te fait avancer. TAPE comme un fou !', 'Every tap moves you forward. TAP like crazy!'),
  d('stack', StackTower, 'reflex', '🧱', 2, 60, 'Stack Tower', 'Stack Tower', 'Le bloc glisse : TOUCHE pour le poser. Ce qui dépasse est coupé. La plus haute tour gagne.', 'The block slides: TAP to drop it. Overhang gets cut. Tallest tower wins.'),
  d('rope', RopeSwing, 'reflex', '🐒', 3, 75, 'Rope Swing', 'Rope Swing', 'TOUCHE pour lâcher la corde au bon moment, puis TOUCHE en vol pour attraper la suivante.', 'TAP to let go at the right moment, then TAP mid-air to grab the next rope.'),
  d('rhythm', RhythmTap, 'reflex', '🎵', 2, 40, 'Rhythm Tap', 'Rhythm Tap', 'TOUCHE quand la note arrive dans le cercle. Enchaîne les PERFECT !', 'TAP when the note hits the circle. Chain PERFECTs!'),
  d('cannon', CannonDodge, 'reflex', '💥', 2, 0, 'Cannon Dodge', 'Cannon Dodge', 'Boulet au sol : TOUCHE pour sauter. Boulet haut : MAINTIENS pour rouler dessous. 3 vies.', 'Low ball: TAP to jump. High ball: HOLD to roll under. 3 lives.'),
  d('memory', MemoryParty, 'mind', '🃏', 2, 120, 'Memory Party', 'Memory Party', 'Chacun son tour. Le curseur passe sur les cartes : TOUCHE pour retourner. Une paire = tu rejoues.', 'Take turns. The cursor moves over cards: TAP to flip. A pair = play again.'),
  d('simon', SimonParty, 'mind', '🔴', 2, 0, 'Simon Party', 'Simon Party', 'Mémorise la séquence. Ensuite, ton curseur passe sur les couleurs : TOUCHE sur la bonne, dans l\'ordre.', 'Memorize the sequence. Then your cursor cycles colors: TAP the right one, in order.'),
  d('quiz', QuizParty, 'mind', '❓', 1, 0, 'Quiz Party', 'Quiz Party', 'Ton curseur passe sur A, B, C, D : TOUCHE pour verrouiller ta réponse. Le plus rapide gagne un bonus.', 'Your cursor cycles A, B, C, D: TAP to lock your answer. Fastest gets a bonus.'),
  d('calc', QuickCalc, 'mind', '➗', 2, 60, 'Quick Calculation', 'Quick Calculation', 'Le curseur parcourt 4 résultats : TOUCHE quand il est sur le bon. Erreur = -1.', 'The cursor cycles 4 results: TAP when it\'s on the right one. Wrong = -1.'),
  d('odd', FindOdd, 'mind', '🔍', 2, 0, 'Find The Odd One', 'Find The Odd One', 'Un symbole est différent ! TOUCHE quand le curseur est dessus. Erreur = bloqué 1,5 s.', 'One symbol is different! TAP when the cursor is on it. Mistake = locked 1.5 s.'),
  d('stroop', ColorMatch, 'mind', '🎨', 3, 45, 'Color Match', 'Color Match', 'TOUCHE seulement si la couleur du texte correspond au mot écrit. Sinon -1 !', 'TAP only if the ink color matches the written word. Otherwise -1!'),
];
export const gameById = id => GAMES.find(g => g.id === id);
