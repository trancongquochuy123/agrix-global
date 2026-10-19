/**
 * Vietnamese dictionary: English source text → Vietnamese. Split by area for easier review; later files win on
 * duplicate keys. Keys must match the English text in the code exactly (including punctuation).
 */
import { common } from "./dict/common";
import { content } from "./dict/content";
import { pages } from "./dict/pages";
import { forms } from "./dict/forms";
import { messages } from "./dict/messages";

export const VI: Record<string, string> = { ...content, ...messages, ...forms, ...pages, ...common };
