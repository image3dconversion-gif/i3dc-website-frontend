import Image from "next/image";
import type { Img } from "@/content/images";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface ImageOrSlotProps {
  /** Approved manifest asset, or null/undefined to render a labelled slot. */
  image?: Img | null;
  /** Final alt text — used for the real image AND the placeholder direction. */
  alt: string;
  /** Asset spec shown while the slot is empty, e.g. "hero (≥2,400px, de-id)". */
  slot: string;
  ratio?: string;
  /** Optional software-window chrome label (frames it like a planning panel). */
  label?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Renders an approved image when one exists, otherwise a labelled placeholder —
 * both inside the SAME framed surface so a page looks designed whether or not
 * the asset has landed. This is the swap point for gated assets (P0-x): pass the
 * manifest entry when approved and the placeholder disappears with zero layout
 * change. CMS-readiness: a future `imageAsset` record drives `image`.
 *
 * A placeholder must never imply a real clinical outcome (IMAGE_ASSET_AUDIT.md).
 */
export function ImageOrSlot({
  image,
  alt,
  slot,
  ratio = "4/3",
  label,
  sizes = "(max-width: 1024px) 100vw, 560px",
  priority = false,
  className = "",
}: ImageOrSlotProps) {
  if (!image) {
    return (
      <figure className={`media-frame ${className}`}>
        {label && <ChromeBar label={label} />}
        <ImagePlaceholder alt={alt} slot={slot} ratio={ratio} className="rounded-none border-0" />
      </figure>
    );
  }
  return (
    <figure className={`media-frame ${className}`}>
      {label && <ChromeBar label={label} />}
      <div className="relative w-full bg-blue-900" style={{ aspectRatio: ratio }}>
        <Image
          src={image.src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
        <span aria-hidden className="panel-cohere" />
      </div>
    </figure>
  );
}

function ChromeBar({ label }: { label: string }) {
  return (
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
  );
}
