const express = require("express");
const error = require("../../middlewares/error");

const router = express.Router();

router.use("/static", express.static("public"));
router.use("/rank", require("./rank/routes"));

// catch 404 and forward to error handler
router.use(error.notFound);

module.exports = router;
