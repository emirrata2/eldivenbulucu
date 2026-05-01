const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../db/database");

const BASE_URL = "https://www.ehilis.com";

const CATEGORIES = [
  { name: "Kesilme Dirençli", url: "/urun-kategori/el-koruyucular-is-eldivenleri/kesilme-direncli-eldivenler/" },
  { name: "Kimyasal", url: "/urun-kategori/el-koruyucular-is-eldivenleri/kimyasal-eldivenler/" },
  { name: "Nitril", url: "/urun-kategori/el-koruyucular-is-eldivenleri/nitril-eldivenler/" },
  { name: "Köpük Nitril", url: "/urun-kategori/el-koruyucular-is-eldivenleri/kopuk-nitril-eldivenler/" },
  { name: "PU Eldivenler", url: "/urun-kategori/el-koruyucular-is-eldivenleri/pu-eldivenler/" },
  { name: "Kauçuk", url: "/urun-kategori/el-koruyucular-is-eldivenleri/kaucuk-eldivenler/" },
  { name: "Isı ve Kaynak", url: "/urun-kategori/el-koruyucular-is-eldivenleri/isi-ve-kaynak-eldiveni/" },
  { name: "Gıdaya Uygun", url: "/urun-kategori/el-koruyucular-is-eldivenleri/gidaya-uygun-eldivenler/" },
  { name: "Temizlik", url: "/urun-kategori/el-koruyucular-is-eldivenleri/temizlik-eldivenleri/" },
  { name: "Özel Amaçlı", url: "/urun-kategori/el-koruyucular-is-eldivenleri/ozel-amacli-eldivenler-ve-aksesuarlar/" },
  { name: "LALAN", url: "/urun-kategori/el-koruyucular-is-eldivenleri/lalan/" },
  { name: "Prokotek", url: "/urun-kategori/el-koruyucular-is-eldivenleri/prokotek/" },
];

const CHEMICAL_MAP = {
  A: ["metanol", "methanol"],
  B: ["aseton", "acetone"],
  C: ["asetonitril", "acetonitrile"],
  D: ["diklorometan", "dichloromethane", "metilen klorür"],
  E: ["karbon disülfür", "carbon disulfide"],
  F: ["toluen", "toluene"],
  G: ["dietilamin", "diethylamine"],
  H: ["tetrahidrofuran", "thf", "tetrahydrofuran"],
  I: ["etil asetat", "ethyl acetate"],
  J: ["heptan", "n-heptan"],
  K: ["sodyum hidroksit", "naoh", "kostik", "caustic", "baz", "alkali"],
  L: ["sülfürik asit", "sulfuric acid", "h2so4"],
  M: ["nitrik asit", "nitric acid", "hno3"],
  N: ["asetik asit", "acetic acid", "sirke asidi"],
  O: ["amonyak", "ammonia", "nh3"],
  P: ["hidrojen peroksit", "hydrogen peroxide", "h2o2"],
  S: ["hidroflorik asit", "hydrofluoric acid", "hf"],
  T: ["formaldehit", "formaldehyde", "formalin"],
};

function detectChemicals(text) {
  const lower = text.toLowerCase();
  const codes = [];
  for (const [code, keywords] of Object.entries(CHEMICAL_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) codes.push(code);
  }
  return codes;
}

const FEATURE_KEYWORDS = {
  is_cut_resistant:      ["kesil", "kesilme", "cut resistant", "dilim"],
  is_chemical_resistant: ["kimyasal", "chemical", "asit", "baz", "solvent"],
  is_puncture_resistant: ["delin", "puncture", "iğne", "çivi"],
  is_cold_resistant:     ["soğuk", "cold", "düşük ısı", "don"],
  is_heat_resistant:     ["ısı", "kaynak", "yüksek ısı", "heat", "alev", "fire"],
  is_antistatic:         ["antistatik", "antistatic", "esd", "statik", "elektrostatik"],
  is_waterproof:         ["su geçirmez", "waterproof", "suya dayanıklı"],
  is_food_safe:          ["gıda", "food", "gıdaya uygun"],
};

function detectFeatures(text) {
  const lower = text.toLowerCase();
  const features = {};
  for (const [key, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    features[key] = keywords.some((kw) => lower.includes(kw));
  }
  return features;
}

async function fetchPage(url) {
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      timeout: 15000,
    });
    return cheerio.load(res.data);
  } catch (e) {
    console.error(`Sayfa alınamadı: ${url} - ${e.message}`);
    return null;
  }
}

async function scrapeProductUrls(categoryUrl) {
  const urls = [];
  let page = 1;

  while (true) {
    const pageUrl = page === 1
      ? `${BASE_URL}${categoryUrl}`
      : `${BASE_URL}${categoryUrl}page/${page}/`;

    const $ = await fetchPage(pageUrl);
    if (!$) break;

    const found = [];
    $("a[href*='/urun/']").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.includes("/urun/") && !href.endsWith("/urun/")) {
        found.push(href);
      }
    });

    const unique = [...new Set(found)].filter((u) => !urls.includes(u));
    if (unique.length === 0) break;
    urls.push(...unique);
    page++;
  }

  return urls;
}

async function scrapeProduct(url, subcategory) {
  const $ = await fetchPage(url);
  if (!$) return null;

  const name = $("h1.product_title").first().text().trim() ||
               $(".product_title").first().text().trim();
  if (!name) return null;

  const description = $(
    ".woocommerce-product-details__short-description, #tab-description, .product-description"
  ).first().text().trim().slice(0, 600);

  const imgEl = $(".woocommerce-product-gallery__image img").first();
  const rawSrc = imgEl.attr("src") || "";
  const image_url =
    imgEl.attr("data-src") ||
    imgEl.attr("data-large_image") ||
    (!rawSrc.startsWith("data:") ? rawSrc : "") ||
    $("img.wp-post-image").first().attr("data-src") ||
    (!($("img.wp-post-image").first().attr("src") || "").startsWith("data:") ? $("img.wp-post-image").first().attr("src") : "") ||
    "";

  const en_standard = (description.match(/EN\s*\d{3,4}[:\s\d]*/i) || [])[0]?.trim() || "";

  const fullText = `${name} ${description} ${subcategory}`;
  const features = detectFeatures(fullText);
  const chemical_codes = detectChemicals(fullText);

  // Kategori bazlı zorla özellik atama
  if (subcategory === "Kesilme Dirençli") features.is_cut_resistant = true;
  if (subcategory === "Kimyasal")         features.is_chemical_resistant = true;
  if (subcategory === "Isı ve Kaynak")    features.is_heat_resistant = true;
  if (subcategory === "Gıdaya Uygun")     features.is_food_safe = true;

  const brandGuess = name.split(" ")[0] || "";

  return {
    name,
    brand: brandGuess,
    category: "El Koruyucular",
    subcategory,
    image_url,
    product_url: url,
    description,
    en_standard,
    chemical_codes,
    ...features,
  };
}

async function runScraper() {
  console.log("Scraping başladı...");
  const startedAt = new Date().toISOString();
  let total = 0;

  for (const cat of CATEGORIES) {
    console.log(`\nKategori: ${cat.name}`);
    const productUrls = await scrapeProductUrls(cat.url);
    console.log(`  ${productUrls.length} ürün URL'si bulundu`);

    for (const url of productUrls) {
      const product = await scrapeProduct(url, cat.name);
      if (product) {
        db.upsert(product);
        total++;
        process.stdout.write(".");
      }
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  db.addScrapeLog({ started_at: startedAt, finished_at: new Date().toISOString(), total_scraped: total, status: "success" });
  console.log(`\n\nScraping tamamlandı. Toplam: ${total} ürün`);
}

module.exports = { runScraper };

if (require.main === module) {
  runScraper().catch(console.error);
}
