"use client";

import { useEffect, useRef, useState } from "react";
import { Bean, Coffee, Palmtree, Sprout, Trees, Wheat, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const placeholderIcons: Record<string, LucideIcon> = {
  coffee: Coffee,
  rice: Wheat,
  palmoil: Palmtree,
  soybean: Bean,
  cocoa: Trees,
  pepper: Sprout,
};

interface SafeImageProps {
  src?: string;
  alt: string;
  /** Category key used to pick a tasteful placeholder when the photo cannot load. */
  category?: string;
  className?: string;
  imgClassName?: string;
}

/** Image with graceful degradation: remote photo → designed CSS placeholder. */
export function SafeImage({ src, alt, category = "coffee", className, imgClassName }: SafeImageProps) {
  const [failed, setFailed] = useState(!src);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const Icon = placeholderIcons[category.toLowerCase()] ?? Sprout;

  useEffect(() => {
    const img = ref.current;
    if (img?.complete) {
      if (img.naturalWidth === 0) setFailed(true);
      else setLoaded(true);
    }
  }, []);

  return (
    <div className={cn("relative overflow-hidden bg-forest-800", className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-forest-700 via-forest-800 to-green-600"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 14px), linear-gradient(135deg,#0E513D,#063B2E 55%,#2F7D3B)",
        }}
      >
        <Icon className="h-10 w-10 text-white/35" strokeWidth={1.25} />
      </div>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
      {failed && <span className="sr-only">{alt}</span>}
    </div>
  );
}
