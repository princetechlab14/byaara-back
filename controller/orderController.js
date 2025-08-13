const { ProductModel, OrderModel, CustomerModel } = require("../models");
const Joi = require("joi");
const { Op } = require("sequelize");

const orderSchema = Joi.object({
    full_name: Joi.string().max(255).allow(null, ''),
    phone_no: Joi.string().max(20).allow(null, ''),
    address: Joi.string().max(255).allow(null, ''),
    landmark: Joi.string().max(255).allow(null, ''),
    pincode: Joi.string().max(20).allow(null, ''),
    state: Joi.string().max(255).allow(null, ''),
    city: Joi.string().max(255).allow(null, ''),
    quantity: Joi.number().integer().allow(null),
    total_price: Joi.number().precision(2).allow(null),
    shipping_status: Joi.string().valid("pending", "awaiting_payment", "awaiting_fulfillment", "awaiting_shipment", "awaiting_pickup", "partially_shipped", "completed", "shipped", "cancelled", "declined", "refunded", "disputed").default("pending"),
    status: Joi.string().valid("Active", "InActive").default("Active"),
    shorting: Joi.string().default("500")
});

const getIndex = async (req, res) => {
    try {
        res.render("order/index", { title: "Order List" });
    } catch (error) {
        console.error("Error fetching order:", error);
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
                    { full_name: { [Op.like]: `%${search}%` } },
                    { phone_no: { [Op.like]: `%${search}%` } },
                    { address: { [Op.like]: `%${search}%` } },
                    { landmark: { [Op.like]: `%${search}%` } },
                    { pincode: { [Op.like]: `%${search}%` } },
                    { state: { [Op.like]: `%${search}%` } },
                    { city: { [Op.like]: `%${search}%` } },
                    { quantity: { [Op.like]: `%${search}%` } },
                    { total_price: { [Op.like]: `%${search}%` } },
                    { shipping_status: { [Op.like]: `%${search}%` } },
                    { shorting: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                ],
            };
        }
        let orderBy = [["id", "DESC"]];
        if (column && order) orderBy = [[column, order.toUpperCase()]];
        const { count, rows: tableRecords } = await OrderModel.findAndCountAll({
            attributes: ['id', 'customer_id', 'product_id', 'full_name', 'phone_no', 'address', 'landmark', 'pincode', 'state', 'city', 'quantity', 'total_price', 'shipping_status', 'status', 'shorting'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: CustomerModel, as: 'mainCustomer', attributes: ['id', 'name', 'email', 'mobile_no'] },
                { model: ProductModel, as: 'mainProduct', attributes: ['id', 'title', 'main_image', 'regular_price', 'sale_price'] }
            ]
        });

        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await OrderModel.findByPk(id);
        if (!order) return res.status(404).send("Order not found");
        res.render("order/edit", { title: "Edit Order", order, error: "" });
    } catch (error) {
        console.error("Error fetching order for edit:", error);
        res.status(500).send("Internal Server Error");
    }
};

const update = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await OrderModel.findByPk(id);
        const { error, value } = orderSchema.validate(req.body);
        if (error || !order) return res.render("order/edit", { title: "Edit Order", order, error: error?.details?.[0]?.message });

        await OrderModel.update({ ...value }, { where: { id } });
        res.redirect("/admin/order");
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).send("Internal Server Error");
    }
};

const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await OrderModel.findByPk(id);
        if (!order) return res.status(404).send("Order not found");
        await OrderModel.destroy({ where: { id } });
        res.redirect("/admin/order");
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).send("Internal Server Error");
    }
};

const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const order = await OrderModel.findByPk(id);
        let status;
        if (order.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const orderDetail = await OrderModel.update({ status }, { where: { id } });
            if (orderDetail) {
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

module.exports = {
    getIndex,
    deleteRecord,
    edit,
    update,
    changeStatus,
    getData
};
