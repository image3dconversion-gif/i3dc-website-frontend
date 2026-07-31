/**
 * Typographic brand lockup — the company NAME set in the display face, with
 * "3D" in the brand accent. This is a text treatment, NOT a logo mark: it is the
 * safe brand presence for dark/navy surfaces (and anywhere the raster
 * `i3dc-logo.webp` cannot be used because it may carry a white background).
 *
 * It never replaces the real logo on light surfaces (the Header still uses the
 * approved raster logo). See docs/handoff/DIGITAL_DENTISTRY_ASSET_REQUIREMENTS.md
 * for the transparent PNG / SVG / inverse-logo / favicon requirements.
 */
export function Wordmark({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const base = tone === "dark" ? "text-white" : "text-heading";
  const accent = tone === "dark" ? "text-blue-200" : "text-brand";
  return (
    <span
      className={`font-display font-bold leading-none tracking-tight ${base} ${className}`}
    >
      Image<span className={accent}>3D</span>Conversion
    </span>
  );
}
