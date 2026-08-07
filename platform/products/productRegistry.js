const products = [
  {
    id: "rainbow-six-cuba",
    name: "Rainbow Six CUBA",
    status: "active",
    type: "community-product",
    game: "rainbow-six-siege",

    modules: [
      "discord",
      "stats",
      "website",
      "companion"
    ],

    paths: {
      productRoot: "products/RainbowSixCuba",
      website: "products/RainbowSixCuba/Website",
      discord: "products/RainbowSixCuba/Discord",
      stats: "products/RainbowSixCuba/Stats",
      companion: "products/RainbowSixCuba/Companion"
    },

    runtime: {
      discord: {
        type: "pm2",
        process: "RainbowSixCubaBot"
      },

      stats: {
        type: "pm2",
        process: "RainbowSixCubaStats"
      },

      website: {
        type: "external",
        process: null
      },

      companion: {
        type: "client",
        process: null
      }
    }
  }
];

function listProducts() {
  return products;
}

function getProduct(id) {
  return products.find(product => product.id === id) || null;
}

function getProductRuntime(id) {
  const product = getProduct(id);

  if (!product)
    return null;

  return {
    productId: product.id,
    productName: product.name,
    runtime: product.runtime || {}
  };
}

function findProductByProcess(processName) {

  for (const product of products) {

    for (const [moduleName, runtime] of Object.entries(product.runtime || {})) {

      if (runtime?.process === processName) {
        return {
          productId: product.id,
          productName: product.name,
          module: moduleName,
          runtime
        };
      }

    }

  }

  return null;
}

function getRuntimeTopology() {

  return products.map(product => ({
    id: product.id,
    name: product.name,
    status: product.status,
    type: product.type,
    game: product.game,

    modules: product.modules.map(moduleName => ({
      name: moduleName,
      runtime: product.runtime?.[moduleName] || {
        type: "unknown",
        process: null
      }
    }))
  }));

}

module.exports = {
  products,
  listProducts,
  getProduct,
  getProductRuntime,
  findProductByProcess,
  getRuntimeTopology
};
