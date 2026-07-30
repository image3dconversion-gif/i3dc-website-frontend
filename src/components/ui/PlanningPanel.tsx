import Image from "next/image";
import type { Img } from "@/content/images";

interface PlanningPanelProps {
  image: Img;
  /** Aspect ratio box, e.g. "4/3", "16/10". Image is object-cover cropped. */
  ratio?: string;
  /** Small caption shown in the light chrome bar (what the view shows). */
  label?: string;
  /** Show the light software-window chrome bar. Default true. */
  chrome?: boolean;
  /** next/image priority for above-the-fold hero image. */
  priority?: boolean;
  /** Responsive sizes hint. */
  sizes?: string;
  className?: string;
}

/**
 * Frames a real planning/product image like a clinical software panel: a light
 * chrome bar with control dots + a caption, over the (often dark) 3D viewport.
 * This reads as a technical planning surface rather than a dark image block,
 * and layers cleanly for depth.
 */
export function PlanningPanel({
  image,
  ratio = "16/10",
  label,
  chrome = true,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 640px",
  className = "",
}: PlanningPanelProps) {
  return (
    <figure className={`media-frame ${className}`}>
      {chrome && (
        <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
          </span>
          {label && (
            <span className="ml-1 truncate text-xs font-semibold tracking-wide text-muted">
              {label}
            </span>
          )}
        </div>
      )}
      <div className="relative w-full bg-blue-900" style={{ aspectRatio: ratio }}>
        <Image
          src={image.src}
          alt={image.alt}
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
