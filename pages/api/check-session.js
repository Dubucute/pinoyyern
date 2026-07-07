import { connectToDatabase } from '../../lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pinoyyern-dev-secret-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { db } = await connectToDatabase();
    const saves = db.collection('saves');

    const saveDoc = await saves.findOne({ userId: decoded.userId }, { projection: { sessionId: 1 } });
    if (saveDoc && saveDoc.sessionId && decoded.sessionId && saveDoc.sessionId !== decoded.sessionId) {
      return res.status(403).json({ message: 'Session expired — logged in elsewhere', sessionExpired: true });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.error('Session check error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
