const PeriodPermission = require('../models/PeriodPermission');

const checkPeriodPermission = (section) => {
  return async (req, res, next) => {
    try {
      console.log('=== PERIOD PERMISSION MIDDLEWARE ===');
      console.log('Section:', section);
      console.log('req.body keys:', Object.keys(req.body));
      console.log('req.body:', JSON.stringify(req.body, null, 2));
      
      const entryDate = req.body.date || req.body.billDate || req.body.invoiceDate || req.body.paymentDate || req.body.collectionDate || req.body.poDate || req.body.transactionDate || req.body.noteDate || req.body.purchaseDate || req.body.creditNoteDate || req.body.uploadDate || req.body.piDate || req.body.contractStartDate;
      
      console.log('Period Permission Check:', { section, entryDate });
      
      if (!entryDate) {
        console.log('No date found, allowing entry');
        return next();
      }

      const dateToCheck = new Date(entryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateToCheck.setHours(0, 0, 0, 0);

      console.log('Date comparison:', { dateToCheck, today, isPast: dateToCheck < today });

      // If date is today or future, allow
      if (dateToCheck >= today) {
        console.log('Future/Today date, allowing entry');
        return next();
      }

      // Past date - check permission
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      
      if (!user) {
        console.log('User not found');
        return res.status(403).json({ 
          message: 'User not found',
          isPastDateError: true
        });
      }

      console.log('User:', { username: user.workEmail });

      const permission = await PeriodPermission.findOne({
        username: user.workEmail,
        section,
        isActive: true,
        startDate: { $lte: dateToCheck },
        endDate: { $gte: dateToCheck }
      });

      console.log('Permission found:', permission ? 'YES' : 'NO');

      if (!permission) {
        console.log('BLOCKING past date entry');
        return res.status(403).json({ 
          message: 'Past date entry not allowed. Contact manager for permission.',
          isPastDateError: true
        });
      }

      console.log('Permission granted, allowing past date entry');
      next();
    } catch (error) {
      console.error('Error in checkPeriodPermission:', error);
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = checkPeriodPermission;
