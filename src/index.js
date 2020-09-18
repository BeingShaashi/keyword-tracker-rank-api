debug = require("debug")("myapp-api");

// eslint-disable-next-line no-global-assign
Promise = require("bluebird");
const { port } = require("./config");

const expressApp = require("./app");
const database = require("./database");
const scheduler = require("./scheduler");

expressApp.set("port", port);
const httpServer = require("http").Server(expressApp);

database.connect();

httpServer.listen(port);
httpServer.on("error", onError);
httpServer.on("listening", () => {
  onListening();
  scheduler();
});

const src = expressApp;

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = httpServer.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

module.exports = src;
