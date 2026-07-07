import { connectToDatabase } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pinoyyern-dev-secret-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create JWT token
    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, sessionId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Store session ID in saves collection — invalidates all other sessions
    const { db } = await connectToDatabase();
    const saves = db.collection('saves');
    await saves.updateOne(
      { userId: user._id.toString() },
      { $set: { sessionId } },
      { upsert: true }
    );

    return res.status(200).json({
      message: 'Login successful!',
      token,
      username: user.username,
      sessionId,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}
