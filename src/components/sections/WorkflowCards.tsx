import Link from "next/link";
import Image from "next/image";
import type { WorkflowCard } from "@/content/pages/home";

/**
 * Case-led workflow cards. Each card is ONE semantic link with crawlable text
 * and a real de-identified planning/guide image framed like a clinical
 * software panel (light chrome bar + label), with a subtle brand-blue cohesion
 * overlay so the 3D viewports read as one blue-white system. Soft float shadow
 * lifts on hover. No nested cards.
 */
export function WorkflowCards({ cards }: { cards: readonly WorkflowCard[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {cards.map((card) => (
        <li key={card.href}>
          <Link
            href={card.href}
            className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white no-underline shadow-[var(--shadow-float)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
          >
            {/* light software-window chrome */}
            <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
              </span>
              <span className="ml-1 truncate text-xs font-semibold tracking-wide text-muted">
                {card.panelLabel}
              </span>
            </div>
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-blue-900">
              <Image
                src={card.image.src}
                alt={card.image.alt}
                fill
                sizes="(max-width: 640px) 100vw, 560px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span aria-hidden className="panel-cohere" />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-xl">{card.title}</h3>
              <p className="mt-2 flex-1 text-base text-ink">{card.body}</p>
              <span className="mt-4 inline-block text-sm font-bold text-brand group-hover:text-brand-hover">
                {card.linkLabel} <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
