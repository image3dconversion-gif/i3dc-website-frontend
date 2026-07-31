import Link from "next/link";

export interface RouteCard {
  title: string;
  body: string;
  linkLabel: string;
  href: string;
}

/** Compact route-selector cards used to guide visitors to the right page. */
export function RouteCards({ cards, columns = 3 }: { cards: RouteCard[]; columns?: 2 | 3 | 4 }) {
  const col = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <ul className={`grid gap-5 ${col}`}>
      {cards.map((c, i) => (
        <li key={c.href + c.title}>
          <Link
            href={c.href}
            style={{ animationDelay: `${i * 60}ms` }}
            className="reveal-up group flex h-full flex-col rounded-[var(--radius-card)] border border-line-strong bg-white p-5 no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-[var(--shadow-float)]"
          >
            <h3 className="text-base">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm text-ink">{c.body}</p>
            <span className="mt-3 text-sm font-bold text-brand group-hover:text-brand-hover">
              {c.linkLabel} <span aria-hidden>→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
