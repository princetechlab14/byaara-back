const { ProductModel } = require("../models");
const Joi = require("joi");
const { deleteObjS3 } = require("../services/fileupload");
const { Op } = require("sequelize");

const productSchema = Joi.object({
    title: Joi.string().trim().max(255).allow('', null),
    sku: Joi.string().trim().max(255).allow('', null),
    regular_price: Joi.number().precision(2).min(0).allow(null),
    sale_price: Joi.number().precision(2).min(0).allow(null),
    rating: Joi.number().precision(2).min(0).max(5).default(4.5),
    review: Joi.number().integer().min(0).default(0),
    desc: Joi.string().allow('', null),
    status: Joi.string().valid('Active', 'InActive').default('Active'),
    shorting: Joi.number().integer().min(0),
    home_page: Joi.boolean().default(false),
});

const getIndex = async (req, res) => {
    try {
        res.render("product/index", { title: "Product List" });
    } catch (error) {
        console.error("Error fetching product:", error);
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
                    { title: { [Op.like]: `%${search}%` } },
                    { regular_price: { [Op.like]: `%${search}%` } },
                    { sale_price: { [Op.like]: `%${search}%` } },
                    { rating: { [Op.like]: `%${search}%` } },
                    { review: { [Op.like]: `%${search}%` } },
                    { shorting: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                ],
            };
        }
        let orderBy = [["id", "DESC"]];
        if (column && order) orderBy = [[column, order.toUpperCase()]];
        const { count, rows: tableRecords } = await ProductModel.findAndCountAll({
            attributes: ['id', 'title', 'sku', 'main_image', 'images', 'regular_price', 'sale_price', 'rating', 'review', 'shorting', 'status', 'home_page'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const create = async (req, res) => {
    res.render("product/create", { title: "Product Create", error: "", product: {} });
};

const store = async (req, res) => {
    const isAWS = process.env.FILE_STORAGE === 'aws';

    // Main image (single)
    const mainImageFile = req.files?.main_image?.[0] || null;
    const mainImagePath = mainImageFile
        ? (isAWS
            ? mainImageFile.location
            : `${req.protocol}://${req.get('host')}/uploads/${mainImageFile.filename}`)
        : null;

    // Multiple images
    const imageFiles = req.files?.images || [];
    const imageUrls = imageFiles.map(file =>
        isAWS
            ? file.location
            : `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    );

    const { error, value } = productSchema.validate(req.body);
    if (error) {
        if (mainImagePath) await deleteObjS3(mainImagePath);
        if (imageUrls.length > 0) {
            await Promise.all(imageUrls.map(file => deleteObjS3(file)));
        }
        return res.render("product/create", { title: "Product Create", error: error.details[0].message, product: value });
    }
    try {
        // ✅ Check if slug already exists
        console.log("value.slug =>", value.sku);

        const existingProduct = await ProductModel.findOne({ where: { sku: value.sku } });
        if (existingProduct) {
            if (mainImagePath) await deleteObjS3(mainImagePath);
            if (imageUrls.length > 0) {
                await Promise.all(imageUrls.map(file => deleteObjS3(file)));
            }
            return res.render("product/create", { title: "Product Create", error: "SKU already exists. Please choose a different one.", product: value });
        }

        await ProductModel.create({ ...value, main_image: mainImagePath, images: imageUrls });
        res.redirect("/admin/product");
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send("Internal Server Error");
    }
};

const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await ProductModel.findByPk(id);
        if (!product) return res.status(404).send("Product not found");
        res.render("product/edit", { title: "Edit Product", product, error: "" });
    } catch (error) {
        console.error("Error fetching product for edit:", error);
        res.status(500).send("Internal Server Error");
    }
};

const update = async (req, res) => {
    const { id } = req.params;
    const isAWS = process.env.FILE_STORAGE === 'aws';
    // Main image (single)
    const mainImageFile = req.files?.main_image?.[0] || null;
    const mainImagePath = mainImageFile
        ? (isAWS
            ? mainImageFile.location
            : `${req.protocol}://${req.get('host')}/uploads/${mainImageFile.filename}`)
        : null;

    // Multiple images (append)
    const imageFiles = req.files?.images || [];
    const imageUrls = imageFiles.map(file =>
        isAWS
            ? file.location
            : `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    );

    try {
        const { error, value } = productSchema.validate(req.body);
        const product = await ProductModel.findByPk(id);

        if (error || !product) {
            if (mainImagePath) await deleteObjS3(mainImagePath);
            if (imageUrls.length > 0) {
                await Promise.all(imageUrls.map(file => deleteObjS3(file)));
            }
            return res.render("product/edit", {
                title: "Edit Product",
                product,
                error: error?.details?.[0]?.message
            });
        }

        // Replace main image only if a new one is uploaded
        if (mainImagePath && product.main_image) {
            await deleteObjS3(product.main_image);
        }

        // Append new images without deleting old ones
        let finalImages = Array.isArray(product.images) ? [...product.images] : [];
        if (imageUrls.length > 0) {
            finalImages = [...finalImages, ...imageUrls];
        }

        await ProductModel.update(
            {
                ...value,
                main_image: mainImagePath || product.main_image,
                images: finalImages
            },
            { where: { id } }
        );

        res.redirect("/admin/product");
    } catch (error) {
        if (mainImagePath) await deleteObjS3(mainImagePath);
        if (imageUrls.length > 0) {
            await Promise.all(imageUrls.map(file => deleteObjS3(file)));
        }
        console.error("Error updating product:", error);
        res.status(500).send("Internal Server Error");
    }
};

const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await ProductModel.findByPk(id);
        if (!product) return res.status(404).send("Product not found");
        await ProductModel.destroy({ where: { id } });
        res.redirect("/admin/product");
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Internal Server Error");
    }
};

const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const product = await ProductModel.findByPk(id);
        let status;
        if (product.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const productDetail = await ProductModel.update({ status }, { where: { id } });
            if (productDetail) {
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
    create,
    store,
    deleteRecord,
    edit,
    update,
    changeStatus,
    getData
};
