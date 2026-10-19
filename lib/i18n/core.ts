/**
 * Bilingual (Vietnamese / English) support.
 *
 * English source strings are the translation keys: UI code calls `t("Log in")`, and the Vietnamese dictionary maps
 * that exact English text to its translation. Anything without an entry falls back to the English text, so a
 * missing translation never breaks the page. Keys may contain `{placeholders}`:
 *   - called with values, `t("{n} assets", { n })` translates the template and then fills it in;
 *   - text produced elsewhere (e.g. a notification stored as "Ghana Cocoa is published") is matched against the
 *     templates as patterns, and the captured parts are translated recursively.
 *
 * This module has no React dependency so it can be used from formatters and plain functions.
 */
import { VI } from "./vi";

export type Lang = "vi" | "en";
export const LANGS: Lang[] = ["vi", "en"];
export const DEFAULT_LANG: Lang = "en";
/** Shared with public/landing.html, so the choice carries over between the landing page and the app. */
export const LANG_STORAGE_KEY = "agrix:lang";

export type Vars = Record<string, string | number>;

/* ---------------------------------- State ---------------------------------- */

let current: Lang = DEFAULT_LANG;
let loaded = false;
const listeners = new Set<() => void>();

const isLang = (v: unknown): v is Lang => v === "vi" || v === "en";

/** Stored choice, else the browser language (Vietnamese browsers start in Vietnamese), else English. */
export function detectLang(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  const nav = typeof navigator !== "undefined" ? (navigator.language || "").toLowerCase() : "";
  return nav.startsWith("vi") ? "vi" : DEFAULT_LANG;
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  current = detectLang();
  // Keep every open tab in step with the latest choice.
  window.addEventListener("storage", (e) => {
    if (e.key !== LANG_STORAGE_KEY || !isLang(e.newValue) || e.newValue === current) return;
    current = e.newValue;
    emit();
  });
}

function emit() {
  listeners.forEach((l) => l());
}

export const langStore = {
  subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): Lang {
    load();
    return current;
  },
  getServerSnapshot(): Lang {
    return DEFAULT_LANG;
  },
};

/** Current language for code outside React (formatters, toasts). */
export function getLang(): Lang {
  load();
  return current;
}

export function setLang(lang: Lang) {
  load();
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* private mode: the choice still applies for this page view */
  }
  try {
    document.cookie = `${LANG_STORAGE_KEY.replace(":", "-")}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* ignore */
  }
  if (lang === current) return;
  current = lang;
  if (typeof document !== "undefined") document.documentElement.lang = lang;
  emit();
}

/** BCP-47 locale for Intl formatting. */
export const localeOf = (lang: Lang = getLang()) => (lang === "vi" ? "vi-VN" : "en-US");

/* ------------------------------- Translation ------------------------------- */

export function interpolate(text: string, vars?: Vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EN_DATE = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}), (\d{4})$/;
const EN_MONTH_YEAR = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})$/;

/** "Feb 6, 2024" → "6 thg 2, 2024"; "Jul 2026" → "Th7 2026". */
function translateDate(text: string): string | null {
  let m = EN_DATE.exec(text);
  if (m) {
    const d = new Date(Date.UTC(Number(m[3]), MONTHS.indexOf(m[1]), Number(m[2])));
    return d.toLocaleDateString("vi-VN", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
  }
  m = EN_MONTH_YEAR.exec(text);
  if (m) return `Th${MONTHS.indexOf(m[1]) + 1} ${m[2]}`;
  return null;
}

interface Pattern {
  re: RegExp;
  names: string[];
  vi: string;
}

let patterns: Pattern[] | null = null;
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function compiledPatterns(): Pattern[] {
  if (patterns) return patterns;
  patterns = Object.keys(VI)
    // Only templates with enough fixed text to be unambiguous are used to recognise free text.
    .filter((k) => /\{\w+\}/.test(k) && (k.replace(/\{\w+\}/g, "").match(/[A-Za-z]/g) ?? []).length >= 4)
    .map((k) => {
      const names: string[] = [];
      const src = k
        .split(/(\{\w+\})/)
        .map((part) => {
          const m = /^\{(\w+)\}$/.exec(part);
          if (!m) return escapeRe(part);
          names.push(m[1]);
          return "([\\s\\S]+?)";
        })
        .join("");
      return { re: new RegExp(`^${src}$`), names, vi: VI[k] };
    })
    // Longer, more specific templates first.
    .sort((a, b) => b.re.source.length - a.re.source.length);
  return patterns;
}

const cache = new Map<string, string>();

/** A captured value may be a list of known labels ("Asset name, Area"): translate each item. */
function captureToVi(text: string, depth: number): string {
  const parts = text.split(", ");
  if (parts.length > 1 && parts.every((p) => VI[p] !== undefined)) return parts.map((p) => VI[p]).join(", ");
  return toVi(text, depth);
}

function toVi(text: string, depth = 0): string {
  const hit = cache.get(text);
  if (hit !== undefined) return hit;
  let out: string | undefined = VI[text];
  if (out === undefined) {
    const trimmed = text.trim();
    if (trimmed !== text && trimmed) {
      const inner = toVi(trimmed, depth);
      out = inner === trimmed ? text : text.replace(trimmed, inner);
    }
  }
  if (out === undefined) out = translateDate(text) ?? undefined;
  if (out === undefined && depth < 3 && text.length < 400 && /[A-Za-z]/.test(text)) {
    for (const p of compiledPatterns()) {
      const m = p.re.exec(text);
      if (!m) continue;
      const vars: Vars = {};
      p.names.forEach((n, i) => (vars[n] = captureToVi(m[i + 1], depth + 1)));
      out = interpolate(p.vi, vars);
      break;
    }
  }
  if (out === undefined) out = text;
  if (cache.size > 5000) cache.clear();
  cache.set(text, out);
  return out;
}

/** Translate English source text into `lang`. Unknown text is returned unchanged. */
export function translate(lang: Lang, text: string, vars?: Vars): string {
  if (text == null) return text;
  if (lang === "en" || !text) return interpolate(text, vars);
  if (vars) {
    const template = VI[text];
    if (template !== undefined) return interpolate(template, vars);
    return toVi(interpolate(text, vars));
  }
  return toVi(text);
}

/** Translate with the current language (for code outside React). */
export const tr = (text: string, vars?: Vars) => translate(getLang(), text, vars);

export type TFunction = (text: string, vars?: Vars) => string;
