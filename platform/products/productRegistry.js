const products = [
  {
    id: "rainbow-six-cuba",
    name: "Rainbow Six CUBA",
    status: "active",
    type: "community-product",
    game: "rainbow-six-siege",
    modules: ["discord", "stats", "website", "companion"],
    paths: {
      productRoot: "products/RainbowSixCuba",
      website: "products/RainbowSixCuba/Website",
      discord: "products/RainbowSixCuba/Discord",
      stats: "products/RainbowSixCuba/Stats",
      companion: "products/RainbowSixCuba/Companion"
    }
  }
];

function listProducts() {
  return products;
}

function getProduct(id) {
  return products.find(product => product.id === id) || null;
}

module.exports = {
  products,
  listProducts,
  getProduct
};
