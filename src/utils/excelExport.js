import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'export') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportClientsToExcel = (clients) => {
  const exportData = clients.map(client => ({
    'Client Name': client.clientName,
    'Client Code': client.clientCode,
    'Contact Person': client.contactPerson,
    'Contact Details': client.contactDetails,
    'Email': client.email,
    'Website': client.website,
    'Billing Address': client.billingAddress,
    'GST Number': client.gstNumber,
    'PAN Number': client.panNumber,
    'Payment Terms': client.paymentTerms,
    'Credit Limit': client.creditLimit,
    'Bank Details': client.bankDetails,
    'Industry Type': client.industryType,
    'Client Category': client.clientCategory,
    'Contract Dates': client.contractDates,
    'Currency': client.currency,
    'Status': client.status,
    'Account Manager': client.accountManager
  }));
  
  exportToExcel(exportData, `clients_${new Date().toISOString().split('T')[0]}`);
};