import fs from "fs";

const html = fs.readFileSync(`${process.env.TEMP}/sponsoren.html`, "utf8");

const headings = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)].map((m) =>
  m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
);
console.log("TIER-LIKE HEADINGS:");
for (const h of headings) {
  if (/partner|platin|gold|silber|premium|ausr|gesund|mobil|medien|versich|hbf|sponsor/i.test(h)) {
    console.log(" -", h);
  }
}

// Split by section titles to associate images with tiers
const tierPattern =
  /(Platin Partner|Gold Partner|Silber Partner|Premium Partner|AusrüstungsPartner|GesundheitsPartner|Mobilpartner|Medienpartner|Versicherungspartner|HBF-Partner|\bPartner\b)/gi;

const parts = html.split(/(?=<h[23][^>]*>)/i);
console.log("\nSECTIONS", parts.length);

for (const part of parts) {
  const titleMatch = part.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
  if (!titleMatch) continue;
  const title = titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (!/partner|platin|gold|silber|premium|ausr|gesund|mobil|medien|versich|hbf/i.test(title)) continue;

  const imgs = [...part.matchAll(/<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<img[^>]+>|<img[^>]+>/gi)];
  console.log("\n===", title, "===");
  // Find image+link pairs more carefully
  const blocks = [...part.matchAll(/<a([^>]*)>([\s\S]*?)<\/a>/gi)];
  for (const b of blocks) {
    const attrs = b[1];
    const inner = b[2];
    const href = (attrs.match(/href="([^"]*)"/) || [])[1];
    const img = inner.match(/<img[^>]+>/i);
    if (!img) continue;
    const src =
      (img[0].match(/data-src="([^"]+)"/) || img[0].match(/src="([^"]+)"/) || [])[1];
    const alt = (img[0].match(/alt="([^"]*)"/) || [])[1] || "";
    if (!src || !/wp-content\/uploads/i.test(src)) continue;
    console.log({ alt, href, src: src.split("/").pop() });
  }
}
