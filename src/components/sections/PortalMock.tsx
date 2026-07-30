import { DeviceFrame } from "@/components/ui/DeviceFrame";

/**
 * ABSTRACT Case Portal UI illustration — CSS only, NOT a screenshot.
 * Uses dummy, non-identifying content (workflow types + generic references +
 * status chips). No patient names, DOBs, case IDs, DICOM/STL, thumbnails, CRM,
 * payment or any real portal capture. This is the compliant stand-in until
 * de-identified portal screenshots are approved (assets folder 07-case-portal-ui
 * is empty). Framed in a browser DeviceFrame for a product-like presentation.
 */
const nav = ["Cases", "New case", "Files", "Approvals"];

const rows = [
  { ref: "Case · A", type: "Guided implant", status: "In planning", active: false },
  { ref: "Case · B", type: "Full-arch stackable", status: "Plan ready", active: true },
  { ref: "Case · C", type: "Design-only", status: "Files ready", active: false },
];

const track = ["Submitted", "Data check", "In planning", "Plan ready", "Approval", "Files ready"];

export function PortalMock() {
  return (
    <DeviceFrame label="Case Portal · illustrative" badge="Sample data">
      <div className="grid-surface grid grid-cols-[1fr] sm:grid-cols-[132px_1fr]">
        {/* mini sidebar (dummy nav) — hidden on the narrowest screens */}
        <nav
          aria-hidden
          className="hidden flex-col gap-1 border-r border-line bg-white/60 p-3 sm:flex"
        >
          {nav.map((item, i) => (
            <span
              key={item}
              className={
                "rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-semibold " +
                (i === 0 ? "bg-brand text-white" : "text-muted")
              }
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="min-w-0 p-4 sm:p-5">
          {/* workspace header (generic, non-identifying) */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Practice workspace
            </p>
            <span className="rounded-pill border border-line px-2.5 py-0.5 text-[11px] font-semibold text-muted">
              3 active cases
            </span>
          </div>

          {/* case list (dummy) */}
          <ul className="mt-3 space-y-2">
            {rows.map((r) => (
              <li
                key={r.ref}
                className={
                  "flex items-center justify-between gap-3 rounded-[var(--radius-card)] border bg-white px-4 py-3 shadow-[var(--shadow-sm)] " +
                  (r.active ? "border-brand" : "border-line")
                }
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="text-xs font-semibold text-muted">{r.ref}</span>
                  <span className="truncate text-sm font-semibold text-heading">{r.type}</span>
                </span>
                <span
                  className={
                    "shrink-0 rounded-pill px-3 py-1 text-xs font-semibold " +
                    (r.active ? "bg-brand text-white" : "border border-line text-muted")
                  }
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>

          {/* status track (dummy) */}
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
            Case status
          </p>
          <ol className="mt-2 flex flex-wrap gap-1.5">
            {track.map((s, i) => (
              <li
                key={s}
                className={
                  "rounded-pill px-2.5 py-1 text-[11px] font-semibold " +
                  (i === 3 ? "bg-brand text-white" : "border border-line bg-white text-muted")
                }
              >
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </DeviceFrame>
  );
}
