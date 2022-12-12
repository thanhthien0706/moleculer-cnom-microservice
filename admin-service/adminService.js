// index.js
const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const Product = require("./product.model");

const brokerNodeAdmin = new ServiceBroker({
  nodeID: "node-admin-service",
  transporter: "NATS",
});

brokerNodeAdmin.createService({
  name: "admins",
  mixins: [DbService],
  adapter: new MongooseAdapter(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/db-test-demo",
    { useNewUrlParser: true, useUnifiedTopology: true }
  ),
  model: Product,
  settings: {
    fields: ["_id", "title", "image", "likes"],
  },
  dependencies: {},

  actions: {
    getProducts: {
      rest: {
        method: "GET",
        path: "/products",
      },
      async handler() {
        const products = await this.adapter.find();
        return products;
      },
    },
    addProduct: {
      rest: {
        method: "POST",
        path: "/product",
      },
      params: {
        title: "string",
        image: "string",
      },
      async handler(ctx) {
        const product = new Product();
        product.title = ctx.params.title;
        product.image = ctx.params.image;
        product.likes = 0;

        const result = await this.adapter.insert(product);
        ctx.emit("product.main.create", JSON.stringify(result));
        return result;
      },
    },
    getProductById: {
      rest: "GET /product/:id",
      params: {
        id: "string",
      },
      async handler(ctx) {
        const products = await this.adapter.findOne({
          _id: ctx.params.id,
        });
        return products;
      },
    },
    updateProductById: {
      rest: "PUT /product/:id",
      params: {
        id: "string",
        title: "string",
        image: "string",
      },
      async handler(ctx) {
        const product = await this.adapter.updateById(ctx.params.id, {
          title: ctx.params.title,
          image: ctx.params.image,
        });
        ctx.emit("product.main.update", JSON.stringify(product));
        return product;
      },
    },
    deleteProductById: {
      rest: "DELETE /product/:id",
      params: {
        id: "string",
      },
      async handler(ctx) {
        const product = await this.adapter.removeById(ctx.params.id);
        ctx.emit("product.main.delete", JSON.stringify(ctx.params.id));
        return product;
      },
    },
    addLikeProductById: {
      rest: "POST /product/:id/like",
      params: {
        id: "string",
      },
      async handler(ctx) {
        const product = await this.adapter.findOne({
          _id: ctx.params.id,
        });
        product.likes++;
        const result = await this.adapter.updateById(ctx.params.id, product);
        return result;
      },
    },
  },
});

brokerNodeAdmin.start();
