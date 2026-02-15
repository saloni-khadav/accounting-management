import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'export') => {
  // Check if data is an object with multiple sheets or simple array
  if (Array.isArray(data)) {
    // Simple array - single sheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } else {
    // Object with multiple sheets
    const workbook = XLSX.utils.book_new();
    
    Object.keys(data).forEach(sheetName => {
      const worksheet = XLSX.utils.json_to_sheet(data[sheetName]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
};

export const exportClientsToExcel = (clients, filename) => {
  const exportData = clients.map(client => ({
    'Client Code': client['Client Code'] || client.clientCode || '',
    'Client Name': client['Client Name'] || client.clientName || '',
    'Contact Person': client['Contact Person'] || client.contactPerson || '',
    'Contact Details': client['Contact Details'] || client.contactDetails || '',
    'Email': client['Email'] || client.email || '',
    'Website': client['Website'] || client.website || '',
    'Billing Address': client['Billing Address'] || client.billingAddress || '',
    'GST Number': client['GST Number'] || client.gstNumber || '',
    'PAN Number': client['PAN Number'] || client.panNumber || '',
    'Aadhar Number': client['Aadhar Number'] || client.aadharNumber || '',
    'Payment Terms': client['Payment Terms'] || client.paymentTerms || '',
    'Credit Limit': client['Credit Limit'] || client.creditLimit || '',
    'Account Number': client['Account Number'] || client.accountNumber || client.bankDetails || '',
    'IFSC Code': client['IFSC Code'] || client.ifscCode || '',
    'Bank Name': client['Bank Name'] || client.bankName || '',
    'Industry Type': client['Industry Type'] || client.industryType || '',
    'Client Category': client['Client Category'] || client.clientCategory || '',
    'Contract Start Date': client['Contract Start Date'] || (client.contractStartDate ? new Date(client.contractStartDate).toLocaleDateString() : ''),
    'Contract End Date': client['Contract End Date'] || (client.contractEndDate ? new Date(client.contractEndDate).toLocaleDateString() : ''),
    'Currency': client['Currency'] || client.currency || '',
    'Status': client['Status'] || client.status || '',
    'Account Manager': client['Account Manager'] || client.accountManager || '',
    ...(client.REMARKS || client.remarks ? { 'REMARKS': client.REMARKS || client.remarks } : {})
  }));
  
  exportToExcel(exportData, filename || `clients_${new Date().toISOString().split('T')[0]}`);
};