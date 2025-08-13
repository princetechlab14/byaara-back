const { CustomerModel } = require("../models");
const { Op } = require("sequelize");

const getIndex = async (req, res) => {
    try {
        res.render("customer/index", { title: "Customer List" });
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).send("Internal Server Error");
    }
};

const getData = async (req, res) => {
    try {
        let { page, limit, search, order, column } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;
        let whereCondition = {};
        if (search) {
            whereCondition = {
                [Op.or]: [
                    { id: { [Op.like]: `%${search}%` } },
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { mobile_no: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                ],
            };
        }
        let orderBy = [["id", "DESC"]];
        if (column && order) orderBy = [[column, order.toUpperCase()]];
        const { count, rows: tableRecords } = await CustomerModel.findAndCountAll({
            attributes: ['id', 'name', 'email', 'mobile_no', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const customer = await CustomerModel.findByPk(id);
        let status;
        if (customer.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const customerDetail = await CustomerModel.update({ status }, { where: { id } });
            if (customerDetail) {
                res.send({ success: true });
            } else {
                res.status(500).render("error", { error: "Internal Server Error" });
            }
        } catch (error) {
            res.status(500).render("error", { error: "Internal Server Error" });
        }
    } else {
        res.status(500).render("error", { error: "Internal Server Error" });
    }
};

module.exports = { getIndex, getData, changeStatus };