// Import/Export utility functions

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  
  return data;
};

export const exportToCSV = (data, filename) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header] || '').join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const validateImportData = (data, dataType) => {
  const validationRules = {
    bills: ['vendor_name', 'gstin', 'bill_no', 'bill_date', 'due_date', 'item_name', 'hsn_sac', 'qty', 'rate', 'tax_percent', 'total_amount'],
    vendors: ['vendor_name', 'gstin', 'pan', 'phone', 'email', 'address', 'city', 'state', 'postal_code', 'payment_terms'],
    bankstatements: ['transaction_date', 'description', 'amount', 'balance', 'utr_number'],
    purchaseorders: ['po_number', 'vendor', 'po_date', 'delivery_date', 'item', 'qty', 'rate', 'tax_percent']
  };
  
  const requiredFields = validationRules[dataType] || [];
  const errors = [];
  
  if (!data.length) {
    errors.push('No data found in file');
    return { isValid: false, errors };
  }
  
  const headers = Object.keys(data[0]);
  const missingFields = requiredFields.filter(field => !headers.includes(field));
  
  if (missingFields.length) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.slice(0, 10)
  };
};

export const generateTemplate = (dataType) => {
  const templates = {
    bills: [{
      vendor_name: 'ABC Suppliers Ltd', gstin: '29ABCDE1234F1Z5', bill_no: 'BILL001',
      bill_date: '2024-01-01', due_date: '2024-01-31', item_name: 'Office Supplies',
      hsn_sac: '9963', qty: '10', rate: '100.00', tax_percent: '18', total_amount: '1180.00'
    }],
    vendors: [{
      vendor_name: 'XYZ Suppliers Ltd', gstin: '29ABCDE1234F1Z5', pan: 'ABCDE1234F',
      phone: '9876543210', email: 'contact@xyz.com', address: '123 Business Street',
      city: 'Mumbai', state: 'Maharashtra', postal_code: '400001',
      payment_terms: '30 Days', credit_limit: '100000', account_no: '1234567890',
      ifsc: 'HDFC0000123'
    }],
    bankstatements: [{
      transaction_date: '2024-01-01', description: 'Payment to ABC Suppliers',
      amount: '10000.00', balance: '50000.00', utr_number: 'UTR123456789'
    }],
    purchaseorders: [{
      po_number: 'PO001', vendor: 'ABC Suppliers', po_date: '2024-01-01',
      delivery_date: '2024-01-15', item: 'Raw Materials', qty: '100',
      rate: '50.00', tax_percent: '18'
    }],
    apreports: [{
      vendor_name: 'ABC Suppliers', total_bills: '5', paid_amount: '45000.00',
      pending_amount: '15000.00', overdue_amount: '5000.00'
    }],
    tdsreports: [{
      vendor_name: 'ABC Suppliers', tds_section: '194C', bill_amount: '100000.00',
      tds_rate: '1.00', tds_amount: '1000.00', month: 'January 2024'
    }],
    paymentruns: [{
      vendor_name: 'ABC Suppliers Ltd', account_no: '1234567890',
      ifsc: 'HDFC0000123', amount: '25000.00', remarks: 'Bill Payment - BILL001'
    }]
  };
  
  return templates[dataType] || [];
};