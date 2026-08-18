import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Check if header starts with Bearer
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7, authHeader.length).trim() 
    : authHeader;

  if (!token) {
    return res.status(401).json({ msg: 'No token found in Bearer structure' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'codeverse_super_secret_key_12345');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
