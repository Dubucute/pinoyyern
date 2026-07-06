import { connectToDatabase } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
  }

  if (password.length < 4) {
    return res.status(400).json({ message: 'Password must be at least 4 characters' });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection('users');

    // Check if username already exists
    const existing = await users.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await users.insertOne({
      username: username.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    });

    return res.status(201).json({ message: 'Account created successfully!' });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}
