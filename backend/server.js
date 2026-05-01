const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { runScraper } = require("./scraper/scraper");
const glovesRouter = require("./routes/gloves");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/gloves", glovesRouter);

app.get("/api/status", (req, res) => {
  const db = require("./db/database");
  const count = db.prepare("SELECT COUNT(*) as count FROM gloves").get().count;
  const last = db.prepare("SELECT * FROM scrape_log ORDER BY id DESC LIMIT 1").get();
  res.json({ total_gloves: count, last_scrape: last || null });
});

// Her gece 02:00'de scraping
cron.schedule("0 2 * * *", () => {
  console.log("Zamanlanmış scraping başladı...");
  runScraper().catch(console.error);
});

app.listen(PORT, () => {
  console.log(`Backend çalışıyor: http://localhost:${PORT}`);
  console.log(`İlk veri için: npm run scrape`);
});
