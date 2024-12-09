const jwt = require('jsonwebtoken');
const SECRET_KEY = 'myKey'; // Replace with a secure key

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer <token>"

  console.log('Authorization Header:', authHeader); // Debug log

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message); // Debugging
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('Decoded user:', user); // Log the decoded token payload
    req.user = user; // Attach userId to the request for downstream use
    console.log('Decoded user:', user); // Log for debugging
    next();
  });
}

module.exports = { authenticateToken };
