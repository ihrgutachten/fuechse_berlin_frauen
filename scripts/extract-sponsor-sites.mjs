import fs from "fs";
import path from "path";

const root = path.resolve("src/data");
const sponsors = JSON.parse(fs.readFileSync(path.join(root, "sponsors.json"), "utf8"));
const SKIP_FETCH = new Set(["malermeister-rewolinski", "ortho-ped"]);

function decode(html) {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function strip(html) {
  return decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function meta(html, names) {
  for (const name of names) {
    const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`, "i");
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:name|property)=["']${name}["']`, "i");
    const m = html.match(re) || html.match(re2);
    if (m?.[1]) return decode(m[1]).replace(/\s+/g, " ").trim();
  }
  return "";
}

function firstEmail(text) {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0].toLowerCase() : "";
}

function firstPhone(text) {
  const m = text.match(/(?:\+49|0)[\d\s\/()-]{8,18}\d/);
  return m ? m[0].replace(/\s+/g, " ").trim() : "";
}

function jsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const found = [];
  for (const b of blocks) {
    try {
      const data = JSON.parse(b[1]);
      found.push(...(Array.isArray(data) ? data : [data]));
    } catch {
      /* ignore */
    }
  }
  return found;
}

function fromLd(items) {
  const out = { address: "", phone: "", email: "", description: "" };
  const walk = (obj) => {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    if (obj.email && !out.email) out.email = String(obj.email).replace(/^mailto:/i, "");
    if (obj.telephone && !out.phone) out.phone = String(obj.telephone);
    if (obj.description && !out.description) out.description = String(obj.description);
    const a = obj.address;
    if (a && typeof a === "object" && !out.address) {
      const parts = [a.streetAddress, a.postalCode, a.addressLocality, a.addressRegion].filter(Boolean);
      if (parts.length) out.address = parts.join(", ");
    } else if (typeof a === "string" && !out.address) out.address = a;
    walk(obj["@graph"]);
  };
  items.forEach(walk);
  return out;
}

async function fetchSite(url) {
  if (/google\.com\/maps/i.test(url)) {
    return { ok: false, status: 0, html: "", note: "maps" };
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    const html = await res.text();
    return { ok: res.ok, status: res.status, html, finalUrl: res.url };
  } catch (err) {
    return { ok: false, status: 0, html: "", note: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(t);
  }
}

const results = [];
for (const s of sponsors) {
  if (SKIP_FETCH.has(s.id)) {
    results.push({ id: s.id, skipped: true });
    continue;
  }
  process.stdout.write(`fetch ${s.id} ... `);
  const got = await fetchSite(s.url);
  const html = got.html || "";
  const text = strip(html).slice(0, 8000);
  const ld = fromLd(jsonLd(html));
  const description =
    meta(html, ["description", "og:description", "twitter:description"]) ||
    ld.description.slice(0, 400);
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]
    ? strip(RegExp.$1 || (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1])
    : "";
  const email = ld.email || firstEmail(html) || firstEmail(text);
  const phone = ld.phone || firstPhone(text);
  results.push({
    id: s.id,
    name: s.name,
    url: s.url,
    status: got.status,
    note: got.note || "",
    title: strip(title).slice(0, 160),
    description: description.slice(0, 500),
    address: ld.address.slice(0, 200),
    phone: phone.slice(0, 40),
    email: email.slice(0, 80),
    snippet: text.slice(0, 400),
  });
  console.log(got.status || got.note || "fail");
}

fs.writeFileSync(path.join(root, "sponsor-profiles/_extract.json"), JSON.stringify(results, null, 2));
console.log("wrote extract", results.length);
