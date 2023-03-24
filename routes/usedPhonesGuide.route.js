const express = require("express");
const {
  getUsedPhoneGuide,
} = require("../controllers/usedPhonesGuide.controllers");
const router = express.Router();

router.route("/").get(getUsedPhoneGuide);

module.exports = router;
