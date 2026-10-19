"use client";

import { useEffect } from "react";
import { translate, type Lang } from "@/lib/i18n/core";
import { useLang } from "@/lib/i18n/react";
import { useHydrated } from "@/lib/demo/hooks";

const translateTitle = (lang: Lang, title: string) =>
  title
    .split(" · ")
    .map((part) => translate(lang, part))
    .join(" · ");

/**
 * Keeps the document in step with the chosen language: `<html lang>`, the tab title (page metadata is authored in
 * English) and the pre-hydration guard set by the inline script in the root layout, which hides the page until the
 * stored language has been applied so a Vietnamese reader never sees an English flash.
 */
export function I18nSync() {
  const lang = useLang();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.lang = lang;
    root.removeAttribute("data-i18n-pending");
  }, [lang, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    let original = document.title;
    let lastSet = "";
    const apply = () => {
      const next = translateTitle(lang, original);
      lastSet = next;
      if (document.title !== next) document.title = next;
    };
    apply();
    // Next.js rewrites <title> on client navigation; translate each new one.
    const observer = new MutationObserver(() => {
      if (document.title === lastSet) return;
      original = document.title;
      apply();
    });
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [lang, hydrated]);

  return null;
}
