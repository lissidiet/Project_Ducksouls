# 🦆 Duck Souls

Un metroidvania 2D per mobile, ispirato a **Hollow Knight**, **Castlevania** e **Ori** — con protagonista un'anatra cavaliere.

Sviluppato interamente da mobile con Claude Code.

## Stack tecnico

| Componente | Scelta | Perché |
|---|---|---|
| Engine | [Phaser 4](https://phaser.io) (TypeScript) | 2D web-first, gira subito nel browser del telefono |
| Build | Vite | Dev server e build istantanei |
| Wrapper mobile | Capacitor (in seguito) | Per pubblicare su App Store / Play Store |
| Asset AI | Higgsfield MCP (configurato in `.mcp.json`) | Generazione di concept art e asset |

## Come si gioca (slice attuale)

- **Mobile:** pulsanti touch a schermo — ◀ ▶ per muoversi, ⬆ salto (doppio salto incluso), ⚔ attacco, ➤ scatto
- **Tastiera:** frecce / WASD per muoversi, SPAZIO salto, J attacco, K scatto
- Raccogli le **anime** (orbe azzurre), evita le **ombre** e le **rane spinate** o falle a pezzi
- 5 piume di vita, knockback e invulnerabilità temporanea quando vieni colpito
- **Panchine** = checkpoint: curano, salvano la partita (localStorage) e fissano il respawn
- Alla morte perdi le anime: torna dove sei caduto per recuperarle (**corpse run**)

## Gioca subito

Ogni push sul branch di sviluppo viene deployato automaticamente su **GitHub Pages** — apri l'URL del deploy dal browser del telefono e gioca.

## Avvio

```bash
npm install
npm run dev      # dev server su http://localhost:5173
npm run build    # build di produzione in dist/
```

## Struttura

```
src/
├── main.ts              # GameConfig e registrazione scene
├── input/controls.ts    # Stato input virtuale condiviso (touch + tastiera)
├── objects/
│   ├── Player.ts        # Anatra: corsa, salto, doppio salto, dash, attacco
│   └── Enemy.ts         # Ombra di pattuglia
└── scenes/
    ├── BootScene.ts     # Genera texture placeholder a runtime (zero asset binari)
    ├── MainMenuScene.ts
    ├── GameScene.ts     # Livello, fisica, collisioni, camera
    ├── HUDScene.ts      # Piume di vita, contatore anime, controlli touch
    └── GameOverScene.ts
```

## Tooling AI installato

- `.claude/skills/` — 20 skill Phaser 4 (fisica, tilemap, mobile, audio, save/load…)
- `.claude/agents/` — 4 subagent (architect, coder, debugger, asset-advisor)
- `.claude/commands/` — comandi `/phaser-new`, `/phaser-run`, `/phaser-build`, `/phaser-gdd`, `/phaser-validate`, `/phaser-analyze`
- `.mcp.json` — server MCP Higgsfield per generare asset visivi

Vedi `docs/GDD.md` per il game design document.
