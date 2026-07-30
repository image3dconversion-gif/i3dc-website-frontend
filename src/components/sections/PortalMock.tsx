/**
 * ABSTRACT Case Portal UI illustration — CSS only, NOT a screenshot.
 * Uses dummy, non-identifying content (workflow types + generic references +
 * status chips). No patient names, DOBs, case IDs, DICOM/STL, thumbnails or any
 * real portal capture. This is the compliant stand-in until de-identified
 * portal screenshots are approved (assets folder 07-case-portal-ui is empty).
 */
const rows = [
  { ref: "Case · A", type: "Guided implant", status: "In planning", active: false },
  { ref: "Case · B", type: "Full-arch stackable", status: "Plan ready", active: true },
  { ref: "Case · C", type: "Design-only", status: "Files ready", active: false },
];

const track = ["Submitted", "Data check", "In planning", "Plan ready", "Approval", "Files ready"];

export function PortalMock() {
  return (
    <figure className="media-frame">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
        </span>
        <span className="ml-1 text-xs font-semibold text-muted">Case Portal · illustrative</span>
      </div>

      <div className="grid-surface p-5">
        {/* case list (dummy) */}
        <ul className="space-y-2">
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
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">Case status</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {track.map((s, i) => (
            <span
              key={s}
              className={
                "rounded-pill px-2.5 py-1 text-[11px] font-semibold " +
                (i === 3 ? "bg-brand text-white" : "border border-line bg-white text-muted")
              }
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
