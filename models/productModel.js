module.exports = (sequelize, Sequelize, DataTypes) => {
    const Product = sequelize.define("product", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sku: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },
        main_image: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true
        },
        regular_price: {
            type: DataTypes.DECIMAL(16, 2),
            allowNull: true,
        },
        sale_price: {
            type: DataTypes.DECIMAL(16, 2),
            allowNull: true,
        },
        rating: {
            type: DataTypes.DECIMAL(8, 2),
            defaultValue: 4.5,
        },
        review: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        desc: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        home_page: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("Active", "InActive"),
            defaultValue: "Active",
        },
        shorting: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "500",
        },
    });
    return Product;
};
