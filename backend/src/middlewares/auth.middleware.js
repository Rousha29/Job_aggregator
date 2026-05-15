import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return res.status(500).json({ error: 'Server config error' });
    }

   const token = req.cookies?.token;
    if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
    }


    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};