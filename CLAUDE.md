# Duck Souls

2D mobile metroidvania (Hollow Knight / Castlevania / Ori inspired) built with **Phaser 4 (v4.0.0-rc.7) + TypeScript + Vite**. The user develops from mobile, in Italian — reply in Italian, write code/comments in English.

## Commands

- `npm run dev` — dev server (port 5173, host 0.0.0.0)
- `npm run build` — typecheck (`tsc`) + production build
- There are no tests yet.

## Architecture

- `src/main.ts` — GameConfig; exports `GAME_WIDTH`/`GAME_HEIGHT` (960×540 landscape)
- `src/input/controls.ts` — module-singleton virtual input state; HUD touch buttons write it, `Player.update()` reads it (merged with keyboard). Don't add cross-scene input events — use this.
- `src/scenes/BootScene.ts` — ALL textures are generated at runtime via Graphics (`duck`, `shade`, `platform`, `slash`, `feather`, `soul-orb`, `touch-btn`, `particle`). No binary assets exist yet; new placeholder art goes here.
- `src/scenes/GameScene.ts` — level layout, physics, collisions; HUD runs as a parallel scene, they communicate via `this.registry` (`health`, `souls` keys).
- `src/objects/Player.ts` — movement constants at top of file; edge-detection of buttons is done manually (prev* flags) because input comes from the virtual controls object, not Phaser keys.

## Conventions

- Phaser 4, not 3 — beware removed v3 APIs (`Geom.Point`, `Structs`, etc.). Use the installed phaser-* skills in `.claude/skills/` for API questions.
- Design doc: `docs/GDD.md` — keep its roadmap checkboxes updated when features land.
- Asset generation: Higgsfield MCP is configured in `.mcp.json`.
