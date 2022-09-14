// Error Handler Class
class ErrorHandler extends Error {
  constructor(message, errorcode) {
    super(message);
    this.statusCode = statusCode

 Error.captureStarckTrace(this, this.constructor)
  }
}

module.exports = ErrorHandler;