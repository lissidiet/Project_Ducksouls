# Ashen Hollow

Top-down dark-fantasy action-RPG (SAO-style floor-clear loop) built with **Phaser 4 + TypeScript + Vite**, playable in the mobile browser. The user develops from mobile, in Italian — reply in Italian, write code/comments in English.

## Commands

- `npm run dev` — dev server (port 5173, host 0.0.0.0)
- `npm run build` — typecheck (`tsc`) + production build
- No tests yet.

## Concept

You are the last **Emberblade**, descending through cursed realms. Each realm: clear the wandering foes to break the seal on the boss sanctum, defeat the Warden, then take the portal to the next realm (a new climate). Sword arc + soul-bolt + dodge dash. Torch-lit dynamic lighting.

## Architecture

- `src/core.ts` — constants, `HERO` balance, `REALMS` (biome palettes), `GAME_WIDTH/HEIGHT`, `TILE`.
- `src/input/controls.ts` — module-singleton virtual input: HUD joystick writes `moveX/moveY`, buttons write `attack/cast/dash`; `Hero.update()` merges with keyboard.
- `src/gfx/painterly.ts` — canvas painting helpers (`paintTexture`, `radialGlow`, gradients). `src/gfx/art.ts` — ALL textures painted at runtime (hero, foes, boss, per-realm tiles/props/torch, fx, portal, light mask). No binary assets.
- `src/objects/` — `Hero`, `Foe` (wisp/bonelord/warden via `FoeKind`), `Bolt` (pooled projectile).
- `src/scenes/` — `Boot` (paint all art) → `Title` → `World` (map + lighting + loop) ‖ `Hud` (parallel) → `GameOver`.
- Lighting: a dark overlay rectangle (fixed to camera) + additive `light` sprites in world space at the hero + torches (`World.buildLighting`).
- Top-down: gravity 0; depth-sorted by Y so actors overlap correctly.

## Conventions

- Phaser 4, not 3 — beware removed v3 APIs. Tint flash uses `setTint(0xffffff).setTintMode(Phaser.TintModes.FILL)`.
- Deploy: every push to the dev branch auto-deploys to GitHub Pages (`.github/workflows/deploy.yml`).
- Studio framework (Claude-Code-Game-Studios) skills/agents installed in `.claude/` as methodology; engine stays Phaser/web for mobile playability.
- AI art pipeline (when credits available): Higgsfield generate → remove_background → trim/scale into `public/assets/`. The `game-character-sprites` skill needs an OpenAI key for its codex-gateway backend.
