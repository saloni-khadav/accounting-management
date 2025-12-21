const express = require('express');
const Client = require('../models/Client');
const router = express.Router();

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new client
router.post('/', async (req, res) => {
  try {
    const client = new Client(req.body);
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Client code already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search clients
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const clients = await Client.find({
      $or: [
        { clientName: { $regex: searchTerm, $options: 'i' } },
        { clientCode: { $regex: searchTerm, $options: 'i' } },
        { contactPerson: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;