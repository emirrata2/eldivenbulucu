const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const CHEMICAL_NAME_MAP = {
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
  K: ["sodyum hidroksit", "naoh", "kostik", "caustic", "alkali"],
  L: ["sülfürik asit", "sulfuric acid", "h2so4"],
  M: ["nitrik asit", "nitric acid", "hno3"],
  N: ["asetik asit", "acetic acid", "sirke asidi"],
  O: ["amonyak", "ammonia", "nh3"],
  P: ["hidrojen peroksit", "hydrogen peroxide", "h2o2"],
  S: ["hidroflorik asit", "hydrofluoric acid", "hf"],
  T: ["formaldehit", "formaldehyde", "formalin"],
};

const MATERIAL_CHEMICAL_MAP = {
  nitril:    ["B", "K", "L", "M", "N", "O", "P"],
  neopren:   ["E", "F", "K", "L", "M", "N", "O"],
  lateks:    ["K", "N", "O"],
  latex:     ["K", "N", "O"],
  pvc:       ["A", "K", "L", "M", "N", "O"],
  polivinil: ["A", "K", "L", "M", "N", "O"],
  viton:     ["B", "D", "E", "F", "J", "K", "L", "M"],
  butil:     ["B", "C", "G", "H", "I", "K", "L", "M", "N", "O", "P", "T"],
  butyl:     ["B", "C", "G", "H", "I", "K", "L", "M", "N", "O", "P", "T"],
  kauçuk:    ["K", "N", "O"],
};

function detectChemicalsByMaterial(text) {
  const lower = text.toLowerCase();
  const codes = new Set();
  for (const [code, keywords] of Object.entries(CHEMICAL_NAME_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) codes.add(code);
  }
  for (const [material, materialCodes] of Object.entries(MATERIAL_CHEMICAL_MAP)) {
    if (lower.includes(material)) materialCodes.forEach((c) => codes.add(c));
  }
  return [...codes].sort();
}

async function fetchChemicalCodes(url) {
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });
    const $ = cheerio.load(res.data);
    const text = $("body").text();
    const match = text.match(/374[^(]{0,60}\(([A-T]{2,})\)/i);
    if (match) return [...match[1]].sort();
  } catch (e) {
    // ignore
  }
  return null;
}

async function run() {
  const dbPath = path.join(__dirname, "db/eldiven.json");
  const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  let fromEN374 = 0, fromMaterial = 0;

  for (let i = 0; i < data.gloves.length; i++) {
    const g = data.gloves[i];
    const text = `${g.name || ""} ${g.description || ""}`;

    // Önce sayfadan EN374 kodu çekmeyi dene
    const codes = await fetchChemicalCodes(g.product_url);
    if (codes && codes.length > 0) {
      data.gloves[i] = { ...g, chemical_codes: codes };
      fromEN374++;
    } else {
      data.gloves[i] = { ...g, chemical_codes: detectChemicalsByMaterial(text) };
      fromMaterial++;
    }

    if ((i + 1) % 10 === 0) {
      process.stdout.write(`\r${i + 1}/${data.gloves.length} işlendi...`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  console.log(`\nTamamlandı: ${fromEN374} ürün EN374 sayfasından, ${fromMaterial} ürün malzeme bazlı.`);
}

run().catch(console.error);
