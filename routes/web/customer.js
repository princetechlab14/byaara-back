const express = require('express');
const router = express.Router();
const customerController = require("../../controller/customerController");

router.get("/", customerController.getIndex);
router.get("/list", customerController.getData);
router.post("/changestatus/:id", customerController.changeStatus);

module.exports = router;