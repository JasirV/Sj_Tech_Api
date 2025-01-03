const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Access token is required!' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token not found in Authorization header!' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token!', error: err.message });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
