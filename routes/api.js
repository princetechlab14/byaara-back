const express = require("express");
const router = express.Router();
const { ProductModel, OrderModel } = require("../models");
const Joi = require("joi");

const orderSchema = Joi.object({
    product_id: Joi.alternatives().try(Joi.string().trim(), Joi.number()).required()
        .messages({ 'any.required': 'Product ID is required.' }),

    quantity: Joi.number().integer().min(1).required()
        .messages({ 'number.base': 'Quantity must be a number.', 'number.min': 'Quantity must be at least 1.' }),

    full_name: Joi.string().trim().min(2).max(120).allow(''),
    phone_no: Joi.string().trim().pattern(/^\d{7,15}$/).required()
        .messages({ 'string.pattern.base': 'Phone must be numeric and 7–15 digits.', 'any.required': 'Phone number is required.' }),

    address: Joi.string().trim().min(5).max(500).required(),
    landmark: Joi.string().trim().min(2).max(200).allow(''),
    pincode: Joi.string().trim().pattern(/^\d{4,6}$/).required(),
    state: Joi.string().trim().min(2).max(100).required(),
    city: Joi.string().trim().min(2).max(100).required()
});

router.get("/products", async function (req, res, next) {
    try {
        const sortType = req.query.sort || "id_desc";
        let order = [];

        switch (sortType) {
            case "newest":
                order = [["createdAt", "DESC"]];
                break;
            case "price_asc":
                order = [["sale_price", "ASC"]];
                break;
            case "price_desc":
                order = [["sale_price", "DESC"]];
                break;
            case "reviews":
                order = [["review", "DESC"]];
                break;
            default:
                order = [["id", "DESC"]];
        }
        const products = await ProductModel.findAll({ order, attributes: ['id', 'title', 'sku', 'main_image', 'regular_price', 'sale_price'] });
        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/order", async function (req, res, next) {
    try {
        // 1. Validate input
        const { error, value } = orderSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ success: false, errors: error.details });

        // 2. Verify product exists
        const product = await ProductModel.findByPk(value.product_id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found." });

        const subtotal = product.sale_price * value.quantity;
        const shipping = 0;
        const total_price = subtotal + shipping;

        // 4. Save order
        const order = await OrderModel.create({ ...value, subtotal, shipping, total_price });
        return res.json({ status: true, message: "Order Created SuccessFully.", order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
