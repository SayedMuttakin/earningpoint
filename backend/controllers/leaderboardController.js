const User = require('../models/User');
const Referral = require('../models/Referral');
const Transaction = require('../models/Transaction');

// GET /api/leaderboard — Get top earners
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Aggregate scores: total transaction earnings + referral bonuses
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'userId',
          as: 'transactions',
        },
      },
      {
        $lookup: {
          from: 'referrals',
          localField: '_id',
          foreignField: 'referrerId',
          as: 'referrals',
        },
      },
      {
        $addFields: {
          totalEarnings: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$transactions',
                    as: 'tx',
                    cond: { $eq: ['$$tx.status', 'completed'] },
                  },
                },
                as: 'tx',
                in: '$$tx.amount',
              },
            },
          },
          totalReferrals: { $size: '$referrals' },
          referralBonus: {
            $sum: '$referrals.bonusAwarded',
          },
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
      { $limit: limit },
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

    res.json(ranked);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
