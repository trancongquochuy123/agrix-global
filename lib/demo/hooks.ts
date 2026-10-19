"use client";

import { useSyncExternalStore } from "react";
import { demoStore, isSuspended } from "./store";
import type { DemoState, Role, Session } from "./types";

const subscribeNoop = () => () => {};

/** False during SSR/first hydration pass, true once the client store can be trusted. */
export function useHydrated() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function useDemo(): DemoState {
  return useSyncExternalStore(demoStore.subscribe, demoStore.getSnapshot, demoStore.getServerSnapshot);
}

/** The signed-in session, or null when there is none or the account has been suspended. */
export function useSession(): Session | null {
  const s = useDemo();
  return s.session && !isSuspended(s, s.session.userId) ? s.session : null;
}

export function useRoleNotices(role: Role | undefined) {
  const { notices } = useDemo();
  return role ? notices.filter((n) => n.to === role) : [];
}
