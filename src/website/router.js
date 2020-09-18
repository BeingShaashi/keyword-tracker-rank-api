const express = require("express");
const path = require("path");

const router = express.Router();

// router.use(express.static(path.join(__dirname, "../../Front/build")));
// router.use("/", function (req, res) {
//   res.sendFile(path.join(__dirname, "../../Front/build", "index.html"));
// });

module.exports = router;
