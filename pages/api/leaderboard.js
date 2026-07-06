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
      .sort({ totalEarned: -1 })
      .limit(20)
      .project({ username: 1, totalEarned: 1, totalClicks: 1, playTime: 1, updatedAt: 1, _id: 0 })
      .toArray();

    const topClicks = [...topMoney].sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0));

    const topTime = [...topMoney].sort((a, b) => (b.playTime || 0) - (a.playTime || 0));

    return res.status(200).json({ topMoney, topClicks, topTime });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
