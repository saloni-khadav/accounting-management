import * as XLSX from 'xlsx';

export const importClientsFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const clients = jsonData
          .filter(row => row['Client Name'] && row['Client Code']) // Skip empty rows
          .map(row => {
            const client = {
              clientCode: row['Client Code']?.toString().trim() || '',
              clientName: row['Client Name']?.toString().trim() || ''
            };

            // Add optional fields only if they have values
            if (row['Contact Person']) client.contactPerson = row['Contact Person'].toString().trim();
            if (row['Contact Details']) client.contactDetails = row['Contact Details'].toString().trim();
            if (row['Email']) client.email = row['Email'].toString().trim();
            if (row['Website']) client.website = row['Website'].toString().trim();
            if (row['Billing Address']) client.billingAddress = row['Billing Address'].toString().trim();
            if (row['GST Number']) client.gstNumber = row['GST Number'].toString().trim();
            if (row['PAN Number']) client.panNumber = row['PAN Number'].toString().trim().toUpperCase();
            if (row['Aadhar Number']) client.aadharNumber = row['Aadhar Number'].toString().trim();
            if (row['Account Number']) client.accountNumber = row['Account Number'].toString().trim();
            if (row['IFSC Code']) client.ifscCode = row['IFSC Code'].toString().trim().toUpperCase();
            if (row['Bank Name']) client.bankName = row['Bank Name'].toString().trim();
            if (row['Account Manager']) client.accountManager = row['Account Manager'].toString().trim();

            // Currency and Status with defaults
            client.currency = row['Currency']?.toString().trim() || 'INR';
            client.status = row['Status']?.toString().trim() || 'Active';

            // Only add enum fields if they have valid values
            const paymentTerms = row['Payment Terms']?.toString().trim();
            if (paymentTerms) {
              client.paymentTerms = paymentTerms;
            }

            const industryType = row['Industry Type']?.toString().trim();
            if (industryType) {
              client.industryType = industryType;
            }

            const clientCategory = row['Client Category']?.toString().trim();
            if (clientCategory) {
              client.clientCategory = clientCategory;
            }

            // Handle numeric fields
            const creditLimit = row['Credit Limit'];
            if (creditLimit && !isNaN(creditLimit)) {
              client.creditLimit = Number(creditLimit);
            }

            // Handle dates
            if (row['Contract Start Date']) {
              const startDate = row['Contract Start Date'];
              if (typeof startDate === 'number') {
                // Excel serial date number
                const excelEpoch = new Date(1899, 11, 30);
                const date = new Date(excelEpoch.getTime() + startDate * 86400000);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                client.contractStartDate = `${year}-${month}-${day}`;
              } else if (startDate instanceof Date) {
                const year = startDate.getFullYear();
                const month = String(startDate.getMonth() + 1).padStart(2, '0');
                const day = String(startDate.getDate()).padStart(2, '0');
                client.contractStartDate = `${year}-${month}-${day}`;
              } else {
                client.contractStartDate = startDate.toString();
              }
            }
            if (row['Contract End Date']) {
              const endDate = row['Contract End Date'];
              if (typeof endDate === 'number') {
                // Excel serial date number
                const excelEpoch = new Date(1899, 11, 30);
                const date = new Date(excelEpoch.getTime() + endDate * 86400000);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                client.contractEndDate = `${year}-${month}-${day}`;
              } else if (endDate instanceof Date) {
                const year = endDate.getFullYear();
                const month = String(endDate.getMonth() + 1).padStart(2, '0');
                const day = String(endDate.getDate()).padStart(2, '0');
                client.contractEndDate = `${year}-${month}-${day}`;
              } else {
                client.contractEndDate = endDate.toString();
              }
            }

            return client;
          });
        
        resolve(clients);
      } catch (error) {
        reject(new Error('Error parsing Excel file: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};
