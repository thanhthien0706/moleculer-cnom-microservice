// index.js
const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");

const brokerNodeMain = new ServiceBroker({
  nodeID: "node-main-service",
  transporter: "NATS",
});

brokerNodeMain.createService({
  name: "mains",
  mixins: [DbService],
  adapter: new SqlAdapter("db-test-demo", "root", "123456", {
    host: "localhost",
    dialect: "mysql",
  }),
  model: {
    name: "products",
    define: {
      title: Sequelize.STRING,
      image: Sequelize.TEXT,
      likes: Sequelize.INTEGER,
      adminId: Sequelize.STRING,
    },
    options: {},
  },
  settings: {
    fields: ["id", "title", "image", "likes", "adminId"],
  },
  dependencies: {},
  events: {
    async "product.main.create"(payload) {
      const dataPayload = JSON.parse(payload);
      await this.adapter.insert({
        title: dataPayload.title,
        image: dataPayload.image,
        likes: dataPayload.likes,
        adminId: dataPayload._id,
      });
    },
    async "product.main.update"(payload) {
      await this.clearCache();
      const dataPayload = JSON.parse(payload);

      const product = await this.model.findOne({
        where: {
          adminId: dataPayload._id,
        },
      });

      await this.model.update(
        {
          title: dataPayload.title,
          image: dataPayload.image,
          likes: dataPayload.likes,
          updatedAt: new Date(),
        },
        {
          where: {
            id: product.dataValues.id,
          },
        }
      );
    },
    async "product.main.delete"(payload) {
      const id = JSON.parse(payload);

      const product = await this.adapter.findOne({
        adminId: id,
      });

      await this.adapter.removeById(product.id);
    },
  },

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
    addLikeProductById: {
      rest: "GET /products/:id/like",
      params: {
        id: "string",
      },
      async handler(ctx) {
        const product = await this.model.findOne({
          where: {
            id: ctx.params.id,
          },
        });
        const like = product.dataValues.likes + 1;

        await ctx.call("admins.addLikeProductById", {
          id: product.adminId,
        });

        const result = await this.model.update(
          {
            likes: like,
          },
          {
            where: {
              id: ctx.params.id,
            },
          }
        );
        return result;
      },
    },
  },
});

brokerNodeMain.start();
