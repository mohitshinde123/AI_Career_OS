export function notFoundHandler(req, res) {
  res
    .status(404)
    .json({
      error: {
        code: "NOT_FOUND",
        message: "The requested API endpoint does not exist.",
        requestId: req.requestId,
      },
    });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error?.name === "ZodError") {
    return res
      .status(400)
      .json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Check the submitted fields and try again.",
          fields: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
          requestId: req.requestId,
        },
      });
  }
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res
      .status(400)
      .json({
        error: {
          code: "INVALID_DATA",
          message: "The submitted data could not be saved.",
          requestId: req.requestId,
        },
      });
  }
  if (
    Number.isInteger(error?.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode < 500
  ) {
    return res
      .status(error.statusCode)
      .json({
        error: {
          code: error.code || "REQUEST_REJECTED",
          message: error.message || "The request could not be completed.",
          requestId: req.requestId,
        },
      });
  }
  // Do not log request bodies, tokens, profile content or connection strings.
  console.error(
    JSON.stringify({
      level: "error",
      requestId: req.requestId,
      name: error?.name || "Error",
      message: "Request processing failed",
    }),
  );
  return res
    .status(500)
    .json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Try again shortly.",
        requestId: req.requestId,
      },
    });
}
