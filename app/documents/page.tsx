import { redirect } from "next/navigation";

/** Legacy route kept so old links keep working. */
export default function Page() {
  redirect("/investor/documents");
}
