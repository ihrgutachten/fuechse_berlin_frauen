import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "sponsors");
fs.mkdirSync(outDir, { recursive: true });

/** @typedef {{ tier: string, tierLabel: string, slug: string, name: string, url: string, src: string }} SponsorDef */

/** @type {SponsorDef[]} */
const sponsors = [
  // Platin
  {
    tier: "platin",
    tierLabel: "Platin Partner",
    slug: "kieback-peter",
    name: "Kieback&Peter",
    url: "https://www.kieback-peter.com/de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-24-25-1.jpg",
  },
  // Gold
  {
    tier: "gold",
    tierLabel: "Gold Partner",
    slug: "my-jump",
    name: "My Jump",
    url: "https://myjump.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-my-jump-768x768-1.jpg",
  },
  {
    tier: "gold",
    tierLabel: "Gold Partner",
    slug: "spielbank-berlin",
    name: "Spielbank Berlin",
    url: "https://www.spielbank-berlin.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-spielebank-berlin-768x768-1.jpg",
  },
  {
    tier: "gold",
    tierLabel: "Gold Partner",
    slug: "gh-payment",
    name: "GH Payment",
    url: "https://gh-payment.de",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2026/07/GH-Payment-Logo768x768.jpg",
  },
  // Silber
  {
    tier: "silber",
    tierLabel: "Silber Partner",
    slug: "bett1",
    name: "bett1",
    url: "https://www.bett1.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-23-768x768-1.jpg",
  },
  {
    tier: "silber",
    tierLabel: "Silber Partner",
    slug: "rdi",
    name: "RDI",
    url: "https://www.rdi-ing.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-rode-768x768-1.jpg",
  },
  {
    tier: "silber",
    tierLabel: "Silber Partner",
    slug: "techno-care",
    name: "Techno Care",
    url: "http://www.technocare.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-techno-care-768x768-1.jpg",
  },
  {
    tier: "silber",
    tierLabel: "Silber Partner",
    slug: "auto-koch",
    name: "Auto Koch",
    url: "https://autoskauftmanbeikoch.de",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2026/07/Design-ohne-Titel.jpg",
  },
  {
    tier: "silber",
    tierLabel: "Silber Partner",
    slug: "enwego",
    name: "Enwego",
    url: "https://www.enwego.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-24-25-15-768x768-1.jpg",
  },
  // Premium
  {
    tier: "premium",
    tierLabel: "Premium Partner",
    slug: "der-hollaender",
    name: "Der Holländer",
    url: "https://www.der-hollaender.de/de-de",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsoren-3-768x768-1.jpg",
  },
  {
    tier: "premium",
    tierLabel: "Premium Partner",
    slug: "urban-clean",
    name: "Urban Clean",
    url: "https://urban-clean.de",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2026/07/Design-ohne-Titel-6.jpg",
  },
  {
    tier: "premium",
    tierLabel: "Premium Partner",
    slug: "novus-print",
    name: "Novus Print",
    url: "https://www.novus-print.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-novus-print-768x768-1.jpg",
  },
  {
    tier: "premium",
    tierLabel: "Premium Partner",
    slug: "cosy-wasch",
    name: "Cosy Wasch",
    url: "https://www.cosy-wasch.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-24-25-10-768x768-1.jpg",
  },
  // Partner
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "bootsliegeplaetze-strauss-mette",
    name: "Bootsliegeplätze Strauß/Mette",
    url: "https://www.google.com/maps/place/Bootsliegepl%C3%A4tze+Strau%C3%9F%2FMette/@52.5067216,13.2129865,17z",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-24-25-5-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "brandschutzzeichenservice",
    name: "Brandschutzzeichenservice",
    url: "https://www.brandschutzzeichenservice.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-Brandschutzzeichenservice-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "grupe-immobilien",
    name: "Grupe Immobilien",
    url: "https://www.grupeimmobilien.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-grupe-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "ndc",
    name: "NDC",
    url: "https://www.n-d-c.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-24-25-11-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "dau-transporte",
    name: "Dau Transporte",
    url: "https://www.dau-transporte.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-Dau-Transporte-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "park-plaza-berlin",
    name: "Park Plaza Berlin",
    url: "https://parkplazaberlin.com/?lang=de",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/09/spreefuexxe-website-sponsoren-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "flash-security",
    name: "Flash Security",
    url: "https://flash-security.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-flash-security-GmbH-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "boehnke-hr-consulting",
    name: "Böhnke HR Consulting",
    url: "https://www.boehnke-hr-consult.com/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-HR-Consulting-Youth-Globe-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "malermeister-rewolinski",
    name: "Malermeister Rewolinski",
    url: "https://malermeister-rewolinski.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-Malermeister-Rewolinski-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "vitamin-well",
    name: "Vitamin Well",
    url: "https://vitaminwell.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-14-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "pink-frauenfitness",
    name: "Pink Frauenfitness",
    url: "https://www.pinkfrauenfitness.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-12-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "stahlhandel-peters",
    name: "Stahlhandel Peters",
    url: "https://www.stahlhandel-peters.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-Stahlhandel-Peters-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "servisa",
    name: "Servisa",
    url: "https://www.servisa-gruppe.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-Servisa-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "rudolph-parkett",
    name: "Rudolph Parkett",
    url: "https://rudolphparkett.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsoren-15-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "hanebutt",
    name: "Hanebutt",
    url: "https://www.hanebutt.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsoren-4-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "curry-36",
    name: "Curry 36",
    url: "https://curry36.de/de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsoren-17-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "youth-globe",
    name: "Youth Globe",
    url: "https://www.youth-globe.com/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-youth-globe-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "stanhope",
    name: "Stanhope",
    url: "https://thenextstanhope.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-Stanhope-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "fcm-it",
    name: "FCM IT",
    url: "https://fcm-it.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-24-25-14-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "frank-huepperling",
    name: "Frank Hüpperling",
    url: "https://frank-huepperling.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-8-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "huepperling-erlebnisse",
    name: "Hüpperling Erlebnisse",
    url: "https://huepperling-erlebnisse.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-9-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "darauf-einen-huepperling",
    name: "Darauf einen Hüpperling",
    url: "https://darauf-einen-huepperling.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-10-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "huepperling-books",
    name: "Hüpperling Books",
    url: "https://huepperling-books.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/09/spreefuexxe-website-sponsoren-4.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "baugrund-ing",
    name: "Baugrund Ing",
    url: "https://www.baugrund-ing.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-21-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "ihr-gutachten",
    name: "ihr-gutachten.com",
    url: "https://ihr-gutachten.com/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-20-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "apotheke-heiligensee",
    name: "Apotheke Heiligensee",
    url: "https://www.apotheke-heiligensee.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-26-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "schilkin",
    name: "Schilkin",
    url: "https://www.schilkin.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/09/spreefuexxe-website-sponsoren-3.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "tts-office-support",
    name: "TTS Office Support",
    url: "https://www.tts-office-support.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-5-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "technikhaus-guendel",
    name: "Technikhaus Gündel",
    url: "https://www.technikhaus-guendel.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-6-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "reisebuero-globus",
    name: "Reisebüro Globus",
    url: "https://www.reisebuero-globus.de/pauschalreisen-individualreisen.html",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-24-25-8-768x768-1.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "koha",
    name: "KOHA",
    url: "https://www.koha.ag/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/09/spreefuexxe-website-sponsoren-5.jpg",
  },
  {
    tier: "partner",
    tierLabel: "Partner",
    slug: "busybee-catering",
    name: "Busy Bee Catering",
    url: "http://www.busybee-catering.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/10/spreefuexxe-website-sponsoren-6.jpg",
  },
  // Ausrüstung
  {
    tier: "ausruestung",
    tierLabel: "Ausrüstungspartner",
    slug: "adidas",
    name: "adidas",
    url: "https://www.adidas.de",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2026/07/Design-ohne-Titel-4.jpg",
  },
  // Gesundheit
  {
    tier: "gesundheit",
    tierLabel: "Gesundheitspartner",
    slug: "ortho-ped",
    name: "Ortho-Ped",
    url: "https://www.ortho-ped.berlin/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-Ortho-Ped-768x768-1.jpg",
  },
  {
    tier: "gesundheit",
    tierLabel: "Gesundheitspartner",
    slug: "proximed-physio",
    name: "Proximed Physio",
    url: "https://proximed-physio.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-24-25-4-768x768-1.jpg",
  },
  // Mobil
  {
    tier: "mobil",
    tierLabel: "Mobilpartner",
    slug: "omnibus-schroeder",
    name: "Omnibus Schröder",
    url: "https://omnibus-schroeder.de/de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-11-768x768-1.jpg",
  },
  // Medien
  {
    tier: "medien",
    tierLabel: "Medienpartner",
    slug: "spreeradio",
    name: "94,0 RADIO SPREE",
    url: "https://www.spreeradio.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsoren-10-768x768-1.jpg",
  },
  // Versicherung
  {
    tier: "versicherung",
    tierLabel: "Versicherungspartner",
    slug: "goerix",
    name: "Goerix",
    url: "https://www.goerix.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-23-24-27-768x768-1.jpg",
  },
  // HBF
  {
    tier: "hbf",
    tierLabel: "HBF-Partner",
    slug: "derbystar",
    name: "Derbystar",
    url: "https://www.derbystar.de/pages/handballe",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/spreefuexxe-sponsor-select-300x300-1.jpg",
  },
  {
    tier: "hbf",
    tierLabel: "HBF-Partner",
    slug: "alsco",
    name: "Alsco",
    url: "https://www.alsco.de/",
    src: "https://fuechseberlinfrauen.de/wp-content/uploads/2025/08/Logos-25-26-1-300x300-1.jpg",
  },
];

const json = [];

for (const s of sponsors) {
  const ext = path.extname(new URL(s.src).pathname).toLowerCase() || ".jpg";
  const filename = `${s.slug}${ext}`;
  const dest = path.join(outDir, filename);
  console.log("GET", s.slug, "<-", path.basename(s.src));
  execFileSync("curl.exe", ["-sL", s.src, "-o", dest], { stdio: "inherit" });
  const size = fs.statSync(dest).size;
  if (size < 500) throw new Error(`Download failed for ${s.slug}: ${size} bytes`);

  json.push({
    id: s.slug,
    name: s.name,
    tier: s.tier,
    tierLabel: s.tierLabel,
    url: s.url,
    logo: `/sponsors/${filename}`,
  });
}

fs.writeFileSync(
  path.join(root, "src", "data", "sponsors.json"),
  JSON.stringify(json, null, 2) + "\n",
);

fs.writeFileSync(
  path.join(outDir, "README.md"),
  `# Sponsoren-Logos\n\nDateinamen = SEO-Slugs der Firmen (nicht die Original-Dateinamen der alten Website).\nQuelle: https://fuechseberlinfrauen.de/sponsoren/\n`,
);

console.log("Done", json.length, "sponsors");
