const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      success: false,
      message: 'Cannot delete: this record is referenced by other records.',
    });
  }

  const status  = err.statusCode || err.status || 500;
  const message = err.message    || 'Internal Server Error';

  res.status(status).json({ success: false, message });
};

module.exports = { errorHandler };
