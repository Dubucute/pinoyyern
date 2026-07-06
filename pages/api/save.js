import { connectToDatabase } from '../../lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pinoyyern-dev-secret-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
    const { gameState } = req.body;

    if (!gameState) {
      return res.status(400).json({ message: 'Game state is required' });
    }

    const { db } = await connectToDatabase();
    const saves = db.collection('saves');

    // Upsert: save game state for this user
    await saves.updateOne(
      { userId: decoded.userId },
      {
        $set: {
          userId: decoded.userId,
          username: decoded.username,
          gameState,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return res.status(200).json({ message: 'Game saved to cloud!', savedAt: new Date().toISOString() });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
    console.error('Save error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}
