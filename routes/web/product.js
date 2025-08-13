const express = require('express');
const router = express.Router();
const productController = require("../../controller/productController");
const { upload } = require("../../services/fileupload");
const { handleMulterErrors } = require('../../middleware/uploadHandler');

router.get("/", productController.getIndex);
router.get("/list", productController.getData);
router.get("/create", productController.create);
router.post("/store", handleMulterErrors(upload.fields([{ name: 'images', maxCount: 5 }, { name: 'main_image', maxCount: 1 }])), productController.store);
router.post("/delete/:id", productController.deleteRecord);
router.get("/:id/edit", productController.edit);
router.post("/:id/update", handleMulterErrors(upload.fields([{ name: 'images', maxCount: 5 }, { name: 'main_image', maxCount: 1 }])), productController.update);
router.post("/changestatus/:id", productController.changeStatus);

module.exports = router;