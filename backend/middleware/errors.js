export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource identifier.' });
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'value';
    return res.status(409).json({ message: `An account or record with this ${field} already exists.` });
  }

  console.error(error);
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
}
