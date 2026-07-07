import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const leaderboard = db.collection('leaderboard');

    const topMoney = await leaderboard
      .find()
      .sort({ lifetimeEarned: -1 })
      .limit(20)
      .project({ username: 1, lifetimeEarned: 1, totalClicks: 1, playTime: 1, prestigeCount: 1, updatedAt: 1, _id: 0 })
      .toArray();

    const topClicks = await leaderboard
      .find()
      .sort({ totalClicks: -1 })
      .limit(20)
      .project({ username: 1, lifetimeEarned: 1, totalClicks: 1, playTime: 1, prestigeCount: 1, updatedAt: 1, _id: 0 })
      .toArray();

    const topTime = await leaderboard
      .find()
      .sort({ playTime: -1 })
      .limit(20)
      .project({ username: 1, lifetimeEarned: 1, totalClicks: 1, playTime: 1, prestigeCount: 1, updatedAt: 1, _id: 0 })
      .toArray();

    const topPrestige = await leaderboard
      .find()
      .sort({ prestigeCount: -1 })
      .limit(20)
      .project({ username: 1, lifetimeEarned: 1, totalClicks: 1, playTime: 1, prestigeCount: 1, updatedAt: 1, _id: 0 })
      .toArray();

    return res.status(200).json({ topMoney, topClicks, topTime, topPrestige });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
