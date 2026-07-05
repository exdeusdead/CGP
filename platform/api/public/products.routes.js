const express = require("express");
const { listProducts, getProduct } = require("../../products/productRegistry");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    count: listProducts().length,
    products: listProducts()
  });
});

router.get("/:id", (req, res) => {
  const product = getProduct(req.params.id);

  if (!product) {
    return res.status(404).json({
      error: "PRODUCT_NOT_FOUND",
      message: "No CGP product was found with this id."
    });
  }

  res.json(product);
});

module.exports = router;
