// src/components/ui/AppButton.jsx
import React from "react";

/**
 * AppButton — tema-duyarlı, tutarlı buton
 * Varyantlar: primary | neutral | subtle | danger | outline | ghost | ctaBlue
 * Boyutlar: sm | md | lg
 * Şekil: shape = "none" | "md" | "xl" (default: "xl")
 */
export default function AppButton({
  as: Tag = "button",
  variant = "kurumsalmavi",
  size = "sm",
  shape = "none",
  type = "button",
  loading = false,
  disabled = false,
  textcolor = "white",
  className = "",
  children,
  ...rest
}) {

  const isDisabled = disabled || loading;

  const textcolors = {
    white: "text-white",
    black: "text-black"
  }
  const radius = {
    none: "rounded-none",
    md: "rounded-md",
    xl: "rounded-xl",
  }[shape] || "rounded-xl";

  const base =
    "inline-flex items-center justify-center " +
    radius +
    " transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 " +
    "focus-visible:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed " +
    "select-none cursor-pointer"; // ← imleç her zaman pointer

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    mdtxtlg: "h-10 px-4 text-md",
    lg: "h-11 px-5 text-base",
  };

  const variants = {
    seffaf:
    "",
    // "koyu mavi"
    koyumavi:
      "bg-blue-700 text-white hover:bg-blue-700 shadow-sm",
    // "kurumsal mavi"

    kurumsalmavi:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-sm dark:bg-blue-800 text-white hover:bg-blue-600 shadow-sm",

    // "gri"
    gri:
      "bg-zinc-600 text-white hover:bg-zinc-700 shadow-sm dark:bg-zinc-500 text-white hover:bg-zinc-700 shadow-sm",

    // "yesil" (yeşil)
    yesil:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",

    // "mor"
    mor:
      "bg-violet-600 text-white hover:bg-violet-700 shadow-sm",

    // "turuncu"
    turuncu:
      "bg-orange-600 text-white hover:bg-orange-700 shadow-sm",

    // "sari" (sarı)
    sari:
      "bg-amber-400 text-white hover:bg-amber-600 shadow-sm dark:bg-amber-500 text-white hover:bg-amber-600 shadow-sm",

    // "lacivert"
    // Not: lacivert için daha koyu bir ton kullandık.
    lacivert:
      "bg-indigo-900 text-white hover:bg-indigo-800 shadow-sm",

    // "kirmizi" (kırmızı)
    kirmizi:
      "bg-red-600 text-white hover:bg-red-700 shadow-sm dark:bg-red-700 text-white hover:bg-red-700 shadow-sm",
  };

  const spin =
    "inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2";

  return (
    <Tag
      type={Tag === "button" ? type : undefined}
      className={[
        base,
        sizes[size],
        variants[variant] || variants.kurumsalmavi,
        textcolors[textcolor],
        className,
      ].join(" ")}
      disabled={isDisabled}
      aria-busy={loading ? "true" : undefined}
      data-variant={variant}
      {...rest}
    >
      {loading ? <span className={spin} /> : null}
      {children}
    </Tag>
  );
}
