// index.js
const { ServiceBroker } = require("moleculer");
const ApiGateway = require("moleculer-web");

const brokerNodeGateway = new ServiceBroker({
  nodeID: "node-gateway",
  transporter: "NATS",
});

brokerNodeGateway.createService({
  name: "gateway",

  mixins: [ApiGateway],

  settings: {
    // Exposed port
    port: process.env.PORT || 3000,

    cors: {
      origin: "*",
      methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
    },

    routes: [
      {
        path: "/api",

        whitelist: ["**"],

        use: [],

        mergeParams: true,

        authentication: false,

        authorization: false,

        autoAliases: true,

        aliases: {
          "GET /admin/products": "admins.getProducts",
          "POST /admin/product": "admins.addProduct",
          "GET /admin/product/:id": "admins.getProductById",
          "PUT /admin/product/:id": "admins.updateProductById",
          "DELETE /admin/product/:id": "admins.deleteProductById",

          "GET /main/products": "mains.getProducts",
          "GET /main/products/:id/like": "mains.addLikeProductById",
        },

        callingOptions: {},

        bodyParsers: {
          json: {
            strict: false,
            limit: "1MB",
          },
          urlencoded: {
            extended: true,
            limit: "1MB",
          },
        },

        mappingPolicy: "all", // Available values: "all", "restrict"

        logging: true,
      },
    ],
    log4XXResponses: false,
    logRequestParams: null,
    logResponseData: null,

    assets: {
      folder: "public",

      options: {},
    },
  },
});

brokerNodeGateway.start();
