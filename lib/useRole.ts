"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type RolePref = "auto" | "investor" | "owner";
export const ROLE_LABEL = { investor: "Investor", owner: "Asset Owner" } as const;

const KEY = "agrix:role:v1";
const EVENT = "agrix:role-change";

function read(): RolePref {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "investor" || v === "owner" ? v : "auto";
  } catch {
    return "auto";
  }
}

/**
 * Persona shown in the shell. "auto" follows the screen (registering an asset is an Asset Owner task),
 * while an explicit choice made in Settings sticks everywhere.
 */
export function useRole() {
  const pathname = usePathname();
  const [pref, setPref] = useState<RolePref>("auto");

  useEffect(() => {
    setPref(read());
    const sync = () => setPref(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((next: RolePref) => {
    try {
      if (next === "auto") window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable */
    }
    setPref(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const effective = pref === "auto" ? (pathname.startsWith("/assets") ? "owner" : "investor") : pref;
  return { pref, role: effective, label: ROLE_LABEL[effective], setPref: update };
}
