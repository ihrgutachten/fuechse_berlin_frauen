/**
 * Crop white padding from sponsor logos for the hero ticker.
 * Original files in public/sponsors stay untouched (sponsor wall).
 *
 *   npm install sharp --no-save
 *   node scripts/trim-ticker-logos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sponsors = JSON.parse(
  fs.readFileSync(path.join(root, "src", "data", "sponsors.json"), "utf8"),
);
const outDir = path.join(root, "public", "sponsors", "ticker");
fs.mkdirSync(outDir, { recursive: true });

for (const sponsor of sponsors) {
  const input = path.join(root, "public", sponsor.logo.replace(/^\//, ""));
  const output = path.join(outDir, `${sponsor.id}.png`);
  if (!fs.existsSync(input)) {
    console.warn(`missing ${sponsor.logo}`);
    continue;
  }
  try {
    await sharp(input)
      .trim({ background: "#ffffff", threshold: 42 })
      .png({ compressionLevel: 9 })
      .toFile(output);
    const meta = await sharp(output).metadata();
    console.log(`${sponsor.id}\t${meta.width}x${meta.height}`);
  } catch (error) {
    console.warn(`${sponsor.id}: ${error instanceof Error ? error.message : error}`);
  }
}
