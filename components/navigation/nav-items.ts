import {
  Activity,
  ArrowLeftRight,
  Bell,
  BarChart3,
  BrainCircuit,
  Building2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Leaf,
  PlusCircle,
  Settings,
  ShieldAlert,
  Store,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/demo/types";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  matchPrefix?: string;
  /** A sub-path that should not count as a match (e.g. "My Assets" vs "Create New Asset"). */
  exclude?: string;
  badge?: "pending" | "unread";
}

export const navByRole: Record<Role, NavItem[]> = {
  investor: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/investor/dashboard", matchPrefix: "/investor/dashboard" },
    { label: "Marketplace", icon: Store, href: "/investor/marketplace", matchPrefix: "/investor/marketplace" },
    { label: "Portfolio", icon: BarChart3, href: "/investor/portfolio", matchPrefix: "/investor/portfolio" },
    { label: "Transactions", icon: ArrowLeftRight, href: "/investor/transactions", matchPrefix: "/investor/transactions" },
    { label: "AI Intelligence", icon: BrainCircuit, href: "/investor/ai-intelligence", matchPrefix: "/investor/ai-intelligence" },
    { label: "Documents", icon: FileText, href: "/investor/documents", matchPrefix: "/investor/documents" },
    { label: "Notifications", icon: Bell, href: "/investor/notifications", matchPrefix: "/investor/notifications", badge: "unread" },
    { label: "Profile", icon: UserRound, href: "/investor/profile", matchPrefix: "/investor/profile" },
  ],
  seller: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/seller/dashboard", matchPrefix: "/seller/dashboard" },
    { label: "My Assets", icon: Leaf, href: "/seller/assets", matchPrefix: "/seller/assets", exclude: "/seller/assets/new" },
    { label: "Create New Asset", icon: PlusCircle, href: "/seller/assets/new", matchPrefix: "/seller/assets/new" },
    { label: "Documents", icon: FileText, href: "/seller/documents", matchPrefix: "/seller/documents" },
    { label: "Notifications", icon: Bell, href: "/seller/notifications", matchPrefix: "/seller/notifications", badge: "unread" },
    { label: "Business Profile", icon: Building2, href: "/seller/profile", matchPrefix: "/seller/profile" },
  ],
  admin: [
    { label: "Overview", icon: LayoutDashboard, href: "/admin/dashboard", matchPrefix: "/admin/dashboard" },
    { label: "Approval Queue", icon: ClipboardCheck, href: "/admin/approvals", matchPrefix: "/admin/approvals", badge: "pending" },
    { label: "User Management", icon: Users, href: "/admin/users", matchPrefix: "/admin/users" },
    { label: "Transactions", icon: ArrowLeftRight, href: "/admin/transactions", matchPrefix: "/admin/transactions" },
    { label: "Risk Monitoring", icon: ShieldAlert, href: "/admin/risk", matchPrefix: "/admin/risk" },
    { label: "Activity Log", icon: Activity, href: "/admin/activity", matchPrefix: "/admin/activity" },
    { label: "Settings", icon: Settings, href: "/admin/profile", matchPrefix: "/admin/profile" },
  ],
};

export const WORKSPACE_LABEL: Record<Role, string> = {
  investor: "Investor workspace",
  seller: "Seller workspace",
  admin: "Admin console",
};

export function isActive(item: NavItem, pathname: string) {
  const p = item.matchPrefix;
  if (!p) return false;
  if (item.exclude && (pathname === item.exclude || pathname.startsWith(`${item.exclude}/`))) return false;
  return pathname === p || pathname.startsWith(`${p}/`);
}
