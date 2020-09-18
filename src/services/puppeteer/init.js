const config = require("../../config/index.js");
const puppeteer = require("puppeteer-extra");
const moment = require("moment");
const pluginStealth = require("puppeteer-extra-plugin-stealth");

const run = async () => {
  if (global.browser) {
    return global.browser;
  }
  puppeteer.use(pluginStealth());

  const browser = await puppeteer.launch({
    headless: config.puppeteer.headless,
    args: [
      //   "--window-position=000,000",
      //   "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  debug("Pupetteer browser opened");

  if (global.browser) {
    debug("Duplicate pupetteer browser, closing");
    browser.close();
  }

  global.browser = global.browser || browser;

  return global.browser;
};

module.exports = run;
