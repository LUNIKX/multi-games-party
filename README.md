# Multi Games Party (version web)

Party game HTML5 : **30 mini-jeux à une touche**, 1 à 4 joueurs sur le même écran, bots (facile / normal / difficile), tournois, XP, missions, succès, personnages à débloquer. 100 % gratuit, sans dépendance, fonctionne **hors ligne** (PWA).

## Tester sur ton ordinateur
Les modules JavaScript ne marchent pas en ouvrant `index.html` directement (double-clic). Lance un petit serveur dans ce dossier :
- Python : `python -m http.server 8000`, puis ouvre http://localhost:8000
- ou Node : `npx serve .`

Commandes PC : J1 = **A** (ou Espace), J2 = **L**, J3 = **V**, J4 = **↑**. Souris : clic dans la zone du joueur.
Sur mobile : l'écran est divisé en bandes verticales, une par joueur humain (4 doigts à la fois possible).

## Publier gratuitement
### Netlify (le plus simple)
1. Va sur https://app.netlify.com/drop
2. Glisse-dépose **ce dossier** (celui qui contient `index.html`).
3. Tu reçois une adresse `https://xxx.netlify.app` en HTTPS : c'est fini.

### GitHub Pages
1. Crée un compte sur https://github.com puis un dépôt public (ex. `multi-games-party`).
2. « Add file → Upload files » : envoie **tout le contenu** de ce dossier (index.html à la racine).
3. Settings → Pages → Source : « Deploy from a branch », branche `main`, dossier `/ (root)` → Save.
4. Après 1 à 2 minutes : `https://TON-PSEUDO.github.io/multi-games-party/`.

Le HTTPS est obligatoire pour l'installation et le mode hors ligne (Netlify et GitHub Pages le fournissent).

## Installer comme une application
- **Android (Chrome)** : bouton « 📲 Installer l'application » dans le menu, ou menu ⋮ → « Installer l'application ».
- **iPhone (Safari)** : bouton Partager (carré avec flèche) → « Sur l'écran d'accueil ». Un petit guide s'affiche une fois au premier lancement. Le plein écran n'est possible qu'une fois installé.

## Procédure de test sur de vrais appareils
1. Publie le jeu (Netlify ou GitHub Pages) et ouvre l'adresse sur le téléphone.
2. **iPhone (Safari iOS 14+)** : touche « Touche pour commencer » → le son doit démarrer. Tourne en paysage (en portrait, un message s'affiche). Lance un mini-jeu à 2 joueurs et touche avec 2 doigts en même temps. Vérifie qu'un double toucher ne zoome pas et que la page ne défile pas. Installe sur l'écran d'accueil, ouvre-le, passe en mode avion et relance : le jeu doit s'ouvrir hors ligne. Quitte l'appli puis reviens : le son doit reprendre (la partie se met en pause).
3. **Android (Chrome 90+)** : même procédure, et utilise le bouton « Installer l'application ». La vibration doit fonctionner (désactivable dans Paramètres).
4. Si un ancien cache gêne : ajoute `?sw=off` à l'adresse pour désactiver le service worker.

## Structure
```
index.html  manifest.json  sw.js  css/style.css  icons/
data/quiz_fr.json  data/quiz_en.json  (176 questions chacun)  data/locales/fr.json en.json
js/core.js (boucle, bus, utilitaires)  input.js (zones multi-touch)  audio.js (Web Audio)
js/save.js (localStorage versionné)  i18n.js  characters.js (stickmen dessinés par code)
js/ai.js (BotController)  ui.js (écrans)  tournament.js  rewards.js  profile.js  leaderboard.js
js/cloud.js (interfaces auth / classement / cloud en version locale, prêtes pour Firebase)
js/minigames/base.js (MiniGameBase)  registry.js (registre)  + 1 fichier par mini-jeu
```

## Ajouter Firebase plus tard
Dans `js/cloud.js`, crée des classes avec les mêmes méthodes (`currentUser`, `submit`, `top`, `upload`, `download`) et remplace l'objet `services`.
