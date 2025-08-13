module.exports = (sequelize, Sequelize, DataTypes) => {
    const Admin = sequelize.define("admin", {
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
    return Admin;
};
