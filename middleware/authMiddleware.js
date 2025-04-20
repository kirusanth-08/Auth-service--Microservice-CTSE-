const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];

  //check if token is in the header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Access denied. No token provided or malformed header.' });
  }

  // extract the token from the header
  const token = authHeader.split(' ')[1];

  // verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user payload to request
    next();

  } catch (err) {
    // if token is expired or invalid
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}; 