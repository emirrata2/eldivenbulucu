const fs = require("fs");
const path = require("path");

// Doğrudan kimyasal isim eşleşmesi
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

// Eldiven malzemesine göre bilinen kimyasal direnç profilleri (EN374 bazlı)
const MATERIAL_CHEMICAL_MAP = {
  nitril:   ["B", "K", "L", "M", "N", "O", "P"],
  neopren:  ["E", "F", "K", "L", "M", "N", "O"],
  lateks:   ["K", "N", "O"],
  latex:    ["K", "N", "O"],
  pvc:      ["A", "K", "L", "M", "N", "O"],
  "polivinil": ["A", "K", "L", "M", "N", "O"],
  viton:    ["B", "D", "E", "F", "J", "K", "L", "M"],
  butyl:    ["B", "C", "G", "H", "I", "K", "L", "M", "N", "O", "P", "T"],
  "butil":  ["B", "C", "G", "H", "I", "K", "L", "M", "N", "O", "P", "T"],
  kauçuk:   ["K", "N", "O"],
  neoprene: ["E", "F", "K", "L", "M", "N", "O"],
};

function detectChemicals(text) {
  const lower = text.toLowerCase();
  const codes = new Set();

  // Doğrudan kimyasal isimlerden tespit
  for (const [code, keywords] of Object.entries(CHEMICAL_NAME_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) codes.add(code);
  }

  // Malzeme bazlı çıkarım
  for (const [material, materialCodes] of Object.entries(MATERIAL_CHEMICAL_MAP)) {
    if (lower.includes(material)) {
      materialCodes.forEach((c) => codes.add(c));
    }
  }

  return [...codes].sort();
}

const dbPath = path.join(__dirname, "db/eldiven.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

let updated = 0;
data.gloves = data.gloves.map((g) => {
  const chemical_codes = detectChemicals(`${g.name || ""} ${g.description || ""}`);
  if (chemical_codes.length > 0) updated++;
  return { ...g, chemical_codes };
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log(`Migration tamamlandı. ${data.gloves.length} ürün işlendi, ${updated} ürüne kimyasal kodu eklendi.`);
