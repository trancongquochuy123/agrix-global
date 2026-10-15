/**
 * Presenter utilities (Demo switcher, form quick-fill) are shown only when this public env flag is exactly "true".
 * It is a UI feature flag, not a security boundary: unset or any other value hides every presenter control.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
