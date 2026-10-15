import { redirect } from "next/navigation";

/** `/` is rewritten to /landing.html in next.config.mjs; this is only a fallback. */
export default function Home() {
  redirect("/landing.html");
}
