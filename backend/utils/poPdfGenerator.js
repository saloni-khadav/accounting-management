const puppeteer = require('puppeteer');

const generatePurchaseOrderPDF = async (poData, companyProfile = {}, returnBase64 = false) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: Arial, sans-serif; font-size: 9pt; line-height: 1.4; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .header h2 { margin: 0; font-size: 14pt; }
        .header p { margin: 5px 0; font-size: 10pt; }
        .row { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .col { flex: 1; padding: 0 10px; }
        .label { font-weight: bold; display: inline-block; min-width: 120px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 8pt; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; }
        .text-right { text-align: right; }
        .total-row { font-weight: bold; font-size: 10pt; margin-top: 10px; text-align: right; }
        .footer { position: fixed; bottom: 10mm; left: 15mm; right: 15mm; font-size: 7pt; text-align: center; color: #666; border-top: 1px solid #ccc; padding-top: 5px; }
        .page-break { page-break-after: always; }
        .terms { font-size: 7pt; text-align: justify; margin-top: 10px; line-height: 1.3; }
        .terms p { margin: 5px 0; }
        .signature-section { margin-top: 80px; display: flex; justify-content: space-between; }
        .signature-box { text-align: center; }
      </style>
    </head>
    <body>
      <!-- Page 1 -->
      <div class="header">
        <h2>||||| |||||</h2>
        <p>GENERAL PURCHASE ORDER</p>
      </div>
      
      <div class="row">
        <div class="col">
          <div><span class="label">To:</span> ${poData.supplier || ''}</div>
          <div><span class="label">Address:</span> ${poData.deliveryAddress || ''}</div>
          <div><span class="label">GSTIN/UIN:</span> ${poData.gstNumber || ''}</div>
          <div><span class="label">Pan Number:</span></div>
          <div><span class="label">Place of Supplier:</span></div>
        </div>
        <div class="col">
          <div><span class="label">Order No:</span> ${poData.poNumber || ''}</div>
          <div><span class="label">Order Date:</span> ${poData.poDate ? new Date(poData.poDate).toLocaleDateString('en-GB') : ''}</div>
          <div><span class="label">Name:</span> ${companyProfile.tradeName || 'ECOAGRITEK AI SOLUTIONS PRIVATE LIMITED'}</div>
          <div><span class="label">Our Address:</span> ${companyProfile.address || 'Plot 549-1017-1159, Nurugan, Pattamundai, Madan Pur, Kendrapara, Odisha, 754246'}</div>
          <div><span class="label">GSTIN:</span> ${companyProfile.gstNumber || ''}</div>
          <div><span class="label">PAN:</span> ${companyProfile.panNumber || ''}</div>
          <div><span class="label">Place of Supply:</span> [06 - Haryana]</div>
          <div><span class="label">Business unit:</span> Agritek - Ecom</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item Number</th>
            <th>Description</th>
            <th>HSN/SAC</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${poData.items?.map(item => `
            <tr>
              <td>${item.name || ''}</td>
              <td>${item.name || ''}</td>
              <td>${item.hsn || ''}</td>
              <td class="text-right">${item.quantity || 0}</td>
              <td class="text-right">₹${(item.rate || 0).toFixed(2)}</td>
              <td class="text-right">₹${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</td>
            </tr>
          `).join('') || ''}
        </tbody>
      </table>
      
      <div class="total-row">
        <div>IGST @ 12%: ₹${(poData.totalTax || 0).toFixed(2)}</div>
        <div style="font-size: 12pt; margin-top: 5px;">Grand Total: ₹${(poData.totalAmount || 0).toFixed(2)}</div>
      </div>
      
      <div style="margin-top: 20px; font-size: 8pt;">
        <div>CIN: U01611OD2025PTC051238</div>
        <div style="margin-top: 10px; font-size: 7pt;">
          <div>* Please attach a DUPLICATE copy of our order along with Photograph/delivery challan to your bill.</div>
          <div>* Your bills should be sent to us in TRIPLICATE which needs to be approved by our servicing person.</div>
          <div>* All bills against this PO are to be submitted within 7 working days from PO receipt; failing which the Order shall stand cancelled.</div>
        </div>
      </div>
      
      <div class="terms">
        <strong>This purchase order is subject to following Terms & conditions:</strong><br/>
        1. Definitions. Capitalized terms have the following meanings: (a) "Goods" means the goods, services and other items to be supplied to Purchaser by Supplier under this Purchase Order; (b) "Purchase Order" means the written or electronic order for Goods as is attached herewith; (c) "Purchaser" means the Purchaser issuing this Purchase Order (d) "Specified" means as specified in the Purchase Order; and (e) "Supplier" means the individual or entity specified in the Purchase Order as the supplier.
      </div>
      
      <div class="footer">
        <div>${companyProfile.tradeName || 'ECOAGRITEK AI SOLUTIONS PRIVATE LIMITED'} | Page 1 of 6</div>
        <div>PLOT NO 63, GALI NO 1 SATGURU ENCLAVE MOLLAHERA BLOCK C, OPP Maruti Gate No.1, Gurugram, Haryana, 122015</div>
        <div>Email: Finance@agritek.co.in | Web: https://agritek.co.in/ | Phone: +91 94380 31457</div>
      </div>
      
      <div class="page-break"></div>
      
      <!-- Page 2-5: Terms and Conditions -->
      <div class="terms">
        <p>2. Order, Price and Payment. This Order is being placed by the Purchaser on behalf of its Client and the payments are subject to satisfactory deliverables and proper submission of bills.</p>
        <p>3. Delivery. Time is of the essence in Supplier's performance under this Purchase Order.</p>
        <p>4. Inspection. Purchaser may inspect the Goods at any time.</p>
        <p>5. Acceptance. Supplier will be deemed to have accepted all provisions of the Purchase Order unless he reverts with his Non acceptance within 3 days.</p>
        <p>6. Validity of Purchase Order. The validity of this Purchase Order is 6 months from the date of issue.</p>
      </div>
      <div class="footer">Page 2 of 6</div>
      <div class="page-break"></div>
      
      <div class="terms">
        <p>7. Representations and Warranties. Supplier represents and warrants that the Goods are free from defects.</p>
        <p>8. Rejection and other Remedies. If the Goods do not strictly comply with the requirements of the Purchase Order, Purchaser may reject them.</p>
      </div>
      <div class="footer">Page 3 of 6</div>
      <div class="page-break"></div>
      
      <div class="terms">
        <p>9. Manpower. The Supplier shall be entirely responsible for deployment of man power services.</p>
        <p>10. Defense and Indemnity. Supplier will defend and indemnify Purchaser from any allegation or claim.</p>
      </div>
      <div class="footer">Page 4 of 6</div>
      <div class="page-break"></div>
      
      <div class="terms">
        <p>11. Insurance. Supplier will maintain insurance policies.</p>
        <p>12. Confidential Information. Supplier and its representatives will keep confidential the terms and existence of this Purchase Order.</p>
      </div>
      <div class="footer">Page 5 of 6</div>
      <div class="page-break"></div>
      
      <!-- Page 6: Signatures -->
      <div class="signature-section">
        <div class="signature-box">
          <div>For ${poData.supplier || 'Vendor'}</div>
          <div style="margin-top: 60px; border-top: 1px solid #000; padding-top: 5px;">Authorized Signatory</div>
        </div>
        <div class="signature-box">
          <div>ECOAGRITEK AI SOLUTIONS PRIVATE LIMITED</div>
          <div style="margin-top: 60px; border-top: 1px solid #000; padding-top: 5px;">(Authorized Signatory)</div>
        </div>
      </div>
      <div class="footer">Page 6 of 6</div>
    </body>
    </html>
  `;
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '15mm', bottom: '20mm', left: '15mm' }
  });
  
  await browser.close();
  
  if (returnBase64) {
    return pdfBuffer.toString('base64');
  }
  return pdfBuffer;
};

module.exports = { generatePurchaseOrderPDF };
