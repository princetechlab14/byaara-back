const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || "localhost",
        dialect: 'mysql',
        pool: {
            max: 20,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            charset: "utf8mb4",
            collate: "utf8mb4_unicode_ci",
        },
        logging: false
    }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.AdminModel = require('./adminModel')(sequelize, Sequelize, DataTypes);
db.CustomerModel = require('./customerModel')(sequelize, Sequelize, DataTypes);
db.ProductModel = require('./productModel')(sequelize, Sequelize, DataTypes);
db.SettingModel = require('./settingModel')(sequelize, Sequelize, DataTypes);
db.ContactUsModel = require('./contactModel')(sequelize, Sequelize, DataTypes);
db.OrderModel = require('./orderModel')(sequelize, Sequelize, DataTypes);


db.OrderModel.belongsTo(db.CustomerModel, { foreignKey: "customer_id", as: "mainCustomer" });
db.OrderModel.belongsTo(db.ProductModel, { foreignKey: "product_id", as: "mainProduct" });

module.exports = db;