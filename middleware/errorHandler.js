const errorCode = {
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  INTERNAL_SERVER: 500,
};

const errorHandler = (err, req, res, next) => {
  const stausCode = res.statusCode ? res.statusCode : 500;
  switch (stausCode) {
    case errorCode.BAD_REQUEST:
      res.json({
        title: "Validation error",
        message: err.message,
      });
    case errorCode.NOT_FOUND:
      res.json({
        title: "NOT_FOUND",
        message: err.message,
      });
    case errorCode.INTERNAL_SERVER:
      res.json({
        title: "internal server error",
        message: err.message,
      });
    default:
      res.status(500).json({
        title: "internal server error",
        message: err.message,
      });
  }
};

module.exports = errorHandler;
