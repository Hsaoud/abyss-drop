# Soumission CrazyGames — package prêt à l'emploi

## Ce qui est déjà fait (par l'agent)

- ✅ SDK v3 intégré : chargé automatiquement quand le jeu tourne sur crazygames.com
  (`await CrazyGames.SDK.init()`, `game.gameplayStart/Stop`, `ad.requestAd('midgame'|'rewarded')`,
  `ad.hasAdblock()` → récompenses offertes sous adblock)
- ✅ Exigences respectées : atterrit directement dans le gameplay, aucun lien sortant,
  aucune invite d'installation dans l'iframe portail, jouable sous adblock, payload ≈ 0.4 MB
  (max autorisé : 50 MB), contenu PEGI-3/E, portrait ET paysage
- ✅ Interstitiels : uniquement aux transitions de fin de partie, max 2/session, ≥ 150 s
  d'écart, jamais avant la 2e partie, jamais après une partie < 30 s
- ✅ Rewarded : « Continuer » (1×/partie) et « Score ×2 » — récompense uniquement sur adFinished
- ✅ Build ZIP : `python make_zip.py` → `dist/abyss-drop-crazygames.zip`

## Assets marketing — tous générés, aux formats exacts exigés

Dossier [`assets/`](../assets) :

| Fichier | Format demandé | Contenu |
|---|---|---|
| `cover_landscape.png` | Landscape 16:9 — **1920×1080** | logo + créatures des 11 paliers, baleine en fond |
| `cover_portrait.png` | Portrait 2:3 — **800×1200** | même clé visuelle, composition verticale |
| `cover_square.png` | Square 1:1 — **800×800** | version compacte |
| `trailer_landscape.mp4` | Landscape video | 1920×1080, 60 fps, 12 s, H.264 — cascade combo ×5 → raie manta |
| `trailer_portrait.mp4` | Portrait video | 1080×1920, 60 fps, 10 s, H.264 — cascade combo ×5 → **naissance de la baleine** |

Les vidéos sont des captures réelles du moteur (aucun montage) : plateau mis en place pour
garantir une grosse cascade, puis lâchers normaux filmés à 60 fps. Interface en anglais
(`?lang=en`). Pas de piste audio — les portails lisent les previews en muet au survol.

Pour régénérer : `game/cover.html?fmt=landscape|portrait|square&save=1` pour les images,
`game/capture.js` (chargé dans `index.html?headless=1&demo=1&lang=en`) pour les vidéos.

## Ce que le propriétaire doit faire (≈ 15 minutes)

1. Créer un compte sur **developer.crazygames.com** (gratuit, monde entier, solo OK).
2. « Submit game » → uploader `dist/abyss-drop-crazygames.zip`.
3. Métadonnées (copier-coller ci-dessous) + captures (dossier `shots/`, prendre les `r3_*`).
4. QA CrazyGames : ~1-2 jours ouvrés. Corrections éventuelles → me redemander.
5. Paiement : PayPal ou virement, seuil 100 €, mensuel. Part ~55-60% des revenus pubs.

## Métadonnées prêtes à coller

- **Nom** : Abyss Drop
- **Catégorie** : Puzzle / Merge
- **Description (EN)** :
  Drop and merge the glowing creatures of the deep! Two identical creatures touch → they
  fuse into a bigger one, from tiny plankton all the way to the mighty whale. Chain
  cascading merges for massive combo scores, but don't let the abyss overflow. One-finger
  gameplay, no timer — pure, hypnotic, bioluminescent zen.
- **Description (FR)** :
  Lâche et fusionne les créatures lumineuses des abysses ! Deux créatures identiques qui se
  touchent fusionnent en une plus grosse, du plancton jusqu'à la baleine. Enchaîne les
  cascades pour des combos massifs, sans laisser déborder l'abysse. Un doigt, pas de
  chrono — hypnotique et zen.
- **Tags** : merge, physics, puzzle, relaxing, suika-like, ocean
- **Orientation** : les deux (portrait optimal)
- **Contrôles** : glisser pour viser, relâcher pour lâcher · souris : survoler + clic ·
  clavier : ←/→ + Espace
