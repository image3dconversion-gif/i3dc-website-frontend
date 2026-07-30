import type { ReactNode } from "react";

interface DeviceFrameProps {
  children: ReactNode;
  /**
   * Neutral label shown in the chrome bar's "address" pill. This is an
   * ILLUSTRATIVE label, never a real portal URL/domain — the frame must not
   * imply a live portal capture. Keep wording like "Case Portal · illustrative".
   */
  label?: string;
  /** Small badge (e.g. "Sample data") to make the synthetic nature explicit. */
  badge?: string;
  className?: string;
}

/**
 * Browser-window chrome wrapper. Frames a CSS/synthetic UI mock like an
 * application window (control dots + a neutral address pill), giving the Case
 * Portal explainer a designed, product-like presentation without any real
 * screenshot, URL, patient, case, CRM or payment data. Static — no motion.
 */
export function DeviceFrame({ children, label, badge, className = "" }: DeviceFrameProps) {
  return (
    <figure className={`media-frame ${className}`}>
      <div className="flex items-center gap-2 border-b border-line bg-white px-3 py-2.5 sm:px-4">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
        </span>
        {label && (
          <span className="ml-1 flex min-w-0 flex-1 items-center justify-center rounded-pill border border-line bg-blue-50 px-3 py-1">
            <span className="truncate text-[11px] font-semibold text-muted">{label}</span>
          </span>
        )}
        {badge && (
          <span className="shrink-0 rounded-pill bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
            {badge}
          </span>
        )}
      </div>
      {children}
    </figure>
  );
}
