/**
 * Cover artwork per asset category. These are original illustrations bundled in /public/images/assets so
 * every card and detail page always shows subject-correct imagery (no hot-linked stock photos).
 * To use real site photography, drop files in that folder and point the paths below at them — every
 * consumer renders through <SafeImage>, which falls back to a designed placeholder if a file fails.
 */
const cover = (name: string) => `/images/assets/${name}.svg`;

export const IMAGES = {
  coffee: cover("coffee"),
  rice: cover("rice"),
  palmoil: cover("palmoil"),
  soybean: cover("soybean"),
  cocoa: cover("cocoa"),
  pepper: cover("pepper"),
  highlands: cover("coffee"),
};

/** Local, low-resolution photos from the brand kit used for small decorative thumbnails. */
export const LOCAL_IMAGES = {
  landscape: "/images/hero-landscape.jpg",
  coffee: "/images/category-coffee.jpg",
  rice: "/images/category-rice.jpg",
  carbon: "/images/category-carbon.jpg",
  forest: "/images/category-forest.jpg",
};
