const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'amazon_secret_jwt_key_2026_super_secure');
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }

  if (!token) {
    // For optional checkout without blocking unregistered visitors
    req.user = { id: 'guest_user_123', name: 'Guest Customer' };
    return next();
  }
};

module.exports = { protect };
