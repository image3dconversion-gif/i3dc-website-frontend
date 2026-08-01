import KeystaticApp from "../keystatic";

// Internal CMS admin — kept out of the index (see robots.ts + metadata below).
export const metadata = { robots: { index: false, follow: false } };

export default function Keystatic() {
  return <KeystaticApp />;
}
