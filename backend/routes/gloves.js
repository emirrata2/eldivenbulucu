const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET /api/gloves
router.get("/", (req, res) => {
  const {
    search,
    cut, chemical, chemicals, puncture, cold, heat, antistatic, waterproof, food,
    brand, subcategory,
    page = "1",
    limit = "20",
  } = req.query;

  let gloves = db.getAll();

  if (search) {
    const q = search.toLowerCase();
    gloves = gloves.filter((g) =>
      g.name?.toLowerCase().includes(q) ||
      g.brand?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q)
    );
  }
  if (cut === "1")        gloves = gloves.filter((g) => g.is_cut_resistant);
  if (chemical === "1")   gloves = gloves.filter((g) => g.is_chemical_resistant);
  if (puncture === "1")   gloves = gloves.filter((g) => g.is_puncture_resistant);
  if (cold === "1")       gloves = gloves.filter((g) => g.is_cold_resistant);
  if (heat === "1")       gloves = gloves.filter((g) => g.is_heat_resistant);
  if (antistatic === "1") gloves = gloves.filter((g) => g.is_antistatic);
  if (waterproof === "1") gloves = gloves.filter((g) => g.is_waterproof);
  if (food === "1")       gloves = gloves.filter((g) => g.is_food_safe);
  if (brand)              gloves = gloves.filter((g) => g.brand?.toLowerCase().includes(brand.toLowerCase()));
  if (subcategory)        gloves = gloves.filter((g) => g.subcategory === subcategory);
  if (chemicals) {
    const codes = chemicals.split(",");
    gloves = gloves.filter((g) => g.chemical_codes && codes.some((c) => g.chemical_codes.includes(c)));
  }

  const total = gloves.length;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;
  const data = gloves.slice(offset, offset + limitNum);

  res.json({ total, page: pageNum, limit: limitNum, data });
});

// GET /api/gloves/meta/brands
router.get("/meta/brands", (req, res) => {
  const brands = [...new Set(db.getAll().map((g) => g.brand).filter(Boolean))].sort();
  res.json(brands);
});

// GET /api/gloves/meta/subcategories
router.get("/meta/subcategories", (req, res) => {
  const cats = [...new Set(db.getAll().map((g) => g.subcategory).filter(Boolean))].sort();
  res.json(cats);
});

// GET /api/gloves/:id
router.get("/:id", (req, res) => {
  const glove = db.getAll().find((g) => String(g.id) === req.params.id);
  if (!glove) return res.status(404).json({ error: "Bulunamadı" });
  res.json(glove);
});

module.exports = router;
