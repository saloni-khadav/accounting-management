const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Real AI response function using Gemini API
const getAIResponse = async (message) => {
  try {
    // Try Gemini API first
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an AI assistant for an Accounting Management Dashboard. Answer accounting-related questions professionally and concisely. User question: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.log('Gemini API failed, using fallback response:', error.message);
    
    // Fallback responses
    const fallbackResponses = [
      "I'm your AI accounting assistant. I can help with GST, invoices, payments, and financial reports. What would you like to know?",
      "I can assist with accounting tasks like invoice management, GST compliance, and financial reporting. How may I help you?",
      "I'm here to help with your accounting needs. You can ask about payments, reports, or any financial management topic."
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await getAIResponse(message);
    
    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;