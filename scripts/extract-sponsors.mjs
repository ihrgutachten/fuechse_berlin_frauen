import fs from "fs";

const html = fs.readFileSync(`${process.env.TEMP}/sponsoren.html`, "utf8");
const parts = html.split(/(?=<h[23][^>]*>)/i);

const tiers = [];

for (const part of parts) {
  const titleMatch = part.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
  if (!titleMatch) continue;
  const title = titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (!/partner|platin|gold|silber|premium|ausr|gesund|mobil|medien|versich|hbf/i.test(title)) continue;
  if (/sponsoring anfragen/i.test(title)) continue;

  const items = [];
  const blocks = [...part.matchAll(/<a([^>]*)>([\s\S]*?)<\/a>/gi)];
  for (const b of blocks) {
    const attrs = b[1];
    const inner = b[2];
    const href = (attrs.match(/href="([^"]*)"/) || [])[1];
    const img = inner.match(/<img[^>]+>/i);
    if (!img || !href) continue;
    const src =
      (img[0].match(/data-src="([^"]+)"/) ||
        img[0].match(/data-lazy-src="([^"]+)"/) ||
        img[0].match(/src="([^"]+)"/) ||
        [])[1];
    if (!src || !/wp-content\/uploads/i.test(src)) continue;
    // Prefer full-size: strip -768x768 etc if we want, but keep what's there for reliability
    const fullSrc = src.replace(/-\d+x\d+(?=\.(jpg|jpeg|png|webp))/i, "");
    items.push({ href: href.replace(/&#038;/g, "&"), src, fullSrc });
  }
  if (items.length) tiers.push({ title, items });
}

fs.writeFileSync(
  new URL("./sponsors-raw.json", import.meta.url),
  JSON.stringify(tiers, null, 2),
);
console.log(JSON.stringify(tiers, null, 2));
