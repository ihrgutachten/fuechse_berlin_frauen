import fs from "fs";
import path from "path";

const root = path.resolve("src/data");
const outDir = path.join(root, "sponsor-profiles");
const sponsors = JSON.parse(fs.readFileSync(path.join(root, "sponsors.json"), "utf8"));
const extract = JSON.parse(fs.readFileSync(path.join(outDir, "_extract.json"), "utf8"));
const extractById = Object.fromEntries(extract.filter((e) => e.id).map((e) => [e.id, e]));

const KEEP = new Set(["malermeister-rewolinski", "ortho-ped"]);

/** Extra facts taken from the public sites (title, meta, imprint snippets). */
const CURATED = {
  "kieback-peter": {
    who: "Kieback&Peter ist Experte für Gebäudeautomation. Das Unternehmen verbindet intelligente Gebäudetechnik, datenbasierte Services und nachhaltige Lösungen.",
    services: ["Gebäudeautomation", "Gebäudetechnik", "Nachhaltigkeit"],
  },
  "my-jump": {
    who: "MYJUMP ist ein Trampolinpark für Kinder und Erwachsene. Standorte gibt es unter anderem in Berlin-Mitte, Berlin-Ost, Erfurt, Frankfurt (Oder) und Lübeck.",
    services: ["Trampolinpark", "Open Jump", "Kindergeburtstage"],
  },
  "spielbank-berlin": {
    who: "Die Spielbank Berlin betreibt Casinos in der Stadt, unter anderem am Potsdamer Platz, am Fernsehturm, am Ku'damm und in der Ellipse Spandau.",
    services: ["Casino", "Entertainment"],
    phone: "+49 30 255990",
    email: "info@spielbank-berlin.de",
  },
  "gh-payment": {
    who: "GH Payment ist regionaler Anbieter für POS-Terminals, E-Commerce-Zahlungen und Kassensysteme, mit Vertrieb unter anderem in Berlin.",
    services: ["Kartenterminals", "E-Payment", "Kassensysteme"],
    phone: "+49 30 340603270",
    email: "info@gh-payment.de",
  },
  "bett1": {
    who: "bett1 verkauft Matratzen und Bettwaren. Der Shop nennt einen Standort in der Tauentzienstraße 11 in Berlin.",
    services: ["Matratzen", "Bettwaren"],
    address: "Tauentzienstr. 11, 10789 Berlin",
    phone: "+49 30 767317272",
  },
  "rdi": {
    who: "Die rdi Ingenieurgesellschaft begleitet private und institutionelle Bauherren, Projektentwickler und Investoren von der ersten Idee bis zur Übergabe. Schwerpunkt ist Projektsteuerung für anspruchsvolle Bauprojekte.",
    services: ["Projektsteuerung", "Projektentwicklung", "Generalplanung"],
    phone: "+49 30 817254100",
    email: "info@rdi-ing.de",
  },
  "techno-care": {
    who: "Technocare übersetzt Gebäude in Technik: Haustechnik und technische Systeme, die im Hintergrund funktionieren sollen.",
    services: ["Haustechnik", "Technische Gebäudeausrüstung"],
    email: "kontakt@technocare.de",
  },
  "auto-koch": {
    who: "Autos kauft man bei Koch: Neuwagen, Gebrauchtwagen und Werkstatt in Berlin und Brandenburg, unter anderem für Škoda, Seat, Cupra, Mazda, Volvo, Polestar und VW.",
    services: ["Autohaus", "Werkstatt", "Gebrauchtwagen"],
    phone: "+49 30 5499880",
  },
  "enwego": {
    who: "enwego plant und baut Energielösungen für Häuser: Solaranlagen, Stromspeicher, Heizungen und Elektroinstallation.",
    services: ["Photovoltaik", "Stromspeicher", "Heizung"],
    phone: "0351 89881544",
  },
  "der-hollaender": {
    who: "Der Holländer ist ein Pflanzencenter in Berlin. Gartenwelt, Pflanzen und Beratung, mit Standort an der Trakehner Allee.",
    services: ["Pflanzen", "Gartenwelt"],
    address: "Trakehner Allee 1a, 14053 Berlin",
    phone: "030 30090740",
    email: "info@der-hollaender.de",
  },
  "urban-clean": {
    who: "Urban Clean ist Partner für gewerbliche Reinigung in Berlin, von Unterhalt und Glas bis Fassade, Bau- und Industriereinigung.",
    services: ["Gebäudereinigung", "Glasreinigung", "Unterhaltsreinigung"],
    phone: "+49 30 75439973",
    email: "info@urban-clean.de",
  },
  "novus-print": {
    who: "novusPrint ist seit über 20 Jahren auf dem Berliner Markt. Digital- und Offsetdruck, Mailings, Großformat und Werbetechnik, Versand in Deutschland und Europa.",
    services: ["Digitaldruck", "Offsetdruck", "Werbetechnik"],
  },
  "cosy-wasch": {
    who: "COSY-WASCH wäscht Autos in Berlin seit 1966. Der Betrieb betont pflegende Wäsche, SB-Bereich und mehrere Standorte.",
    services: ["Autowäsche", "SB-Wäsche"],
    email: "info@cosy-wasch.de",
  },
  "bootsliegeplaetze-strauss-mette": {
    who: "Bootsliegeplätze Strauß/Mette ist ein Liegeplatzbetrieb in Berlin. Öffentliche Angaben stammen vom Google-Maps-Eintrag, eine eigene Website liegt nicht vor.",
    services: ["Bootsliegeplätze"],
    address: "Bootsliegeplätze Strauß/Mette, Berlin",
  },
  "brandschutzzeichenservice": {
    who: "Brandschutzzeichen Service erstellt normgerechte Pläne und Laufkarten für den abwehrenden Brandschutz, darunter Feuerwehrpläne sowie Flucht- und Rettungswegpläne.",
    services: ["Feuerwehrpläne", "Rettungswegpläne"],
    phone: "+49 5105 5200796",
    email: "thomas.platzek@brandschutzzeichenservice.de",
  },
  "grupe-immobilien": {
    who: "Grupe Immobilien ist als Immobilienmakler tätig. Die Website liefert ohne JavaScript keine weiteren öffentlichen Angaben.",
    services: ["Immobilienmakler"],
  },
  "ndc": {
    who: "Die Nippon Development Corporation (NDC) entwickelt und baut in Berlin und Potsdam, mit Fokus auf Hotels, Büro, Verwaltung und Wohnimmobilien.",
    services: ["Projektentwicklung", "Bauträger"],
    phone: "030 32301540",
  },
  "dau-transporte": {
    who: "Dau Transporte ist ein inhabergeführtes Unternehmen für Futtermitteltransport und Heimtierfutterverkauf.",
    services: ["Futtermitteltransport", "Heimtierfutter"],
    phone: "03391 503808",
    email: "info@dau-transporte.de",
  },
  "park-plaza-berlin": {
    who: "Das Park Plaza Berlin in Charlottenburg ist Hotel, Ausgangspunkt für Städtetrips und Veranstaltungsort, mit Restaurant, Bar, Tagung und Fitness.",
    services: ["Hotel", "Tagungen", "Restaurant"],
  },
  "flash-security": {
    who: "flash-security ist Sicherheitsdienst in Berlin und wirbt mit integrierten Sicherheitslösungen für die Stadt.",
    services: ["Sicherheitsdienst", "Objektschutz"],
    address: "Regattastraße 189, 12527 Berlin",
    phone: "+49 30 3229521558",
    email: "office@flash-security.de",
  },
  "boehnke-hr-consulting": {
    who: "Böhnke HR Consulting bietet HR-Beratung, Interim Management und Personalvermittlung, mit Sitz in Berlin-Adlershof.",
    services: ["HR-Beratung", "Interim Management", "Personalvermittlung"],
    address: "Louis-Bleriot-Straße 5, 12487 Berlin",
    phone: "+49 30 67896741",
  },
  "vitamin-well": {
    who: "Vitamin Well vertreibt funktionelle, kalorienarme Getränke. Die deutsche Seite ist Shop und Markenauftritt.",
    services: ["Functional Drinks"],
  },
  "pink-frauenfitness": {
    who: "Pink Frauen Fitness ist ein Fitnessstudio nur für Frauen in Berlin-Mitte, mit Geräten, Kursen und Sauna.",
    services: ["Fitnessstudio", "Kurse", "Sauna"],
  },
  "stahlhandel-peters": {
    who: "Stahlhandel Peters handelt mit Nutzeisen, Metallen und Stahlbau. Der Betrieb nennt 1927 als Gründungsjahr.",
    services: ["Stahlhandel", "Stahlbau"],
    email: "petersstahl@t-online.de",
  },
  "servisa": {
    who: "Die SERVISA Gruppe arbeitet in Baumanagement und Log Services und stellt sich als Unternehmensgruppe mit Projekten in Berlin vor.",
    services: ["Baumanagement", "Logistikservices"],
    phone: "+49 30 56555560",
  },
  "rudolph-parkett": {
    who: "Aug. Wilh. Rudolph ist Parkettlegermeister in Berlin. Parkett verlegen, reparieren und restaurieren, auch im Denkmalschutz.",
    services: ["Parkettverlegung", "Parkettreparatur"],
    address: "Eresburgstraße 24-29, 12103 Berlin",
    phone: "+49 30 7912438",
  },
  "hanebutt": {
    who: "Hanebutt ist Dachdeckerbetrieb mit mehreren Standorten. Das Unternehmen betont Handwerk, Familie und soziales Engagement.",
    services: ["Dachdecker", "Dachsanierung"],
    phone: "+49 5032 952140",
    email: "info@hanebutt.de",
  },
  "curry-36": {
    who: "CURRY 36 ist Berliner Currywurst, mit Standorten unter anderem am Mehringdamm, Zoo, Hauptbahnhof und Warschauer Straße.",
    services: ["Currywurst", "Imbiss"],
    email: "info@curry36.de",
  },
  "youth-globe": {
    who: "Youth Globe bietet Seminare, Events und Clubs zur persönlichen Entwicklung, beruflich und privat.",
    services: ["Seminare", "Events"],
    email: "tobias.haufe@youth-globe.com",
  },
  "stanhope": {
    who: "STANHOPE Rechtsanwälte ist eine Kanzlei. Die Website stellt das Team, das Produkt und den Blog vor.",
    services: ["Rechtsberatung"],
  },
  "fcm-it": {
    who: "FCM IT liefert IT-Lösungen aus einer Hand, mit Fokus auf Medizin, Industrie und Mittelstand.",
    services: ["IT-Betreuung", "IT-Sicherheit"],
    phone: "+49 30 86320780",
    email: "info@fcm-it.de",
  },
  "frank-huepperling": {
    who: "Frank Hüpperling arbeitet in Projektmanagement, Projektentwicklung, Projektsteuerung und Baumanagement.",
    services: ["Projektmanagement", "Baumanagement"],
    phone: "0170 4657140",
    email: "fh@frank-huepperling.de",
  },
  "huepperling-erlebnisse": {
    who: "Hüpperling Erlebnisse konzipiert Business-Events, Unternehmer-Reisen und Moderation.",
    services: ["Eventmanagement", "Moderation", "Reisen"],
    phone: "0170 4657140",
    email: "fh@huepperling-erlebnisse.de",
  },
  "darauf-einen-huepperling": {
    who: "Darauf einen Hüpperling ist eine Vodkamarke. Die Website ist altersbeschränkt und richtet sich an Erwachsene.",
    services: ["Spirituosen"],
  },
  "huepperling-books": {
    who: "Hüpperling Books bringt Unternehmer-Geschichten als Print oder E-Book zwischen zwei Deckel: Biografie, Fachbuch, eigene Vision.",
    services: ["Buchproduktion", "Biografien"],
    phone: "0170 4657140",
    email: "fh@huepperling-books.de",
  },
  "baugrund-ing": {
    who: "baugrund-ing ist Partner für geotechnische Untersuchungen und Gründungsberatung: Untergrund, Wasserhaltung, Eignung des Bodens.",
    services: ["Geotechnik", "Gründungsberatung"],
    email: "buero@baugrund-ing.de",
  },
  "ihr-gutachten": {
    who: "ihr-gutachten.com ist Kfz-Gutachter in Berlin, seit 2013, mit Standorten in mehreren Bezirken.",
    services: ["Kfz-Gutachten", "Unfallgutachten"],
    phone: "030 57711700",
  },
  "apotheke-heiligensee": {
    who: "Die Apotheke am Markt in Berlin-Heiligensee ist Vor-Ort-Apotheke für E-Rezepte, Beratung und Service.",
    services: ["Apotheke", "E-Rezept", "Beratung"],
    address: "Bekassinenweg 18, 13503 Berlin-Heiligensee",
    phone: "030 4311247",
    email: "apotheke-heiligensee@t-online.de",
  },
  "schilkin": {
    who: "SCHILKIN ist Berliner Spirituosenhersteller, bekannt für Berliner Luft, den Pfefferminzlikör, sowie Vodka und Berliner Spezialitäten.",
    services: ["Spirituosen", "Berliner Luft"],
    phone: "+49 30 565780",
  },
  "tts-office-support": {
    who: "TTS Office Support ist Büroservice in Berlin: virtuelle Assistenz, Telefonservice und Backoffice.",
    services: ["Virtuelle Assistenz", "Telefonservice", "Büroservice"],
    address: "Goerzallee 299, 14167 Berlin",
    phone: "030 8599460",
    email: "berlin@tts-office-support.de",
  },
  "technikhaus-guendel": {
    who: "Technikhaus Gündel arbeitet in Elektroinstallation, Sicherheitstechnik, Datennetzwerken und Photovoltaik.",
    services: ["Elektroinstallation", "Sicherheitstechnik", "Photovoltaik"],
    phone: "0391 7224305",
    email: "info@technikhaus-guendel.de",
  },
  "reisebuero-globus": {
    who: "Reisebüro Globus bietet Pauschal- und Individualreisen. Die Website war beim Abruf nicht erreichbar, der Steckbrief bleibt deshalb bewusst kurz.",
    services: ["Reisebüro", "Pauschalreisen"],
  },
  "koha": {
    who: "KoHa Bauausführungen und Immobilien GmbH arbeitet in Bauausführung, Projektentwicklung und Verwaltung.",
    services: ["Bauausführung", "Projektentwicklung", "Immobilienverwaltung"],
    email: "info@koha.ag",
  },
  "busybee-catering": {
    who: "Busy Bee Catering in Berlin macht Event-, Messe- und Veranstaltungsservice, von Fingerfood bis Buffet.",
    services: ["Event-Catering", "Messe-Catering"],
  },
  "adidas": {
    who: "adidas ist Sportartikelhersteller. Die Website hat den automatischen Abruf blockiert. Hier bleibt der Steckbrief deshalb auf die Rolle als Ausrüstungspartner beschränkt.",
    services: ["Sportartikel", "Ausrüstung"],
  },
  "proximed-physio": {
    who: "Proximed Physio ist Physiotherapie in Berlin, seit 2002 in Schöneberg, zusätzlich in Charlottenburg. Leistungen laut Website: Manuelle Therapie, Osteopathie, CMD, Sportphysiotherapie und Krankengymnastik.",
    services: ["Physiotherapie", "Osteopathie", "Sportphysiotherapie"],
  },
  "omnibus-schroeder": {
    who: "Schröder Reisen ist Busunternehmen für Reisebusse, Kleinbusse, Shuttle und Gruppenfahrten, mit Standortangabe Berlin.",
    services: ["Busvermietung", "Gruppenreisen"],
    phone: "+49 30 28620919",
    email: "info@omnibus-schroeder.de",
  },
  "spreeradio": {
    who: "Spreeradio ist Berliner Radiosender. Die Website versammelt Nachrichten, Musik und lokale Rubriken.",
    services: ["Radio", "Lokaljournalismus"],
  },
  "goerix": {
    who: "Die Görix, Versicherungsbüro Goerigk oHG in Berlin, vermittelt Versicherungen seit 1967, unter anderem über die Feuersozietät Berlin-Brandenburg.",
    services: ["Versicherungen"],
  },
  "derbystar": {
    who: "Derbystar vertreibt Sportbälle, darunter Handbälle. Die Marke ist HBF-Partner.",
    services: ["Handbälle", "Sportbälle"],
    phone: "+49 2823 3250",
    email: "shop@derbystar.de",
  },
  "alsco": {
    who: "Alsco vermietet Berufsbekleidung im Full-Service-Leasing für Handwerk, Industrie und Gastronomie. Alsco ist Namensgeber der ALSCO HBF.",
    services: ["Berufsbekleidung", "Textilservice"],
    phone: "0800 1889100",
  },
};

function camel(id) {
  return id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

const written = [];

for (const sponsor of sponsors) {
  if (KEEP.has(sponsor.id)) {
    written.push({
      importName: camel(sponsor.profileSlug),
      file: `${sponsor.profileSlug}.json`,
      slug: sponsor.profileSlug,
    });
    continue;
  }

  const extra = CURATED[sponsor.id] || {};
  const who =
    extra.who ||
    extractById[sponsor.id]?.description ||
    `${sponsor.name} ist ${sponsor.tierLabel} der Füchse Berlin Frauen.`;

  const address = extra.address || "";
  const phone = extra.phone || "";
  const email = extra.email || "";
  const locations = [];
  if (address || phone || email) {
    const loc = { name: extra.locationName || sponsor.name };
    if (address) loc.address = address;
    if (phone) loc.phone = phone;
    if (email) loc.email = email;
    locations.push(loc);
  }

  const profile = {
    slug: sponsor.id,
    sponsorId: sponsor.id,
    headline: sponsor.name,
    tagline: `${sponsor.tierLabel} der Füchse Berlin Frauen`,
    intro: `${sponsor.name} ist ${sponsor.tierLabel} der Füchse Berlin Frauen.`,
    sections: [{ title: "Wer seid ihr?", body: who }],
    images: [],
    services: extra.services || [],
    locations,
    website: sponsor.url,
    sourceNote:
      "Kurzprofil anhand der öffentlichen Website, Stand September 2026. Kein Interview.",
  };

  const file = `${sponsor.id}.json`;
  fs.writeFileSync(path.join(outDir, file), `${JSON.stringify(profile, null, 2)}\n`);
  written.push({ importName: camel(sponsor.id), file, slug: sponsor.id });
  sponsor.profileSlug = sponsor.id;
}

fs.writeFileSync(path.join(root, "sponsors.json"), `${JSON.stringify(sponsors, null, 2)}\n`);

const imports = written
  .map((w) => `import ${w.importName} from "./sponsor-profiles/${w.file}";`)
  .join("\n");
const list = written.map((w) => `  ${w.importName},`).join("\n");

fs.writeFileSync(
  path.join(root, "sponsor-profile-list.ts"),
  `${imports}

export const allSponsorProfiles = [
${list}
];
`,
);

console.log(`wrote ${written.length} profiles`);
