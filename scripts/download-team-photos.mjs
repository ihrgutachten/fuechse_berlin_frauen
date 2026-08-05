import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "team");
fs.mkdirSync(outDir, { recursive: true });

const base = "https://fuechseberlinfrauen.de/wp-content/uploads/2026/08";

/** @type {Array<{slug:string, src:string, ext:string}>} */
const downloads = [
  { slug: "danique-trooster", src: `${base}/17-819x1024.jpg`, ext: "jpg" },
  { slug: "zoe-ludwig", src: `${base}/13-1-819x1024.jpg`, ext: "jpg" },
  { slug: "naomi-conze", src: `${base}/16-819x1024.webp`, ext: "webp" },
  { slug: "lucy-guendel", src: `${base}/15-819x1024.webp`, ext: "webp" },
  { slug: "moana-thelemann", src: `${base}/10-819x1024.jpg`, ext: "jpg" },
  { slug: "nomi-in-de-braekt", src: `${base}/8-819x1024.webp`, ext: "webp" },
  { slug: "laura-penzes", src: `${base}/6-819x1024.jpg`, ext: "jpg" },
  { slug: "anouk-nieuwenweg", src: `${base}/5-819x1024.jpg`, ext: "jpg" },
  { slug: "leoni-bassiner", src: `${base}/3-819x1024.webp`, ext: "webp" },
  { slug: "anais-gouveia", src: `${base}/14-819x1024.webp`, ext: "webp" },
  { slug: "michelle-stefes", src: `${base}/12-819x1024.webp`, ext: "webp" },
  { slug: "britt-van-der-baan", src: `${base}/9-819x1024.jpg`, ext: "jpg" },
  { slug: "alissa-werle", src: `${base}/4-819x1024.jpg`, ext: "jpg" },
  { slug: "angela-cappellaro", src: `${base}/11-819x1024.webp`, ext: "webp" },
  { slug: "jonna-schaube", src: `${base}/7-819x1024.webp`, ext: "webp" },
  { slug: "susann-mueller", src: `${base}/1-819x1024.webp`, ext: "webp" },
  { slug: "nina-mueller", src: `${base}/2-819x1024.webp`, ext: "webp" },
  { slug: "britta-lorenz", src: `${base}/18-819x1024.webp`, ext: "webp" },
  { slug: "stephan-grupe", src: `${base}/19-819x1024.webp`, ext: "webp" },
];

for (const item of downloads) {
  const dest = path.join(outDir, `${item.slug}.${item.ext}`);
  console.log("GET", item.src, "->", path.basename(dest));
  execFileSync("curl.exe", ["-sL", item.src, "-o", dest], { stdio: "inherit" });
  const size = fs.statSync(dest).size;
  if (size < 1000) throw new Error(`Download failed for ${item.slug}: ${size} bytes`);
}

fs.writeFileSync(
  path.join(outDir, "README.md"),
  `# Team-Fotos\n\nDateinamen = SEO-Slugs der Personen (nicht die Original-Nummern der alten Website).\nQuelle: fuechseberlinfrauen.de/team/\n`,
);

console.log("Done", downloads.length);
