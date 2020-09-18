exports.handler = (err, req, res, next) => {
  debug(err);
  res.status(500).send();
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
exports.notFound = (req, res) => {
  return res.status(404).send();
};
