# Déploiement — du PWA aux stores

## 1. PWA sur GitHub Pages (autonome, gratuit, immédiat)

```bash
# depuis mobile-game/ :
gh repo create abyss-drop --public --source . --push
gh api -X POST repos/{owner}/abyss-drop/pages -f build_type=workflow 2>/dev/null || true
```

Le workflow fourni (`.github/workflows/pages.yml`) publie `game/` à chaque push sur `master`.
URL finale : `https://<user>.github.io/abyss-drop/` — HTTPS ⇒ service worker ⇒ :

- **Android Chrome** : bannière d'installation automatique (HTTPS + manifest suffisent en 2026)
- **iOS 26** : Partager → « Sur l'écran d'accueil » ouvre en app standalone par défaut
- **Hors-ligne** : complet après la première visite (cache-first assets, network-first index)

## 2. CrazyGames (canal de revenus principal) — voir CRAZYGAMES.md

Une seule étape humaine : créer le compte développeur et cliquer « Submit ».
Tout le reste (build ZIP, SDK intégré, métadonnées) est prêt dans ce repo.

## 3. Poki (objectif étendu)

Le build respecte déjà leur barre : ≤ 8 MB, zéro requête externe en standalone, pas de
splash, atterrit direct dans le gameplay, localStorage try/catch (incognito-safe),
responsive portrait+paysage. Soumission sur developers.poki.com (revue de plusieurs
semaines, sélective). Le SDK Poki se charge automatiquement si le jeu tourne chez eux.

## 4. Google Play via TWA/Bubblewrap (25 $ une fois, quand le PWA a prouvé sa rétention)

1. Compte Google Play Developer (25 $).
2. `npx @bubblewrap/cli init --manifest https://<votre-url>/manifest.webmanifest`
3. `assetlinks.json` dans `/.well-known/` sur le domaine du PWA.
4. `npx @bubblewrap/cli build` → AAB à uploader.
IAP possible ensuite via Play Billing (Digital Goods API) branché sur la façade IAP du jeu.

## 5. App Store iOS — volontairement ignoré

99 $/an + macOS + Xcode obligatoires : non viable ici. Les joueurs iOS ont le PWA
(excellent depuis iOS 26).

## Rappel monétisation

| Canal | Part dév | Activation |
|---|---|---|
| CrazyGames | ~55-60% ads, 70% IAP (Xsolla) | compte + QA ~1-2 jours |
| Poki | ~50% (100% sur votre trafic) | revue éditoriale, semaines |
| Google H5 (AdSense) | ~68% | candidature/allowlist, incertain |
| PWA direct | 100% | pointer Web Monetization + IAP plus tard |

Le code des trois adaptateurs est déjà dans `index.html` (façade `Ads`) : détection runtime,
aucune modification du jeu nécessaire pour activer un canal.
