module.exports = (sequelize, Sequelize, DataTypes) => {
    const Customer = sequelize.define("customer", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        mobile_no: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
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
    return Customer;
};
