var mongoose = require("mongoose");

mongoose.set("useCreateIndex", true);

var Schema = new mongoose.Schema(
  {
    absoluteRank: Number,
    pageCount: Number,
    keyword: String,
    productId: String,
    provider: { type: String, enum: ["amazon", "google"] },
    ts: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ranking", Schema);
