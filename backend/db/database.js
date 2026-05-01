const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "eldiven.json");

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ gloves: [], scrape_log: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getAll() {
  return load().gloves;
}

function upsert(glove) {
  const data = load();
  const idx = data.gloves.findIndex((g) => g.product_url === glove.product_url);
  const entry = { ...glove, id: idx >= 0 ? data.gloves[idx].id : data.gloves.length + 1, scraped_at: new Date().toISOString() };
  if (idx >= 0) {
    data.gloves[idx] = entry;
  } else {
    data.gloves.push(entry);
  }
  save(data);
}

function addScrapeLog(log) {
  const data = load();
  data.scrape_log.push({ id: data.scrape_log.length + 1, ...log });
  save(data);
}

function getLastScrapeLog() {
  const data = load();
  return data.scrape_log[data.scrape_log.length - 1] || null;
}

module.exports = { getAll, upsert, addScrapeLog, getLastScrapeLog };
