const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');

// Leaderboard is public — no auth needed
router.get('/', getLeaderboard);

module.exports = router;
