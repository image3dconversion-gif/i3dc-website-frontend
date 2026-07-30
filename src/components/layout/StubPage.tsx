import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { RouteCards } from "@/components/sections/RouteCards";
import { cta } from "@/content/cta-routes";
import { img, type Img } from "@/content/images";
import { pageStubs, type PageStub } from "@/content/page-stubs";

/** Build page-level metadata for a stub route from its blueprint entry. */
export function stubMetadata(key: string): Metadata {
  const s = pageStubs[key];
  if (!s) return {};
  return {
    title: { absolute: s.seoTitle },
    alternates: { canonical: s.slug },
  };
}

// Planning/guide visual per workflow stub (legal pages get none).
const heroImage: Record<string, Img> = {
  "guided-implant-workflow": img.planFrontal,
  "full-arch-stackable-workflow": img.stackable,
  "zygoma-pterygoid-planning": img.segmentation,
  "immediate-loading-workflow": img.muaGuide,
  "case-data-preparation": img.planRestorative,
  "design-only-workflow": img.stlMesh,
  "design-to-delivery": img.printedGuideModel,
  "white-label-workflow-partner": img.printedGuideSleeves,
  "global-practices": img.planAnterior,
  "case-evidence": img.stackable,
  "case-requirements": img.planRestorative,
};

const relatedLinks = [
  { title: "How It Works", body: "See how a case moves from records to guided execution.", linkLabel: "View the workflow", href: "/how-it-works/" },
  { title: "Workflow Solutions", body: "Compare the implant workflows and ways of working.", linkLabel: "Explore solutions", href: "/digital-implant-workflows/" },
  { title: "Case Portal", body: "The secure environment where active cases are handled.", linkLabel: "About the portal", href: "/case-portal/" },
  { title: "FAQ", body: "Answers on records, design-only, delivery and the portal.", linkLabel: "Read the FAQ", href: "/faq/" },
];

/**
 * Interim page for a routed-but-not-yet-detailed workflow. Uses the accepted
 * visual system (PageHero + planning panel + related links) so every nav
 * destination reads as an intentional page — the workflow is available now via
 * the CTAs; only the deep page content is still being finalised.
 */
export function StubPage({ pageKey }: { pageKey: string }) {
  const s: PageStub | undefined = pageStubs[pageKey];
  if (!s) {
    return (
      <Section>
        <h1>Page not configured</h1>
        <p className="mt-4 text-ink">Missing stub entry for “{pageKey}”.</p>
      </Section>
    );
  }

  const isLegal = pageKey === "privacy" || pageKey === "terms";

  return (
    <>
      <PageHero
        eyebrow={s.eyebrow}
        h1={s.h1}
        body={s.intro}
        note="Services are provided to dental professionals and authorised workflow partners. The treating clinician retains clinical authority. Clinical records are submitted only through the authenticated Case Portal — never a public form."
        primary={{ label: s.primaryCta.label, href: s.primaryCta.href, external: s.primaryCta.external }}
        secondary={{ label: cta.discussCase.label, href: cta.discussCase.href }}
        image={heroImage[pageKey]}
        imageLabel={heroImage[pageKey] ? s.eyebrow : undefined}
      />

      {!isLegal && (
        <Section tone="tint" aria-labelledby="stub-related">
          <span aria-hidden className="tech-rule mb-4 block" />
          <div className="max-w-2xl">
            <h2 id="stub-related">This workflow is available now.</h2>
            <p className="mt-4 text-ink">
              The detailed page for this workflow is being finalised. You can start the
              conversation today — discuss your case, review how the workflow runs, or open the
              Case Portal. Continue exploring below.
            </p>
          </div>
          <div className="mt-8">
            <RouteCards cards={relatedLinks} columns={4} />
          </div>
        </Section>
      )}

      {isLegal && (
        <Section width="narrow" aria-labelledby="stub-legal">
          <h2 id="stub-legal" className="sr-only">Notice</h2>
          <p className="text-ink">
            This notice is being finalised with the privacy and legal owner and will be published
            here before launch. For any question in the meantime, use{" "}
            <a href="/discuss-a-case/" className="font-semibold">Discuss a Complex Case</a>.
          </p>
        </Section>
      )}
    </>
  );
}
