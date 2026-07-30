import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false }, // internal reference, not indexed
};

const scale: { name: string; token: string; hex: string }[] = [
  { name: "blue-50", token: "--blue-50", hex: "#eef1f7" },
  { name: "blue-100", token: "--blue-100", hex: "#dbe2ef" },
  { name: "blue-200", token: "--blue-200", hex: "#b7c5df" },
  { name: "blue-300", token: "--blue-300", hex: "#8ea3c9" },
  { name: "blue-400", token: "--blue-400", hex: "#6480ae" },
  { name: "blue-500", token: "--blue-500", hex: "#43608f" },
  { name: "blue-600 ★ master", token: "--blue-600", hex: "#2f4678" },
  { name: "blue-700", token: "--blue-700", hex: "#283c66" },
  { name: "blue-800", token: "--blue-800", hex: "#202f4f" },
  { name: "blue-900 ink", token: "--blue-900", hex: "#16213a" },
];

const statuses = [
  { name: "success", varName: "--status-success" },
  { name: "caution", varName: "--status-caution" },
  { name: "error", varName: "--status-error" },
];

export default function DesignSystemPage() {
  return (
    <>
      <Section tone="tint">
        <Eyebrow>Internal reference · not indexed</Eyebrow>
        <h1>Image3DConversion Design System</h1>
        <p className="mt-4 max-w-2xl text-ink">
          One master blue (<code>#2F4678</code>, sampled from the master logo) and
          white. White leads. Every blue below is derived from the single master
          blue — no decorative third accent. Radius ≤ 8px, no nested cards.
        </p>
      </Section>

      <Section aria-labelledby="ds-color">
        <h2 id="ds-color">Colour — derived blue scale</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {scale.map((c) => (
            <div key={c.token} className="rounded-[var(--radius-card)] border border-line">
              <div className="h-16 rounded-t-[var(--radius-card)]" style={{ background: c.hex }} />
              <div className="p-3">
                <p className="text-xs font-semibold text-heading">{c.name}</p>
                <p className="font-mono text-xs text-muted">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-10">Functional status — Case Portal semantics only</h3>
        <p className="mt-2 text-sm text-muted">
          These must never be used decoratively on the public site.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {statuses.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-2 rounded-[var(--radius-card)] border border-line px-4 py-2"
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ background: `var(${s.varName})` }}
              />
              <span className="text-sm font-semibold text-heading">{s.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="tint" aria-labelledby="ds-type">
        <h2 id="ds-type">Typography — Bricolage Grotesque + Lato</h2>
        <div className="mt-6 space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-6">
          <h1>Plan the outcome. Guide the execution.</h1>
          <h2>Choose the workflow your case needs.</h2>
          <h3>The guide is one part of the workflow.</h3>
          <p className="max-w-2xl">
            Body copy set in Lato at 18px with a 1.6 line height. Short, concrete
            sentences that name the actual work. The display voice is Bricolage
            Grotesque 600; there is only one display voice.
          </p>
        </div>
      </Section>

      <Section aria-labelledby="ds-buttons">
        <h2 id="ds-buttons">Buttons</h2>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <ButtonLink href="#" variant="primary">Start a Case</ButtonLink>
          <ButtonLink href="#" variant="secondary">Discuss a Complex Case</ButtonLink>
          <ButtonLink href="#" variant="utility">Open the Case Portal →</ButtonLink>
        </div>
      </Section>

      <Section tone="tint" aria-labelledby="ds-slots">
        <h2 id="ds-slots">Image slots</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Until an approved, de-identified asset is placed in{" "}
          <code>public/images/</code>, image slots render as labelled
          placeholders carrying the intended alt text and asset category.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ImagePlaceholder alt="Hero: restoration + implant plan + guide, one de-identified case." slot="hero (≥2,400px)" ratio="4/3" />
          <ImagePlaceholder alt="Guided single-to-multiple implant planning view." slot="02-3d-planning-screens" ratio="4/3" />
          <ImagePlaceholder alt="Full-arch stackable guide sequence." slot="04-full-arch (de-identified)" ratio="4/3" />
        </div>
      </Section>
    </>
  );
}
