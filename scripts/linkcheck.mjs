/** Crawl every internal link reachable from the site and report non-200s. */
const BASE = "http://localhost:3001";

const seen = new Set();
const queue = ["/"];
const results = [];
const badLinks = [];

function normalize(href) {
  if (!href) return null;
  if (href.startsWith("http")) return null; // external
  if (href.startsWith("#")) return null;
  const path = href.split("#")[0].split("?")[0];
  if (!path.startsWith("/")) return null;
  if (path.startsWith("/_next")) return null; // skip framework assets
  if (/\.[a-z0-9]+$/i.test(path)) return null; // skip files (css/js/img)
  return path.endsWith("/") || path === "/" ? path : path + "/";
}

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  let res, html = "";
  try {
    res = await fetch(BASE + path);
    html = await res.text();
  } catch (e) {
    results.push({ path, status: "ERR " + e.message });
    continue;
  }
  results.push({ path, status: res.status });
  if (res.status !== 200) continue;
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const h of hrefs) {
    const n = normalize(h);
    if (n && !seen.has(n) && !queue.includes(n)) queue.push(n);
  }
}

// verify each discovered internal link status
for (const r of results) {
  if (r.status !== 200) badLinks.push(r);
}

console.log(`Crawled ${results.length} internal routes from "/".`);
console.log(results.map((r) => `  ${r.status}  ${r.path}`).sort().join("\n"));
console.log(badLinks.length ? `\n✗ Non-200: ${badLinks.length}` : `\n✓ All internal links return 200.`);
