/**
 * Labelled placeholder for an image slot that has no approved, de-identified
 * asset yet. Renders the intended alt text + asset category so pages are
 * complete and reviewable without shipping unapproved or PII-bearing imagery.
 *
 * When a real asset is ready: place the optimised file in public/images/ and
 * swap this for next/image with the SAME alt text.
 *
 * A placeholder must never imply a real clinical outcome. See
 * docs/handoff/IMAGE_ASSET_AUDIT.md.
 */
interface ImagePlaceholderProps {
  /** Alt-text direction / final alt text for the intended image. */
  alt: string;
  /** Asset category or note, e.g. "hero (needs ≥2,400px de-identified case)". */
  slot: string;
  /** aspect ratio, e.g. "16/9", "4/3". Case cards use a consistent set. */
  ratio?: string;
  className?: string;
}

export function ImagePlaceholder({
  alt,
  slot,
  ratio = "16/10",
  className = "",
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${alt}`}
      style={{ aspectRatio: ratio }}
      className={
        "relative flex w-full flex-col justify-end overflow-hidden rounded-[var(--radius-card)] " +
        "border border-dashed border-line-strong bg-blue-50 p-4 " +
        className
      }
    >
      {/* subtle diagonal hatch to read clearly as a placeholder, not content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 14px, rgba(47,70,120,0.05) 14px 15px)",
        }}
      />
      <div className="relative">
        <span className="inline-block rounded-sm bg-white/80 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
          Image slot
        </span>
        <p className="mt-2 text-sm font-semibold text-heading">{alt}</p>
        <p className="mt-0.5 text-xs text-muted">{slot}</p>
      </div>
    </div>
  );
}
