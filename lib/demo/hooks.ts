"use client";

import { useSyncExternalStore } from "react";
import { demoStore } from "./store";
import type { DemoState, Role, Session } from "./types";

const subscribeNoop = () => () => {};

/** False during SSR/first hydration pass, true once the client store can be trusted. */
export function useHydrated() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function useDemo(): DemoState {
  return useSyncExternalStore(demoStore.subscribe, demoStore.getSnapshot, demoStore.getServerSnapshot);
}

export function useSession(): Session | null {
  return useDemo().session;
}

export function useRoleNotices(role: Role | undefined) {
  const { notices } = useDemo();
  return role ? notices.filter((n) => n.to === role) : [];
}
