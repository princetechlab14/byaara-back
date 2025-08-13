const express = require('express');
const router = express.Router();
const orderController = require("../../controller/orderController");

router.get("/", orderController.getIndex);
router.get("/list", orderController.getData);
router.post("/delete/:id", orderController.deleteRecord);
router.get("/:id/edit", orderController.edit);
router.post("/:id/update", orderController.update);
router.post("/changestatus/:id", orderController.changeStatus);

module.exports = router;