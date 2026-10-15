"use client";

import { useState } from "react";
import { ANCHOR } from "./seed";

/** Client-side "now" for accrual maths; never earlier than the seed anchor date. */
export function useNow() {
  const [now] = useState(() => Math.max(Date.now(), ANCHOR));
  return now;
}
