const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');

// Get all assets with filtering
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { assetName: { $regex: search, $options: 'i' } },
        { assetCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    const assets = await Asset.find(filter).sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single asset
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new asset
router.post('/', async (req, res) => {
  try {
    const asset = new Asset(req.body);
    const savedAsset = await asset.save();
    res.status(201).json(savedAsset);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Asset code already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update asset
router.put('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update asset status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;