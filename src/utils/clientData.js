import { generateClientData } from './geminiApi';

// Default fallback data
const fallbackData = [
  {
    name: 'Sun Corporation',
    email: 'john.doe@suncorp.com',
    phone: '9876543210',
    receivables: '₹ 86,450'
  },
  {
    name: 'Green Power Ltd.',
    email: 'info@greenpower.com',
    phone: '9123456780',
    receivables: '₹ 41,200'
  }
];

export const getClientsData = async () => {
  try {
    const aiData = await generateClientData();
    return JSON.parse(aiData);
  } catch (error) {
    console.error('Failed to generate AI data, using fallback:', error);
    return fallbackData;
  }
};

export const clientsData = fallbackData;