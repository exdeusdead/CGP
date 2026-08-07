const express = require("express");
const {
  listProducts,
  getProduct,
  getRuntimeTopology
} = require("../../products/productRegistry");

module.exports = function() {

  const router = express.Router();

  router.get("/products", (req, res) => {

    res.json({
      count: listProducts().length,
      products: getRuntimeTopology()
    });

  });

  router.get("/products/:id", (req, res) => {

    const product = getProduct(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    res.json(product);

  });

  return router;

};
