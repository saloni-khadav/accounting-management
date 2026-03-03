const htmlPdf = require('html-pdf-node');

const generateInvoicePDF = async (invoice) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; }
        .info-section { margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #2563eb; color: white; }
        .total-section { margin-top: 20px; text-align: right; }
        .total-row { margin: 5px 0; }
        .grand-total { font-size: 18px; font-weight: bold; color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>TAX INVOICE</h1>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <div><span class="label">Invoice Number:</span> ${invoice.invoiceNumber}</div>
          <div><span class="label">Date:</span> ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</div>
        </div>
        ${invoice.piNumber ? `<div class="info-row"><div><span class="label">PI Number:</span> ${invoice.piNumber}</div></div>` : ''}
      </div>
      
      <div class="info-section">
        <h3>Supplier Details</h3>
        <div><span class="label">Name:</span> ${invoice.supplierName}</div>
        <div><span class="label">Address:</span> ${invoice.supplierAddress}</div>
        <div><span class="label">GSTIN:</span> ${invoice.supplierGSTIN}</div>
        <div><span class="label">PAN:</span> ${invoice.supplierPAN}</div>
      </div>
      
      <div class="info-section">
        <h3>Customer Details</h3>
        <div><span class="label">Name:</span> ${invoice.customerName}</div>
        <div><span class="label">Address:</span> ${invoice.customerAddress}</div>
        ${invoice.customerGSTIN ? `<div><span class="label">GSTIN:</span> ${invoice.customerGSTIN}</div>` : ''}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Description</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Taxable Value</th>
            <th>CGST</th>
            <th>SGST</th>
            <th>IGST</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.description || item.product || ''}</td>
              <td>${item.hsnCode}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unitPrice.toFixed(2)}</td>
              <td>₹${item.taxableValue.toFixed(2)}</td>
              <td>${item.cgstRate}%<br/>₹${item.cgstAmount.toFixed(2)}</td>
              <td>${item.sgstRate}%<br/>₹${item.sgstAmount.toFixed(2)}</td>
              <td>${item.igstRate}%<br/>₹${item.igstAmount.toFixed(2)}</td>
              <td>₹${item.totalAmount.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row"><span class="label">Subtotal:</span> ₹${invoice.subtotal.toFixed(2)}</div>
        <div class="total-row"><span class="label">Total Discount:</span> ₹${invoice.totalDiscount.toFixed(2)}</div>
        <div class="total-row"><span class="label">Taxable Value:</span> ₹${invoice.totalTaxableValue.toFixed(2)}</div>
        <div class="total-row"><span class="label">CGST:</span> ₹${invoice.totalCGST.toFixed(2)}</div>
        <div class="total-row"><span class="label">SGST:</span> ₹${invoice.totalSGST.toFixed(2)}</div>
        <div class="total-row"><span class="label">IGST:</span> ₹${invoice.totalIGST.toFixed(2)}</div>
        <div class="total-row"><span class="label">Total Tax:</span> ₹${invoice.totalTax.toFixed(2)}</div>
        <div class="total-row grand-total"><span class="label">Grand Total:</span> ₹${invoice.grandTotal.toFixed(2)}</div>
      </div>
      
      ${invoice.notes ? `<div style="margin-top: 30px;"><span class="label">Notes:</span><br/>${invoice.notes}</div>` : ''}
    </body>
    </html>
  `;

  const options = { format: 'A4' };
  const file = { content: html };
  
  const pdfBuffer = await htmlPdf.generatePdf(file, options);
  return pdfBuffer;
};

module.exports = generateInvoicePDF;
