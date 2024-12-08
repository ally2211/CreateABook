const jwt = require('jsonwebtoken');
const SECRET_KEY = 'myKey'; // Replace with a secure key

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.userId = user.userId; // Attach userId to the request for downstream use
    next();
  });
}

module.exports = { authenticateToken };
