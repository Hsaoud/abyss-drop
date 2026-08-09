# 🌊 Abyss Drop

**Puzzle physique de fusion dans les abysses bioluminescents** — un merge-drop façon Suika Game, 100% vanilla JS, single-file, PWA installable, prêt pour les portails (CrazyGames / Poki / Google H5).

*Bioluminescent deep-sea merge-drop puzzle — Suika-style, single-file vanilla JS PWA, portal-ready.*

## Jouer / Play

- **Local** : `python serve.py 8123 game` puis http://localhost:8123
- **Mobile** : hébergez `game/` sur n'importe quel HTTPS (GitHub Pages, Cloudflare Pages) → installable (Android : bannière automatique ; iOS : Partager → « Sur l'écran d'accueil »)

## Structure

```
game/
  index.html            # le jeu complet (physique, rendu, audio, UX, pubs) — zéro dépendance
  manifest.webmanifest  # PWA manifest (standalone, portrait, icônes)
  sw.js                 # service worker : network-first (navigations) + cache-first (assets) = jouable hors-ligne
  icon-*.png            # icônes 192/512 + maskable
serve.py                # serveur de dev (MIME corrects + endpoint POST /shot pour les tests)
PROJECT_BRIEF.md        # la bible qualité (valeurs de référence Suika/2048)
docs/                   # déploiement + monétisation
```

## Design (résumé)

- 11 paliers : plancton → krill → crevette → méduse → hippocampe → poisson-globe → baudroie → pieuvre → tortue → raie manta → baleine
- Score triangulaire (3,6,10,…,66) → les cascades paient de façon superlinéaire
- Ligne de danger : 2000 ms de violation continue, immunité 1500 ms après lâcher
- Physique custom à pas fixe 120 Hz (restitution 0.2, friction 0.5, 6 itérations, jamais d'explosion)
- Audio 100% synthétisé (Web Audio) : pops pentatoniques C-E-G-A-D montants par maillon de chaîne
- Monétisation inerte pré-câblée : façade AdService + adaptateurs Poki / CrazyGames v3 / Google H5 détectés au runtime — le jeu reste 100% jouable sans SDK et sous adblock

## Modes de test

- `?headless=1` : boucle pilotable via `Game.tick(t)` (tests déterministes, pas de SW)
- `?debugads=1` : log des placements publicitaires
- `?portal=crazygames|poki` : force le chargement d'un SDK portail en local

## Déploiement & revenus

Voir [docs/DEPLOY.md](docs/DEPLOY.md) et [docs/CRAZYGAMES.md](docs/CRAZYGAMES.md).
Attente réaliste pour un titre H5 poli sur portails : **200–2000 $/mois** (eCPM rewarded 15–28 $ US, part développeur ~55–60%).
