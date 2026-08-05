import fs from "fs";
import path from "path";
import os from "os";

const htmlPath = path.join(os.tmpdir(), "fuechse-team.html");
const html = fs.readFileSync(htmlPath, "utf8");

const imgRe =
  /src="(https:\/\/fuechseberlinfrauen\.de\/wp-content\/uploads\/2026\/08\/[^"]+)"/g;
const imgs = [...html.matchAll(imgRe)].map((m) => m[1]);
console.log("IMGS", imgs.length);
imgs.forEach((u, i) => console.log(i, u));

const altRe =
  /alt="([^"]+)"[^>]*src="(https:\/\/fuechseberlinfrauen\.de\/wp-content\/uploads\/2026\/08\/[^"]+)"|src="(https:\/\/fuechseberlinfrauen\.de\/wp-content\/uploads\/2026\/08\/[^"]+)"[^>]*alt="([^"]+)"/g;
let m;
while ((m = altRe.exec(html))) {
  console.log("ALT", m[1] || m[4], "=>", m[2] || m[3]);
}

const names = [
  "Danique Trooster",
  "Zoe Ludwig",
  "Naomi Conze",
  "Lucy Gündel",
  "Moana Thelemann",
  "Nomi in de braekt",
  "Laura Penzes",
  "Anouk Nieuwenweg",
  "Leoni Baßiner",
  "Anaïs Gouveia",
  "Michelle Stefes",
  "Britt van der Baan",
  "Alissa Werle",
  "Angela Cappellaro",
  "Jonna Schaube",
  "Susann Müller",
  "Nina Müller",
  "Britta Lorenz",
  "Stephan Grupe",
];

for (const name of names) {
  const idx = html.indexOf(name);
  if (idx < 0) {
    console.log("MISSING", name);
    continue;
  }
  const slice = html.slice(Math.max(0, idx - 1200), idx + 500);
  const localImgs = [...slice.matchAll(/uploads\/2026\/08\/([^"'\s]+)/g)].map(
    (x) => x[1],
  );
  console.log("---", name, "imgsNear:", [...new Set(localImgs)].join(", "));
}
