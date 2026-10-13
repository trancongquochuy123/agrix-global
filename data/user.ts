import type { UserProfile } from "@/types/intelligence";

export const currentUser: UserProfile = {
  name: "Tran Duc Minh",
  initials: "TD",
  role: "Investor",
  email: "minh.tran@agrix.example",
};

export const languages = [
  { code: "EN", label: "English" },
  { code: "VI", label: "Tiếng Việt" },
  { code: "KO", label: "한국어" },
] as const;

export const notifications = [
  { id: "n1", title: "Dak Lak Coffee Estate reached 67% funded", time: "12 min ago" },
  { id: "n2", title: "New AI valuation published for Mekong Rice Cluster", time: "2 hours ago" },
  { id: "n3", title: "Q3 investor report is ready to download", time: "Yesterday" },
];
