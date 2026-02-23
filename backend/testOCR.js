require('dotenv').config();
const vision = require('@google-cloud/vision');

async function testOCR() {
  console.log('Testing Google Vision API...');
  console.log('API Key:', process.env.GOOGLE_OCR_KEY ? 'Present' : 'Missing');
  
  try {
    const client = new vision.ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_OCR_KEY
    });
    
    // Test with a simple text image (base64 encoded "TEST")
    const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    
    const request = {
      image: { content: testImage.toString('base64') },
      features: [{ type: 'TEXT_DETECTION' }]
    };
    
    const [result] = await client.annotateImage(request);
    console.log('✅ API Connection Successful!');
    console.log('Response:', result);
    
  } catch (error) {
    console.error('❌ API Connection Failed!');
    console.error('Error:', error.message);
    console.error('Details:', error);
  }
}

testOCR();
