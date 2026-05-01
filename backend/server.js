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
  const gloves = db.getAll();
  const last = db.getLastScrapeLog();
  res.json({ total_gloves: gloves.length, last_scrape: last || null });
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
