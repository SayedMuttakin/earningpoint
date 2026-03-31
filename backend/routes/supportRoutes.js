const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTickets, createTicket, getTicketById } = require('../controllers/supportController');

router.get('/', protect, getTickets);
router.post('/', protect, createTicket);
router.get('/:id', protect, getTicketById);

module.exports = router;
