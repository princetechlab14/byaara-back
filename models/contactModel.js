module.exports = (sequelize, Sequelize, DataTypes) => {
    const Contact = sequelize.define("contact", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    });

    return Contact;
};
