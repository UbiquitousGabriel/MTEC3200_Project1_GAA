// lib/storage.ts
// Everything the reader saves (settings, notes, highlights) lives in the
// browser's localStorage. No accounts, no database — it stays on your device.
// Every call is wrapped in try/catch because localStorage can be blocked
// (private windows, strict privacy settings) and the app should still work.

export type ReaderSettings = {
  font: "serif" | "sans" | "dyslexic";
  size: number; // px
  lineHeight: number;
  width: "narrow" | "medium" | "wide";
  theme: "paper" | "light" | "sepia" | "dark";
};

export const DEFAULT_SETTINGS: ReaderSettings = {
  font: "serif",
  size: 21,
  lineHeight: 1.7,
  width: "medium",
  theme: "paper",
};

export type Highlight = {
  id: string;
  start: number; // character offset inside the reading's text
  end: number;
  color: "yellow" | "green" | "pink" | "blue";
  text: string; // the highlighted words (for the notes page)
};

export type Note = { text: string; updatedAt: string; title: string };

const KEY = {
  settings: "cr:settings",
  note: (slug: string) => `cr:note:${slug}`,
  highlights: (slug: string) => `cr:hl:${slug}`,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const storage = {
  getSettings: () => ({ ...DEFAULT_SETTINGS, ...read<Partial<ReaderSettings>>(KEY.settings, {}) }),
  setSettings: (s: ReaderSettings) => write(KEY.settings, s),

  getNote: (slug: string) => read<Note | null>(KEY.note(slug), null),
  setNote: (slug: string, note: Note) =>
    note.text.trim() ? write(KEY.note(slug), note) : remove(KEY.note(slug)),

  getHighlights: (slug: string) => read<Highlight[]>(KEY.highlights(slug), []),
  setHighlights: (slug: string, hls: Highlight[]) =>
    hls.length ? write(KEY.highlights(slug), hls) : remove(KEY.highlights(slug)),

  /** Every reading that has a note or highlight — used by the /notes page. */
  listAnnotated(): string[] {
    const slugs = new Set<string>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) ?? "";
        const m = k.match(/^cr:(note|hl):(.+)$/);
        if (m) slugs.add(m[2]);
      }
    } catch {
      /* ignore */
    }
    return [...slugs];
  },
};
