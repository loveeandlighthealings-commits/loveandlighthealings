import { z } from "zod";

/**
 * Named visual themes: each is still a light theme (see CLAUDE.md), just a
 * different mood/palette. `preview` is 3 representative colors (background,
 * accent, orb) used to render a small swatch in the picker.
 */
export const THEMES = [
  {
    key: "default",
    label: "Default",
    description: "Soft dawn lilac and peach.",
    preview: ["#FAF7FD", "#6A4DD4", "#FFA07E"],
  },
  {
    key: "sunset",
    label: "Sunset",
    description: "Warm coral, gold and blush.",
    preview: ["#FFF8F3", "#E8703C", "#F0723C"],
  },
  {
    key: "chakras",
    label: "7 Chakras",
    description: "Spiritual indigo, with a hint of every hue.",
    preview: ["#F8F6FF", "#5A4FCF", "#E05454"],
  },
  {
    key: "forest",
    label: "Forest",
    description: "Grounded greens and earthy gold.",
    preview: ["#F6F8F3", "#3F7D5C", "#D2AD5A"],
  },
] as const;

export type ThemeKey = (typeof THEMES)[number]["key"];

const THEME_KEYS = THEMES.map((t) => t.key) as [ThemeKey, ...ThemeKey[]];

export const themeSchema = z.enum(THEME_KEYS);
