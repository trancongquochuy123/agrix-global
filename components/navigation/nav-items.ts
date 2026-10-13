import { BarChart3, BrainCircuit, FileText, LayoutDashboard, Leaf, Settings, Store, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  matchPrefix?: string;
}

export const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard", matchPrefix: "/dashboard" },
  { label: "Marketplace", icon: Store, href: "/marketplace", matchPrefix: "/marketplace" },
  { label: "My Assets", icon: Leaf, href: "/assets/register", matchPrefix: "/assets" },
  { label: "AI Intelligence", icon: BrainCircuit, href: "/ai-intelligence", matchPrefix: "/ai-intelligence" },
  { label: "Portfolio", icon: BarChart3, href: "/portfolio", matchPrefix: "/portfolio" },
  { label: "Documents", icon: FileText, href: "/documents", matchPrefix: "/documents" },
  { label: "Settings", icon: Settings, href: "/settings", matchPrefix: "/settings" },
];

export function isActive(item: NavItem, pathname: string) {
  return item.matchPrefix ? pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`) : false;
}
