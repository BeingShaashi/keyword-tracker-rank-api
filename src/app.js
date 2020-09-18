const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./api/v1/router");
const websiteRoute = require("./website/router");
const error = require("./middlewares/error");

const config = require("./config");

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
};

/**
 * Express instance
 * @public
 */

const server = express();

// parse body params and attache them to req.body
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// enable CORS - Cross Origin Resource Sharing
server.use(cors(corsOptions));

server.get("/api", (req, res) =>
  res.status(200).json({
    AppName: config.appName,
    Environment: config.env,
  })
);

// mount api v1 routes
server.use("/api/v1", routes);

// mount website
server.use("/", websiteRoute);

// catch 404 and forward to error handler
server.use(error.notFound);

server.use(error.handler);

async function graceful() {
  console.log("Stoping app");
  process.exit(0);
}

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);

module.exports = server;
