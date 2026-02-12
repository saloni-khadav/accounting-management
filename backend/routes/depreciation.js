const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const DepreciationHistory = require('../models/DepreciationHistory');

// Calculate depreciation for a specific asset
const calculateDepreciation = (asset, method = null) => {
  const depMethod = method || asset.depreciationMethod || 'straight-line';
  const purchaseValue = asset.purchaseValue;
  const salvageValue = asset.salvageValue || 0;
  const usefulLife = asset.usefulLife || 5; // Default 5 years
  const depreciableAmount = purchaseValue - salvageValue;
  
  let monthlyDepreciation = 0;
  
  switch (depMethod) {
    case 'straight-line':
      monthlyDepreciation = depreciableAmount / (usefulLife * 12);
      break;
    case 'declining-balance':
      const rate = 2 / usefulLife; // Double declining balance
      const currentValue = purchaseValue - (asset.accumulatedDepreciation || 0);
      monthlyDepreciation = (currentValue * rate) / 12;
      break;
    case 'sum-of-years':
      const totalMonths = usefulLife * 12;
      const elapsedMonths = Math.floor((asset.accumulatedDepreciation || 0) / (depreciableAmount / totalMonths));
      const remainingMonths = totalMonths - elapsedMonths;
      const sumOfMonths = (totalMonths * (totalMonths + 1)) / 2;
      monthlyDepreciation = (depreciableAmount * remainingMonths) / sumOfMonths;
      break;
    case 'units-of-production':
      // For simplicity, using straight-line as fallback
      monthlyDepreciation = depreciableAmount / (usefulLife * 12);
      break;
    default:
      monthlyDepreciation = depreciableAmount / (usefulLife * 12);
  }
  
  return Math.max(0, monthlyDepreciation);
};

// Calculate depreciation for specific asset or all assets
router.post('/calculate', async (req, res) => {
  try {
    const { assetId, method } = req.body;
    
    let assets;
    if (assetId) {
      const asset = await Asset.findById(assetId);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      assets = [asset];
    } else {
      assets = await Asset.find({ status: 'Active' });
    }
    
    const results = assets.map(asset => {
      const monthlyDep = calculateDepreciation(asset, method);
      const accumulated = asset.accumulatedDepreciation || 0;
      const netValue = asset.purchaseValue - accumulated;
      
      return {
        assetId: asset._id,
        assetCode: asset.assetCode,
        assetName: asset.assetName,
        purchaseValue: asset.purchaseValue,
        monthlyDepreciation: Math.round(monthlyDep),
        accumulatedDepreciation: accumulated,
        netBookValue: netValue,
        method: method || asset.depreciationMethod
      };
    });
    
    res.json({
      message: 'Depreciation calculated successfully',
      count: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Run monthly depreciation for all active assets
router.post('/run-monthly', async (req, res) => {
  try {
    const { month, year } = req.body;
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();
    
    const assets = await Asset.find({ status: 'Active' });
    const results = [];
    const errors = [];
    
    for (const asset of assets) {
      try {
        // Check if depreciation already run for this period
        const existing = await DepreciationHistory.findOne({
          assetId: asset._id,
          'period.month': targetMonth,
          'period.year': targetYear
        });
        
        if (existing) {
          errors.push({
            assetCode: asset.assetCode,
            message: 'Depreciation already run for this period'
          });
          continue;
        }
        
        const monthlyDep = calculateDepreciation(asset);
        const openingValue = asset.purchaseValue - (asset.accumulatedDepreciation || 0);
        const newAccumulated = (asset.accumulatedDepreciation || 0) + monthlyDep;
        const closingValue = asset.purchaseValue - newAccumulated;
        
        // Create depreciation history entry
        const history = new DepreciationHistory({
          assetId: asset._id,
          assetCode: asset.assetCode,
          assetName: asset.assetName,
          period: { month: targetMonth, year: targetYear },
          openingValue: Math.round(openingValue),
          depreciationAmount: Math.round(monthlyDep),
          accumulatedDepreciation: Math.round(newAccumulated),
          closingValue: Math.round(closingValue),
          method: asset.depreciationMethod || 'straight-line'
        });
        
        await history.save();
        
        // Update asset accumulated depreciation
        asset.accumulatedDepreciation = newAccumulated;
        asset.currentValue = closingValue;
        await asset.save();
        
        results.push({
          assetCode: asset.assetCode,
          assetName: asset.assetName,
          depreciationAmount: Math.round(monthlyDep),
          newAccumulated: Math.round(newAccumulated)
        });
      } catch (error) {
        errors.push({
          assetCode: asset.assetCode,
          message: error.message
        });
      }
    }
    
    res.json({
      message: 'Monthly depreciation run completed',
      period: { month: targetMonth, year: targetYear },
      processed: results.length,
      errors: errors.length,
      results,
      errors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get depreciation history
router.get('/history', async (req, res) => {
  try {
    const { assetId, year, month } = req.query;
    let filter = {};
    
    if (assetId) filter.assetId = assetId;
    if (year) filter['period.year'] = parseInt(year);
    if (month) filter['period.month'] = parseInt(month);
    
    const history = await DepreciationHistory.find(filter)
      .sort({ 'period.year': -1, 'period.month': -1 })
      .populate('assetId', 'assetName assetCode category');
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get depreciation schedule for an asset
router.get('/schedule/:assetId', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    const usefulLife = asset.usefulLife || 5;
    const purchaseValue = asset.purchaseValue;
    const salvageValue = asset.salvageValue || 0;
    const depreciableAmount = purchaseValue - salvageValue;
    const annualDepreciation = depreciableAmount / usefulLife;
    
    const schedule = [];
    let accumulated = 0;
    
    for (let year = 1; year <= usefulLife; year++) {
      accumulated += annualDepreciation;
      const opening = purchaseValue - (accumulated - annualDepreciation);
      const closing = purchaseValue - accumulated;
      
      schedule.push({
        year: `Year ${year}`,
        opening: Math.round(opening),
        depreciation: Math.round(annualDepreciation),
        accumulated: Math.round(accumulated),
        closing: Math.round(closing),
        rate: ((annualDepreciation / purchaseValue) * 100).toFixed(2)
      });
    }
    
    res.json({
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      purchaseValue,
      salvageValue,
      usefulLife,
      method: asset.depreciationMethod,
      schedule
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get depreciation summary
router.get('/summary', async (req, res) => {
  try {
    const assets = await Asset.find({ status: 'Active' });
    
    let monthlyTotal = 0;
    let accumulatedTotal = 0;
    let totalValue = 0;
    
    assets.forEach(asset => {
      const monthlyDep = calculateDepreciation(asset);
      monthlyTotal += monthlyDep;
      accumulatedTotal += asset.accumulatedDepreciation || 0;
      totalValue += asset.purchaseValue;
    });
    
    // Get YTD depreciation from history
    const currentYear = new Date().getFullYear();
    const ytdHistory = await DepreciationHistory.aggregate([
      { $match: { 'period.year': currentYear } },
      { $group: { _id: null, total: { $sum: '$depreciationAmount' } } }
    ]);
    
    const ytdTotal = ytdHistory.length > 0 ? ytdHistory[0].total : 0;
    
    res.json({
      monthlyTotal: Math.round(monthlyTotal),
      ytdTotal: Math.round(ytdTotal),
      accumulatedTotal: Math.round(accumulatedTotal),
      netBookValue: Math.round(totalValue - accumulatedTotal),
      totalAssets: assets.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly depreciation trend
router.get('/trend', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const monthlyData = await DepreciationHistory.aggregate([
      { $match: { 'period.year': targetYear } },
      {
        $group: {
          _id: '$period.month',
          depreciation: { $sum: '$depreciationAmount' },
          accumulated: { $max: '$accumulatedDepreciation' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = months.map((month, index) => {
      const data = monthlyData.find(d => d._id === index + 1);
      return {
        month,
        depreciation: data ? Math.round(data.depreciation) : 0,
        accumulated: data ? Math.round(data.accumulated) : 0
      };
    });
    
    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
