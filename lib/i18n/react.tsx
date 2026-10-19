"use client";

import { useCallback, useSyncExternalStore } from "react";
import { langStore, setLang, translate, type Lang, type TFunction, type Vars } from "./core";

/** Current language. Renders English on the server and during hydration, then switches to the stored choice. */
export function useLang(): Lang {
  return useSyncExternalStore(langStore.subscribe, langStore.getSnapshot, langStore.getServerSnapshot);
}

/** `t()` bound to the current language; components using it re-render instantly when the language changes. */
export function useT(): TFunction {
  const lang = useLang();
  return useCallback((text: string, vars?: Vars) => translate(lang, text, vars), [lang]);
}

export function useI18n() {
  const lang = useLang();
  const t = useCallback((text: string, vars?: Vars) => translate(lang, text, vars), [lang]);
  return { lang, t, setLang };
}

/** Render-prop helper for places that only need a single string. */
export function T({ children, vars }: { children: string; vars?: Vars }) {
  const t = useT();
  return <>{t(children, vars)}</>;
}
