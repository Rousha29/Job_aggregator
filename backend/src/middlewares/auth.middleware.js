import jwt from 'jsonwebtoken';

const JWT_SECRET = 'secret123'; // (plus tard → .env)

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Vérifier si le token existe
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 2. Extraire le token
    const token = authHeader.split(' ')[1]; // "Bearer TOKEN"

    // 3. Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Injecter user dans req
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};