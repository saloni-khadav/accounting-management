const htmlPdf = require('html-pdf-node');

const generateProformaPDF = async (po) => {
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
        <h1>PROFORMA INVOICE</h1>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <div><span class="label">PI Number:</span> ${po.piNumber || po.poNumber}</div>
          <div><span class="label">Date:</span> ${new Date(po.piDate || po.poDate).toLocaleDateString('en-IN')}</div>
        </div>
        ${po.deliveryDate ? `<div class="info-row"><div><span class="label">Delivery Date:</span> ${new Date(po.deliveryDate).toLocaleDateString('en-IN')}</div></div>` : ''}
      </div>
      
      <div class="info-section">
        <h3>Customer Details</h3>
        <div><span class="label">Name:</span> ${po.supplierName}</div>
        ${po.gstNumber ? `<div><span class="label">GST Number:</span> ${po.gstNumber}</div>` : ''}
        ${po.deliveryAddress ? `<div><span class="label">Delivery Address:</span> ${po.deliveryAddress}</div>` : ''}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Item Name</th>
            <th>HSN/SAC</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Discount%</th>
            <th>CGST%</th>
            <th>SGST%</th>
            <th>IGST%</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${po.items.map((item, index) => {
            const itemTotal = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100) + 
                             (((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100)) * ((item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0)) / 100);
            return `
            <tr>
              <td>${index + 1}</td>
              <td>${item.name}</td>
              <td>${item.hsn}</td>
              <td>${item.quantity}</td>
              <td>₹${item.rate.toFixed(2)}</td>
              <td>${item.discount}%</td>
              <td>${item.cgstRate || 0}%</td>
              <td>${item.sgstRate || 0}%</td>
              <td>${item.igstRate || 0}%</td>
              <td>₹${itemTotal.toFixed(2)}</td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row"><span class="label">Sub Total:</span> ₹${po.subTotal.toFixed(2)}</div>
        <div class="total-row"><span class="label">Total Discount:</span> ₹${po.totalDiscount.toFixed(2)}</div>
        <div class="total-row"><span class="label">Total Tax:</span> ₹${po.totalTax.toFixed(2)}</div>
        <div class="total-row grand-total"><span class="label">Total Amount:</span> ₹${po.totalAmount.toFixed(2)}</div>
      </div>
    </body>
    </html>
  `;

  const options = { format: 'A4' };
  const file = { content: html };
  
  const pdfBuffer = await htmlPdf.generatePdf(file, options);
  return pdfBuffer;
};

module.exports = generateProformaPDF;
