const User = require('../models/User');
const Referral = require('../models/Referral');
const Transaction = require('../models/Transaction');

// ── In-memory cache (10 min TTL) ──────────────────────────────────────────────
// Leaderboard is the heaviest query ($lookup on transactions + referrals).
// Recalculating every user request wastes DB resources. Cache for 10 minutes.
let leaderboardCache = null;
let leaderboardCacheTime = 0;
const LEADERBOARD_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// GET /api/leaderboard — Get top earners
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const now = Date.now();

    // Serve from cache if still valid
    if (leaderboardCache && (now - leaderboardCacheTime) < LEADERBOARD_CACHE_TTL) {
      const cached = leaderboardCache.slice(0, limit);
      return res.json(cached);
    }

    // Aggregate scores: total transaction earnings + referral bonuses
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'userId',
          as: 'transactions',
          pipeline: [
            { $match: { status: 'completed' } },
            { $project: { amount: 1 } }
          ]
        },
      },
      {
        $lookup: {
          from: 'referrals',
          localField: '_id',
          foreignField: 'referrerId',
          as: 'referrals',
          pipeline: [
            { $project: { bonusAwarded: 1 } }
          ]
        },
      },
      {
        $addFields: {
          totalEarnings: { $sum: '$transactions.amount' },
          totalReferrals: { $size: '$referrals' },
          referralBonus: { $sum: '$referrals.bonusAwarded' },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $ifNull: ['$totalEarnings', 0] }, 100] },
              { $multiply: [{ $ifNull: ['$referralBonus', 0] }, 100] },
              { $ifNull: ['$lifetimePoints', 0] },
              { $multiply: [{ $ifNull: ['$videoAdCount', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$viewAdsCount', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$spinCount', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$scratchCount', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$quizCount', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$articleReadCount', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$totalReferrals', 0] }, 50] }
            ]
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 50 }, // Cache top 50, slice per request
      {
        $project: {
          _id: 1,
          name: 1,
          phoneOrEmail: 1,
          profilePic: 1,
          score: 1,
          totalEarnings: 1,
          totalReferrals: 1,
          referralBonus: 1,
        },
      },
    ]);

    // Add rank
    const ranked = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    // Store in cache
    leaderboardCache = ranked;
    leaderboardCacheTime = now;

    res.json(ranked.slice(0, limit));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// Force-invalidate the cache (call after admin actions that affect scores)
exports.invalidateLeaderboardCache = () => {
  leaderboardCache = null;
  leaderboardCacheTime = 0;
};
