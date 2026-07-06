import { connectToDatabase } from '../../lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pinoyyern-dev-secret-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify auth token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const { db } = await connectToDatabase();
    const saves = db.collection('saves');

    const save = await saves.findOne({ userId: decoded.userId });

    if (!save) {
      return res.status(200).json({ message: 'No cloud save found', gameState: null });
    }

    return res.status(200).json({
      message: 'Cloud save loaded!',
      gameState: save.gameState,
      savedAt: save.updatedAt,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
    console.error('Load error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}
