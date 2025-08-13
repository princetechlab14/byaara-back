module.exports = (sequelize, Sequelize, DataTypes) => {
    const Order = sequelize.define("order", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone_no: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        landmark: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pincode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        total_price: {
            type: DataTypes.DECIMAL(16, 2),
            allowNull: true,
        },
        shipping_status: {
            type: DataTypes.ENUM("pending", "awaiting_payment", "awaiting_fulfillment", "awaiting_shipment", "awaiting_pickup", "partially_shipped", "completed", "shipped", "cancelled", "declined", "refunded", "disputed"),
            defaultValue: "pending"
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
    return Order;
};
