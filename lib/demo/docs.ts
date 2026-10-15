import { getAssetDetail } from "@/data/assets";
import type { Asset, AssetDocument } from "@/types/asset";
import { fmtDate } from "./format";

const typeOf = (name: string): AssetDocument["fileType"] => {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext === "xlsx" || ext === "xls" || ext === "csv" ? "XLSX" : ext === "kml" ? "KML" : "PDF";
};

const sizeLabel = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

/** Files the seller attached (simulated). Seed listings without uploads fall back to the category data room. */
export function assetDocuments(asset: Asset): AssetDocument[] {
  if (asset.uploads.length > 0) {
    return asset.uploads.map((u, i) => ({
      id: `${asset.id}-u${i}`,
      name: u.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      fileType: typeOf(u.name),
      size: sizeLabel(u.sizeKb),
      date: fmtDate(asset.submittedAt ?? asset.createdAt),
      category: /survey|boundary|map/i.test(u.name) ? "Survey" : /offtake|budget|valuation|insurance/i.test(u.name) ? "Financial" : /environment|soil|certif/i.test(u.name) ? "Environmental" : "Legal",
    }));
  }
  return getAssetDetail(asset).documents;
}
