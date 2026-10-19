"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowLabel?: (row: T) => string;
  /** Rendered instead of the table below the md breakpoint. */
  mobileCard?: (row: T) => ReactNode;
  caption: string;
  minWidth?: string;
  initialSort?: { key: string; dir: "asc" | "desc" };
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  rowLabel,
  mobileCard,
  caption,
  minWidth = "min-w-[720px]",
  initialSort,
}: DataTableProps<T>) {
  const t = useT();
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort ?? null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const get = col.sortValue;
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, columns, sort]);

  const toggle = (key: string) =>
    setSort((prev) => (prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return (
    <>
      {mobileCard && (
        <ul className="space-y-3 md:hidden" aria-label={t(caption)}>
          {sorted.map((row) => (
            <li key={rowKey(row)}>
              {onRowClick ? (
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  aria-label={rowLabel?.(row)}
                  className="w-full rounded-xl border border-line bg-white p-4 text-left transition-colors hover:bg-green-50"
                >
                  {mobileCard(row)}
                </button>
              ) : (
                <div className="rounded-xl border border-line bg-white p-4">{mobileCard(row)}</div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className={cn("overflow-x-auto", mobileCard && "hidden md:block")}>
        <table className={`w-full ${minWidth} border-collapse text-sm`}>
          <caption className="sr-only">{t(caption)}</caption>
          <thead>
            <tr className="bg-green-50/60 text-xs font-semibold text-ink-muted">
              {columns.map((col) => {
                const active = sort?.key === col.key;
                const Icon = !active ? ChevronsUpDown : sort?.dir === "asc" ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort?.dir === "asc" ? "ascending" : "descending") : col.sortValue ? "none" : undefined}
                    className={cn("px-3 py-3 font-semibold", col.align === "right" ? "text-right" : "text-left", col.className)}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggle(col.key)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded transition-colors hover:text-ink",
                          active && "text-ink",
                        )}
                      >
                        {t(col.header)}
                        <Icon className="h-3 w-3" aria-hidden="true" />
                      </button>
                    ) : (
                      t(col.header)
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={rowKey(row)}
                tabIndex={onRowClick ? 0 : undefined}
                aria-label={onRowClick ? rowLabel?.(row) : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "border-t border-line transition-colors duration-150",
                  onRowClick && "cursor-pointer hover:bg-green-50/60 focus-visible:bg-green-50",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-3 py-3 align-middle", col.align === "right" && "text-right", col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
