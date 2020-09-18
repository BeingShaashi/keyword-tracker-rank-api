const getAppdata = require("./appdata");

const port = process.env.PORT;
const env = process.env.NODE_ENV || "development";

/** Default configDefault will remain same in all environments and can be over-ridded */
const configDefault = {
  appName: "keyword-rank-tracker",
  env: env,

  // urls
  publicUrl: {
    protocol: "http:",
    hostname: "localhost:3001",
    pathname: "/api",
  },
  port: port || 3001,
  mongo: { host: "mongodb://localhost:27017/", database: "keywordranktracker" },

  appData: getAppdata(env),

  puppeteer: {
    headless: true,
  },

  amazon: {
    pageLimit: 30,
    url: "http://amazon.com",
  },

  google: {
    pageLimit: 0,
  },
};

const configStage = {
  ...configDefault,

  puppeteer: {
    ...configDefault.puppeteer,
    headless: true,
  },
};

const configProd = {
  ...configDefault,
  port: port || 5001,

  puppeteer: {
    ...configDefault.puppeteer,
    headless: true,
  },
};

const config =
  env === "stagging"
    ? configStage
    : env === "production"
    ? configProd
    : configDefault;

module.exports = config;
