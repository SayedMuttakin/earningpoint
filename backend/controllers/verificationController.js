const Verification = require('../models/Verification');
const AdminNotification = require('../models/AdminNotification');

// GET /api/verification — Get user's verification status
exports.getVerificationStatus = async (req, res) => {
  try {
    const verification = await Verification.findOne({ userId: req.user._id });
    if (!verification) {
      return res.json({ status: 'not_submitted', verification: null });
    }
    res.json({ status: verification.status, verification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// POST /api/verification — Submit verification documents
exports.submitVerification = async (req, res) => {
  try {
    const { country, documentType, frontImage, backImage, selfieImage } = req.body;

    if (!country || !documentType) {
      return res.status(400).json({ message: 'Country and document type are required' });
    }

    // Check if already submitted
    const existing = await Verification.findOne({ userId: req.user._id });
    if (existing) {
      // Update existing
      existing.country = country;
      existing.documentType = documentType;
      if (frontImage) existing.frontImage = frontImage;
      if (backImage) existing.backImage = backImage;
      if (selfieImage) existing.selfieImage = selfieImage;
      existing.status = 'pending';
      await existing.save();

      // Notify admin
      await AdminNotification.create({
        title: 'Verification Resubmitted 📝',
        message: `User ${req.user.name || 'User'} has resubmitted their verification documents.`,
        type: 'verification',
        referenceId: existing._id.toString()
      });

      return res.json({ message: 'Verification updated', verification: existing });
    }

    const verification = await Verification.create({
      userId: req.user._id,
      country,
      documentType,
      frontImage: frontImage || '',
      backImage: backImage || '',
      selfieImage: selfieImage || '',
    });

    // Notify admin
    await AdminNotification.create({
      title: 'New Verification Request 📝',
      message: `User ${req.user.name || 'User'} has submitted verification documents.`,
      type: 'verification',
      referenceId: verification._id.toString()
    });

    res.status(201).json({ message: 'Verification submitted', verification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
