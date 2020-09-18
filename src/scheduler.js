const schedule = require("node-schedule");
const fs = require("fs");

const puppeteerService = require("./services/puppeteer");
const Ranking = require("./models/ranking");

module.exports = async () => {
  const rule = new schedule.RecurrenceRule();

  // rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
  // rule.hour = [12, 24];
  // rule.minute = 0;

  rule.minute = new schedule.Range(0, 59, 1);

  console.log("Scheduling capture: ", rule);

  schedule.scheduleJob(rule, captureRankings);
};

const captureRankings = async () => {
  let ts = new Date().setSeconds(0, 0);

  try {
    await puppeteerService.init();

    let filepath = "data/keywords.json";

    let keywords = fs.readFileSync(filepath);
    try {
      keywords = JSON.parse(keywords);
      console.log("Tracking keywords", keywords);
    } catch (e) {
      return console.log("Error parsing JSON /data/keywords.json: ", e.message);
    }

    let promises = keywords
      .filter((x) => x.provider === "amazon")
      .map(async (x) => {
        const amazonResult = await puppeteerService.amazon.getRanking(x);
        await Ranking.create({
          absoluteRank: amazonResult.rank,
          pageCount: amazonResult.pageCount,
          keyword: amazonResult.keyword,
          productId: amazonResult.productId,
          provider: "amazon",
          ts,
        });
      });

    await Promise.all(promises);
  } catch (error) {
    console.log("Error executing bootstrap: ", error);
  }
};
