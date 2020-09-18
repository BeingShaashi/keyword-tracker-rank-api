const Ranking = require("../../../models/ranking");

exports.get = async (req, res, next) => {
  try {
    const {
      query: { keyword, productId },
    } = req;

    if (!keyword) {
      return res.status(400).json({ error: "Require valid keyword" });
    }

    if (!productId) {
      return res.status(400).json({ error: "Require valid productId" });
    }

    let ranks = await Ranking.find({ keyword, productId })
      .sort({ ts: 1 })
      .lean();

    return res.json({ ranks });
  } catch (e) {
    next(e);
  }
};
