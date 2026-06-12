# Duck Souls — Game Design Document (bozza v0.1)

## 1. Concept

**Duck Souls** è un metroidvania 2D per mobile. Un'anatra cavaliere discende nelle profondità di uno stagno maledetto per recuperare le anime del suo stormo, perdute in un regno sommerso e decaduto.

**Pilastri di design:**
1. **Movimento che dà gioia** (Ori) — corsa, doppio salto, dash fluidi e reattivi
2. **Combattimento leggibile e punitivo quanto basta** (Hollow Knight) — pochi colpi, ben telegrafati
3. **Esplorazione interconnessa** (Castlevania) — mappa unica con scorciatoie e abilità che aprono zone

## 2. Tono e stile

- Atmosfera malinconica e gotica, ma con ironia: il protagonista è pur sempre un'anatra
- Palette scura (blu notte, viola) con accenti caldi (piume dorate, becco arancione)
- Silhouette in parallasse, luce volumetrica, particelle di spore/polline

## 3. Protagonista

**Anatra Cavaliere** (nome da definire)
- 5 piume di vita (estendibili con upgrade)
- Attacco con becco-spada (corto raggio, combo a 2 colpi in futuro)
- Abilità sbloccabili: doppio salto ✅, dash ✅, planata (ali), tuffo in acqua, schianto a terra, becco a trivella

## 4. Mondo (macro-aree previste)

1. **Riva Crepuscolare** — tutorial, primo boss
2. **Canneto dei Sussurri** — verticalità, planata
3. **Profondità Limacciose** — sezioni subacquee (l'anatra nuota!)
4. **Rovine del Re Pescatore** — area castlevania-esca, piattaforme mobili
5. **Il Fondale** — endgame

## 5. Nemici (primi)

| Nemico | Comportamento | Stato |
|---|---|---|
| Ombra | Pattuglia, si gira ai bordi | ✅ implementato |
| Rana spinata | Salta verso il giocatore | da fare |
| Libellula | Vola in pattern sinusoidale, picchiata | da fare |
| Boss: Il Pescatore Annegato | Pattern a 3 fasi | da fare |

## 6. Economia

- **Anime** ✅ — valuta raccolta da nemici e segreti; alla morte si perdono e si possono recuperare (corpse run, stile souls)
- Banchi di riposo (= panchine HK) come checkpoint

## 7. Controlli mobile

- Layout a due pollici: movimento a sinistra, azioni a destra ✅
- Aree touch generose (≥ 80px), feedback visivo alla pressione ✅
- Aptica (vibrazione) su colpi ricevuti — da fare con Capacitor

## 8. Roadmap tecnica

- [x] Slice giocabile: movimento, combattimento, nemico, raccolta, HUD, game over
- [ ] Tilemap con Tiled per livelli veri (skill: `phaser-tilemap`)
- [ ] Animazioni sprite del protagonista (asset via Higgsfield MCP)
- [ ] Audio: musica ambient + SFX (skill: `phaser-audio`)
- [ ] Save/load con localStorage (skill: `phaser-saveload`)
- [ ] Sistema mappa e fast travel
- [ ] Wrapper Capacitor per build iOS/Android (skill: `phaser-mobile`)
- [ ] Primo boss
