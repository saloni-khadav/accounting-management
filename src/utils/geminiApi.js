import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export const generateAccountingData = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateInvoiceData = async () => {
  const prompt = `Generate realistic invoice data in JSON format with these fields:
  {
    "invoiceNumber": "INV001",
    "customerName": "Company Name",
    "date": "2024-01-01",
    "dueDate": "2024-01-31",
    "items": [
      {
        "name": "Product/Service",
        "hsn": "1234",
        "quantity": 1,
        "rate": 1000,
        "amount": 1000
      }
    ],
    "subtotal": 1000,
    "tax": 180,
    "total": 1180
  }
  Return only valid JSON, no extra text.`;
  
  return await generateAccountingData(prompt);
};

export const generateClientData = async () => {
  const prompt = `Generate 5 realistic client companies in JSON array format:
  [
    {
      "name": "Company Name",
      "email": "contact@company.com", 
      "phone": "9876543210",
      "receivables": "₹ 50,000"
    }
  ]
  Return only valid JSON array, no extra text.`;
  
  return await generateAccountingData(prompt);
};