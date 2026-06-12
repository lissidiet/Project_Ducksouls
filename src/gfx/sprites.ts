// Pixel matrices for every animated entity. All sprites face RIGHT
// (Phaser flipX handles left). Every row in a matrix must have the same
// length — silhouettes first, details second (they vanish at game scale).

// --- Duck Knight (16x14, rendered 48x42 @3px) ---------------------------
// Hooded duck: dark cloak over the back, cream face/body, orange beak.

const DUCK_HEAD = [
  '..........ooo...',
  '.........ohhho..',
  '........ohhhhho.',
  '........ohccceo.',
  '........ohcccobb',
  '....oo..ohccccob',
];

const DUCK_BODY = [
  '...ohhooccccco..',
  '..oghhhcccccco..',
  '..ohhhccccccco..',
  '..ohhccccccco...',
  '...occcccccdo...',
  '....occccdoo....',
];

export const DUCK_IDLE = [
  ...DUCK_HEAD,
  ...DUCK_BODY,
  '.....o....o.....',
  '....obb..obb....',
];

export const DUCK_BLINK = [
  ...DUCK_HEAD.map((row, i) => (i === 3 ? '........ohcccco.' : row)),
  ...DUCK_BODY,
  '.....o....o.....',
  '....obb..obb....',
];

export const DUCK_WALK_0 = [
  ...DUCK_HEAD,
  ...DUCK_BODY,
  '...o......o.....',
  '..obb....obb....',
];

export const DUCK_WALK_1 = [
  ...DUCK_HEAD,
  ...DUCK_BODY,
  '......o..o......',
  '.....obbobb.....',
];

// Wings spread, feet tucked
export const DUCK_JUMP = [
  ...DUCK_HEAD,
  'o..ohhooccccco..',
  'oochhhhcccccco..',
  '.ochhhccccccco..',
  '..ohhccccccco...',
  '...occcccccdo...',
  '....occccdoo....',
  '.....oo..oo.....',
  '................',
];

// --- Ombra / Shade (14x12, rendered 42x36 @3px) -------------------------
// Floating blob with glowing violet eyes and a wispy bottom.

export const SHADE_0 = [
  '....ooooo.....',
  '..ooPPPPPoo...',
  '.oPPpppppPPo..',
  '.opppppppppo..',
  '.opvvpppvvpo..',
  'oppppppppppppo',
  'oppppppppppppo',
  'oppppppppppppo',
  '.oppppppppppo.',
  '..opp.ppp.po..',
  '..op...pp..o..',
  '..............',
];

export const SHADE_1 = [
  '..............',
  '....ooooo.....',
  '..ooPPPPPoo...',
  '.oPPpppppPPo..',
  '.opvvpppvvpo..',
  '.opppppppppo..',
  'oppppppppppppo',
  'oppppppppppppo',
  '.oppppppppppo.',
  '..op.ppp.ppo..',
  '...o..pp..o...',
  '..............',
];

// --- Rana Spinata / Spiked Frog (14x11, rendered 42x33 @3px) ------------

export const FROG_SIT = [
  '...l....l.....',
  '..olo..olo....',
  '.ooFFFFFFoo...',
  '.oFFffffffFo..',
  'orfffffffffro.',
  'offfffffffffo.',
  'offfffffffffo.',
  '.offffffffffo.',
  '.off.ffff.ffo.',
  '.oo..oo..oo...',
  '..............',
];

export const FROG_JUMP = [
  '...l....l.....',
  '..olo..olo....',
  '.ooFFFFFFoo...',
  '.oFFffffffFo..',
  'orfffffffffro.',
  'offfffffffffo.',
  '.offffffffffo.',
  '.o.ffffffff.o.',
  '.o..o....o..o.',
  'oo..oo..oo..oo',
  '..............',
];

// --- Stone platform tile (16x16, rendered 64x64 @4px) -------------------
// Generated: light top edge, dark border, deterministic speckles.

export function makeStoneTile(): string[] {
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      if (y === 0) row += 'T';
      else if (x === 0 || x === 15 || y === 15) row += 'o';
      else row += (x * 7 + y * 13) % 11 === 0 ? 'S' : 's';
    }
    rows.push(row);
  }
  return rows;
}
