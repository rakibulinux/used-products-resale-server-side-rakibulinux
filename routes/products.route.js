const express = require("express");
const products = require("../controllers/products.controllers");
const router = express.Router();

router.route("/").get(products.getProductsByEmail).post();

router.route("/:id").get().put().delete();

module.exports = router;
