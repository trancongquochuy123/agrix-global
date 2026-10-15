import type { Role } from "./types";

export const homeOf = (role: Role) => `/${role}/dashboard`;

export function portalOf(pathname: string): Role | null {
  const seg = pathname.split("/")[1];
  return seg === "investor" || seg === "seller" || seg === "admin" ? seg : null;
}

/** Where asset pages live for a given viewer: public visitors and investors see different bases. */
export const marketBase = (role: Role | null | undefined) => (role === "investor" ? "/investor/marketplace" : "/marketplace");
