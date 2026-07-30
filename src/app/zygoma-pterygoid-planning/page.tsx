import type { Metadata } from "next";
import { WorkflowPage } from "@/components/sections/WorkflowPage";
import { workflows } from "@/content/pages/workflows";

const c = workflows["zygoma-pterygoid-planning"];

export const metadata: Metadata = {
  title: { absolute: c.seoTitle },
  description: c.description,
  alternates: { canonical: c.canonical },
};

export default function Page() {
  return <WorkflowPage c={c} />;
}
