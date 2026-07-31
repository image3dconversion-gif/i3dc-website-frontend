import Image from "next/image";
import type { Img } from "@/content/images";

type Ground = "light" | "tint" | "navy";

const groundClass: Record<Ground, string> = {
  light: "bg-[#F8FAFC]",
  tint: "bg-blue-50",
  navy: "bg-[#202F4F]",
};

interface CutoutFrameProps {
  /** Approved transparent cut-out from the manifest. */
  image: Img;
  /** Brand-colour field placed behind the transparent subject (§7: never rely
   *  on inherited page background). Default off-white. */
  ground?: Ground;
  /** Aspect-ratio box; the subject is `contain`ed inside it (never cropped). */
  ratio?: string;
  /** Optional software-window chrome bar label. */
  label?: string;
  /** Optional caption rendered under the frame. */
  caption?: string;
  /** Inner padding around the subject (Tailwind spacing). Default "p-6". */
  pad?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Presents an approved TRANSPARENT cut-out (product render / produced output) on
 * a defined brand-colour ground, sized with `object-contain` and generous
 * padding so the whole subject is visible and never cropped. This is the
 * counterpart to `PlanningPanel`/`ImageOrSlot` (which use `object-cover` for
 * full-bleed rectangular screenshots). Direction ref:
 * IMAGE3DCONVERSION_PREMIUM_ASSET_DIRECTION.md §1 & §7.
 *
 * No text or logo is composited onto the clinical subject — captions live in
 * chrome/figcaption only.
 */
export function CutoutFrame({
  image,
  ground = "light",
  ratio = "4/3",
  label,
  caption,
  pad = "p-6",
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 560px",
  className = "",
}: CutoutFrameProps) {
  const onNavy = ground === "navy";
  return (
    <figure className={`media-frame ${className}`}>
      {label && (
        <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
          </span>
          <span className="ml-1 truncate text-xs font-semibold tracking-wide text-muted">
            {label}
          </span>
        </div>
      )}
      <div className={`relative w-full ${groundClass[ground]}`} style={{ aspectRatio: ratio }}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-contain ${pad}`}
        />
      </div>
      {caption && (
        <figcaption
          className={
            "px-4 py-2.5 text-[11px] font-semibold " +
            (onNavy ? "bg-[#202F4F] text-[var(--text-on-invert-muted)]" : "bg-white text-muted")
          }
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
