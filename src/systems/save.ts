// Persistent progress via localStorage. Benches write it, death updates the
// corpse marker, recovering the corpse clears it.
const SAVE_KEY = 'duck-souls-save';

export interface CorpseData {
  x: number;
  y: number;
  souls: number;
}

export interface SaveData {
  benchX: number;
  benchY: number;
  souls: number;
  corpse: CorpseData | null;
}

export const DEFAULT_SAVE: SaveData = {
  benchX: 120,
  benchY: 380,
  souls: 0,
  corpse: null,
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? { ...DEFAULT_SAVE, ...(JSON.parse(raw) as Partial<SaveData>) } : { ...DEFAULT_SAVE };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode) — game still works, just no persistence
  }
}
