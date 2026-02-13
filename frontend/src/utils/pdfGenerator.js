import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateTaxInvoicePDF = (invoiceData) => {
  const doc = new jsPDF();
  
  // Title - Tax Invoice (centered)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Invoice', 105, 20, { align: 'center' });
  
  // Company Details - Left Side
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Sold By: Shreyash Retail Private Limited', 20, 35);
  
  // QR Code placeholder - Right Side
  doc.rect(160, 30, 25, 25, 'S'); // QR code box
  doc.setFontSize(8);
  doc.text('QR Code', 167, 45);
  
  // Company Address
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Ship-from Address: Ground Floor in building known as Shri Aditram Compound, Near Arivala Mod, Old Delhi Road, Dundahera', 20, 42);
  doc.text('Gurugram, Haryana-122016, Gurugram, HARYANA, India - 122016, IN-HR', 20, 47);
  
  // GSTIN and FSSAI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('GSTIN - 06AAXCS0655F1ZZ', 20, 55);
  doc.text('FSSAI License No - 13321999000230', 20, 62);
  
  // Invoice Number Box - Right Side
  doc.rect(120, 60, 70, 15, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice Number # ${invoiceData.invoiceNumber || 'FAT20326517264441'}`, 125, 70);
  
  // Horizontal line
  doc.line(20, 80, 190, 80);
  
  // Order Details Section - Left Side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Order ID:', 20, 90);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.orderId || '004365085826568652000', 20, 97);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Order Date:', 20, 107);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.orderDate || new Date(invoiceData.invoiceDate).toLocaleDateString() || '12-01-2026', 20, 114);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', 20, 124);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString() : '12-01-2026', 20, 131);
  
  doc.setFont('helvetica', 'bold');
  doc.text('PAN:', 20, 141);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.supplierPAN || 'AAXCS0655F', 20, 148);
  
  // Bill To Section - Center
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Bill To', 80, 90);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const billToLines = [
    invoiceData.customerName || 'Tusharkant Rout',
    invoiceData.customerAddress || 'Gali no 11,satguru enclave,Maruti Gate - 1,sector 18, Palam Vihar Extension.',
    'Gurgaon Division 122017 Haryana',
    'Phone: xxxxxxxxx'
  ];
  
  let yPos = 97;
  billToLines.forEach(line => {
    const wrappedLines = doc.splitTextToSize(line, 40);
    wrappedLines.forEach(wrappedLine => {
      doc.text(wrappedLine, 80, yPos);
      yPos += 4;
    });
  });
  
  // Ship To Section - Right Side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Ship To', 140, 90);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const shipToLines = [
    invoiceData.customerName || 'Tusharkant Rout',
    invoiceData.customerAddress || 'Gali no 11,satguru enclave,Maruti Gate - 1,sector 18, Palam Vihar Extension.',
    'Gurgaon Division 122017 Haryana',
    'Phone: xxxxxxxxx'
  ];
  
  yPos = 97;
  shipToLines.forEach(line => {
    const wrappedLines = doc.splitTextToSize(line, 40);
    wrappedLines.forEach(wrappedLine => {
      doc.text(wrappedLine, 140, yPos);
      yPos += 4;
    });
  });
  
  // Keep this invoice note - Right Side
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text('*Keep this invoice and', 140, 130);
  doc.text('manufacturer box for', 140, 135);
  doc.text('warranty purposes.', 140, 140);
  
  // Total Items
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Total Items: ${invoiceData.items?.length || 1}`, 20, 165);
  
  // Product table using real data
  const tableData = [];
  
  if (invoiceData.items && invoiceData.items.length > 0) {
    invoiceData.items.forEach(item => {
      tableData.push([
        `${item.product || 'Milk'}\nFSN:\n${item.fsn || 'MLKHFR86AHRKBGYM'}\nHSN/SAC: ${item.hsnCode || '04012000aaa'}`,
        `${item.description || 'Amul Slim n Trim Skimmed Milk'}\nSGST/UTGST: ${item.sgstRate || 0.0} %\nCGST: ${item.cgstRate || 0.0} %`,
        item.quantity || 1,
        Number(item.unitPrice || 26).toFixed(2),
        item.discount ? `-${Number(item.discount).toFixed(2)}` : '-1.00',
        Number(item.taxableValue || 25).toFixed(2),
        Number(item.sgstAmount || 0).toFixed(2),
        Number(item.cgstAmount || 0).toFixed(2),
        Number(item.totalAmount || 25).toFixed(2)
      ]);
    });
  } else {
    // Default row if no items
    tableData.push([
      'Milk\nFSN:\nMLKHFR86AHRKBGYM\nHSN/SAC: 04012000aaa',
      'Amul Slim n Trim Skimmed Milk\nSGST/UTGST: 0.0 %\nCGST: 0.0 %',
      '1',
      '26.00',
      '-1.00',
      '25.00',
      '0.00',
      '0.00',
      '25.00'
    ]);
  }
  
  // Add handling fee
  tableData.push([
    '',
    'Handling Fee',
    '1',
    '4.00',
    '-4.00',
    '0.00',
    '0.00',
    '0.00',
    '0.00'
  ]);
  
  // Calculate totals from real data
  const totalQty = invoiceData.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 1;
  const totalGross = Number(invoiceData.subtotal || 30);
  const totalDiscount = Number(invoiceData.totalDiscount || 5);
  const totalTaxable = Number(invoiceData.totalTaxableValue || 25);
  const totalSGST = Number(invoiceData.totalSGST || 0);
  const totalCGST = Number(invoiceData.totalCGST || 0);
  const grandTotal = Number(invoiceData.grandTotal || 25);
  
  // Add total row
  tableData.push([
    '',
    'Total',
    totalQty.toString(),
    totalGross.toFixed(2),
    `-${totalDiscount.toFixed(2)}`,
    totalTaxable.toFixed(2),
    totalSGST.toFixed(2),
    totalCGST.toFixed(2),
    grandTotal.toFixed(2)
  ]);
  
  doc.autoTable({
    startY: 175,
    head: [[
      'Product',
      'Title',
      'Qty',
      'Gross\nAmount ₹',
      'Discounts\n/Coupons ₹',
      'Taxable\nValue ₹',
      'SGST\n/UTGST\n₹',
      'CGST\n₹',
      'Total ₹'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
      valign: 'top'
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'left' },
      1: { cellWidth: 35, halign: 'left' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 15, halign: 'right' },
      7: { cellWidth: 15, halign: 'right' },
      8: { cellWidth: 20, halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { bottom: 60 }
  });
  
  // Grand Total section
  let finalY = doc.lastAutoTable.finalY + 15;
  
  if (finalY > 230) {
    finalY = 230;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Grand Total', 120, finalY);
  doc.text(`₹ ${grandTotal.toFixed(2)}`, 170, finalY);
  
  // Company name
  doc.setFontSize(10);
  doc.text('Shreyash Retail Private Limited', 130, finalY + 15);
  
  // Signature area
  const signatureY = finalY + 30;
  doc.line(140, signatureY, 180, signatureY);
  doc.setFontSize(8);
  doc.text('Authorized Signatory', 150, signatureY + 8);
  
  // Download PDF
  doc.save(`TaxInvoice_${invoiceData.invoiceNumber || 'FAT20326517264441'}.pdf`);
};

export const generatePurchaseOrderPDF = (poData) => {
  const doc = new jsPDF();
  
  // Title - Purchase Order (centered)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Purchase Order', 105, 20, { align: 'center' });
  
  // Company Details - Left Side
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('From: Your Company Name', 20, 35);
  
  // PO Number Box - Right Side
  doc.rect(120, 30, 70, 15, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text(`PO Number: ${poData.poNumber || 'PO-001'}`, 125, 40);
  
  // Company Address
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Your Company Address', 20, 42);
  doc.text('City, State - PIN Code', 20, 47);
  
  // Horizontal line
  doc.line(20, 55, 190, 55);
  
  // PO Details Section - Left Side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PO Date:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(poData.poDate ? new Date(poData.poDate).toLocaleDateString() : new Date().toLocaleDateString(), 20, 72);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Delivery Date:', 20, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(poData.deliveryDate ? new Date(poData.deliveryDate).toLocaleDateString() : 'TBD', 20, 89);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 20, 99);
  doc.setFont('helvetica', 'normal');
  doc.text(poData.status || 'Pending', 20, 106);
  
  // Supplier Details - Right Side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Supplier Details:', 120, 65);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(poData.supplier || 'Supplier Name', 120, 72);
  
  if (poData.gstNumber) {
    doc.text(`GST Number: ${poData.gstNumber}`, 120, 79);
  }
  
  if (poData.deliveryAddress) {
    const addressLines = doc.splitTextToSize(poData.deliveryAddress, 60);
    let addressY = 86;
    addressLines.forEach(line => {
      doc.text(line, 120, addressY);
      addressY += 4;
    });
  } else {
    doc.text('Supplier Address', 120, 86);
    doc.text('Contact Information', 120, 93);
  }
  
  // Total Items
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Total Items: ${poData.items?.length || 0}`, 20, 120);
  
  // Items table
  const tableData = [];
  
  if (poData.items && poData.items.length > 0) {
    poData.items.forEach(item => {
      const itemTotal = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100) + 
                      (((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100)) * (item.cgstRate + item.sgstRate + item.igstRate) / 100);
      
      tableData.push([
        item.name || 'Item Name',
        item.hsn || 'HSN/SAC',
        item.quantity || 0,
        Number(item.rate || 0).toFixed(2),
        `${item.discount || 0}%`,
        `CGST: ${item.cgstRate || 0}%\nSGST: ${item.sgstRate || 0}%\nIGST: ${item.igstRate || 0}%`,
        Number(itemTotal).toFixed(2)
      ]);
    });
  }
  
  // Calculate totals
  const subTotal = Number(poData.subTotal || 0);
  const totalDiscount = Number(poData.totalDiscount || 0);
  const totalTax = Number(poData.totalTax || 0);
  const grandTotal = Number(poData.totalAmount || 0);
  
  // Add total row
  if (tableData.length > 0) {
    tableData.push([
      '',
      'Total',
      poData.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0,
      subTotal.toFixed(2),
      `-${totalDiscount.toFixed(2)}`,
      `Tax: ${totalTax.toFixed(2)}`,
      grandTotal.toFixed(2)
    ]);
  }
  
  doc.autoTable({
    startY: 130,
    head: [[
      'Item Name',
      'HSN/SAC',
      'Qty',
      'Rate ₹',
      'Discount',
      'Tax Details',
      'Total ₹'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
      valign: 'top'
    },
    columnStyles: {
      0: { cellWidth: 35, halign: 'left' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 30, halign: 'left' },
      6: { cellWidth: 25, halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { bottom: 60 }
  });
  
  // Summary section
  let finalY = doc.lastAutoTable.finalY + 15;
  
  if (finalY > 220) {
    finalY = 220;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Order Summary:', 120, finalY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Sub Total: ₹${subTotal.toFixed(2)}`, 120, finalY + 8);
  doc.text(`Total Discount: ₹${totalDiscount.toFixed(2)}`, 120, finalY + 16);
  doc.text(`Total Tax: ₹${totalTax.toFixed(2)}`, 120, finalY + 24);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 120, finalY + 35);
  
  // Signature area
  const signatureY = finalY + 50;
  doc.line(20, signatureY, 60, signatureY);
  doc.line(140, signatureY, 180, signatureY);
  doc.setFontSize(8);
  doc.text('Prepared By', 30, signatureY + 8);
  doc.text('Authorized Signatory', 150, signatureY + 8);
  
  // Download PDF
  doc.save(`PurchaseOrder_${poData.poNumber || 'PO-001'}.pdf`);
};

export const generateCreditNotePDF = (creditNoteData) => {
  const doc = new jsPDF();
  
  // Title - Credit Note (centered)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Credit Note', 105, 20, { align: 'center' });
  
  // Top section - Company and Credit Note Number on same line
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Sold By: ${creditNoteData.supplierName || 'Supplier Name'} ,`, 20, 35);
  doc.text(`Credit Note Number # ${creditNoteData.creditNoteNumber || 'RARIMZ260687389T'}`, 120, 35);
  
  // Company Address
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Ship-from Address: ${creditNoteData.supplierAddress || 'Supplier Address'}`, 20, 42);
  doc.text('Gurugram, Haryana-122016, Gurugram , HARYANA, India - 122016', 20, 47);
  
  // GSTIN
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('GSTIN - 06AAXCS0655F1ZZ', 20, 55);
  
  // Horizontal line
  doc.line(20, 62, 190, 62);
  
  // Four column section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  
  // Column headers
  doc.text('Order ID:', 20, 72);
  doc.text('Bill To', 65, 72);
  doc.text('Ship From', 110, 72);
  doc.text('Ship To', 155, 72);
  
  // Order ID with real data - compact layout
  doc.setFont('helvetica', 'normal');
  doc.text(creditNoteData.orderId || creditNoteData.referenceNumber || '004360075927877332200', 20, 80);
  
  // Order Date and Invoice Date under Order ID - more compact
  doc.setFont('helvetica', 'bold');
  doc.text('Order Date:', 20, 88);
  doc.setFont('helvetica', 'normal');
  doc.text(creditNoteData.orderDate || new Date(creditNoteData.creditNoteDate).toLocaleDateString() || '15-11-2025', 20, 93);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', 20, 101);
  doc.setFont('helvetica', 'normal');
  doc.text(creditNoteData.originalInvoiceDate ? new Date(creditNoteData.originalInvoiceDate).toLocaleDateString() : new Date(creditNoteData.creditNoteDate).toLocaleDateString() || '16-11-2025', 20, 106);
  
  // Original Invoice Number - compact
  doc.setFont('helvetica', 'bold');
  doc.text('Original Invoice Number:', 20, 114);
  doc.setFont('helvetica', 'normal');
  doc.text(creditNoteData.originalInvoiceNumber || 'FAT20526855066360', 20, 119);
  
  // Reason of Issuance - compact
  doc.setFont('helvetica', 'bold');
  doc.text('Reason Of Issuance:', 20, 127);
  doc.setFont('helvetica', 'normal');
  doc.text(creditNoteData.reason || 'sales_return', 20, 132);
  
  // Bill To section - using customer data with proper column width
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  // Use shorter text and proper positioning
  const billToLines = [
    creditNoteData.customerName || 'Customer Name',
    creditNoteData.customerAddress || 'Customer Address'
  ].filter(line => line);
  
  let yPos = 80;
  billToLines.forEach(line => {
    const wrappedLines = doc.splitTextToSize(line, 30); // Reduced width
    wrappedLines.forEach(wrappedLine => {
      doc.text(wrappedLine, 65, yPos);
      yPos += 4;
    });
  });
  
  // Ship From section - using customer data with proper column width
  const shipFromLines = [
    creditNoteData.customerName || 'Customer Name',
    creditNoteData.customerAddress || 'Customer Address'
  ].filter(line => line);
  
  yPos = 80;
  shipFromLines.forEach(line => {
    const wrappedLines = doc.splitTextToSize(line, 30); // Reduced width
    wrappedLines.forEach(wrappedLine => {
      doc.text(wrappedLine, 110, yPos); // Adjusted X position
      yPos += 4;
    });
  });
  
  // Ship To section - using supplier data (same as Sold By)
  const shipToLines = [
    creditNoteData.supplierName || 'Supplier Name',
    creditNoteData.supplierAddress || 'Supplier Address'
  ].filter(line => line);
  
  yPos = 80;
  shipToLines.forEach(line => {
    const wrappedLines = doc.splitTextToSize(line, 30); // Reduced width
    wrappedLines.forEach(wrappedLine => {
      doc.text(wrappedLine, 155, yPos); // Adjusted X position
      yPos += 4;
    });
  });
  
  // Total Items - moved up to save space
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Total Items: ${creditNoteData.items?.length || 1}`, 20, 145);
  
  // Product table using real data
  const tableData = [];
  
  if (creditNoteData.items && creditNoteData.items.length > 0) {
    creditNoteData.items.forEach(item => {
      tableData.push([
        `${item.product || 'Dry Fruits'}\nFSN:\n${item.fsn || 'NDF56WVQKFGW5JUA'}\nHSN/SAC: ${item.hsnCode || '08013220'}`,
        `${item.description || 'Classic Whole Cashews by'}\n${item.brand || 'Upkart Grocery'}\nSGST/UTGST: ${item.sgstRate || 2.5} %\nCGST: ${item.cgstRate || 2.5} %`,
        item.quantity || 1,
        Number(item.unitPrice || 202).toFixed(2),
        item.discount ? `-${Number(item.discount).toFixed(2)}` : '-22.00',
        Number(item.taxableValue || 171.42).toFixed(2),
        Number(item.sgstAmount || 4.28).toFixed(2),
        Number(item.cgstAmount || 4.28).toFixed(2),
        Number(item.totalAmount || 180).toFixed(2)
      ]);
    });
  } else {
    // Default row if no items
    tableData.push([
      'Dry Fruits\nFSN:\nNDF56WVQKFGW5JUA\nHSN/SAC: 08013220',
      'Classic Whole Cashews by\nUpkart Grocery\nSGST/UTGST: 2.500 %\nCGST: 2.500 %',
      '1',
      '202.00',
      '-22.00',
      '171.42',
      '4.28',
      '4.28',
      '180.00'
    ]);
  }
  
  // Add handling fee if exists
  if (creditNoteData.handlingFee || true) {
    tableData.push([
      '',
      'Handling Fee',
      '1',
      '7.00',
      '-7.00',
      '0.00',
      '0.00',
      '0.00',
      '0.00'
    ]);
  }
  
  // Calculate totals from real data
  const totalQty = creditNoteData.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 1;
  const totalGross = Number(creditNoteData.subtotal || 209);
  const totalDiscount = Number(creditNoteData.totalDiscount || 29);
  const totalTaxable = Number(creditNoteData.totalTaxableValue || 171.42);
  const totalSGST = Number(creditNoteData.totalSGST || 4.28);
  const totalCGST = Number(creditNoteData.totalCGST || 4.28);
  const grandTotal = Number(creditNoteData.grandTotal || 180);
  
  // Add total row
  tableData.push([
    '',
    'Total',
    totalQty.toString(),
    totalGross.toFixed(2),
    `-${totalDiscount.toFixed(2)}`,
    totalTaxable.toFixed(2),
    totalSGST.toFixed(2),
    totalCGST.toFixed(2),
    grandTotal.toFixed(2)
  ]);
  
  doc.autoTable({
    startY: 155, // Moved up to save space
    head: [[
      'Product',
      'Title',
      'Qty',
      'Gross\nAmount ₹',
      'Discounts\n/Coupons ₹',
      'Taxable\nValue ₹',
      'SGST\n/UTGST\n₹',
      'CGST\n₹',
      'Total ₹'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
      valign: 'top'
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'left' },
      1: { cellWidth: 35, halign: 'left' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 15, halign: 'right' },
      7: { cellWidth: 15, halign: 'right' },
      8: { cellWidth: 20, halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { bottom: 60 } // Reserve space for signature
  });
  
  // Grand Total section - ensure single page
  let finalY = doc.lastAutoTable.finalY + 15;
  
  // Keep everything on same page
  if (finalY > 230) {
    finalY = 230;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Grand Total', 120, finalY);
  doc.text(`₹ ${grandTotal.toFixed(2)}`, 170, finalY);
  
  // Company name
  doc.setFontSize(10);
  doc.text('Shreyash Retail Private Limited', 130, finalY + 15);
  
  // Signature area - same page only
  const signatureY = finalY + 30;
  doc.line(140, signatureY, 180, signatureY);
  doc.setFontSize(8);
  doc.text('Authorized Signatory', 150, signatureY + 8);
  
  // Download PDF
  doc.save(`CreditNote_${creditNoteData.creditNoteNumber || 'RARIMZ260687389T'}.pdf`);
};

export const generateCreditDebitNotePDF = (noteData) => {
  const doc = new jsPDF();
  
  // Title - Credit/Debit Note (centered)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(noteData.type || 'Credit Note', 105, 20, { align: 'center' });
  
  // Company Details - Left Side
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('From: Your Company Name', 20, 35);
  
  // Note Number Box - Right Side
  doc.rect(120, 30, 70, 15, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text(`Note Number: ${noteData.noteNumber || 'CN-001'}`, 125, 40);
  
  // Company Address
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Your Company Address', 20, 42);
  doc.text('City, State - PIN Code', 20, 47);
  
  // Horizontal line
  doc.line(20, 55, 190, 55);
  
  // Note Details Section - Left Side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Note Date:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(noteData.noteDate ? new Date(noteData.noteDate).toLocaleDateString() : new Date().toLocaleDateString(), 20, 72);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Original Invoice:', 20, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(noteData.originalInvoiceNumber || 'N/A', 20, 89);
  
  // Vendor Details - Right Side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Vendor Details:', 120, 65);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(noteData.vendorName || 'Vendor Name', 120, 72);
  
  if (noteData.vendorGSTIN) {
    doc.text(`GSTIN: ${noteData.vendorGSTIN}`, 120, 79);
  }
  
  if (noteData.vendorAddress) {
    const addressLines = doc.splitTextToSize(noteData.vendorAddress, 60);
    let addressY = 86;
    addressLines.forEach(line => {
      doc.text(line, 120, addressY);
      addressY += 4;
    });
  }
  
  // Total Items
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Total Items: ${noteData.items?.length || 0}`, 20, 120);
  
  // Items table
  const tableData = [];
  
  if (noteData.items && noteData.items.length > 0) {
    noteData.items.forEach(item => {
      tableData.push([
        item.product || 'Product Name',
        item.description || 'Item Description',
        item.hsnCode || 'HSN/SAC',
        item.quantity || 0,
        Number(item.unitPrice || 0).toFixed(2),
        `${item.discount || 0}%`,
        `CGST: ${item.cgstRate || 0}%\nSGST: ${item.sgstRate || 0}%\nIGST: ${item.igstRate || 0}%`,
        Number(item.totalAmount || 0).toFixed(2)
      ]);
    });
  }
  
  // Calculate totals
  const subTotal = Number(noteData.subtotal || 0);
  const totalDiscount = Number(noteData.totalDiscount || 0);
  const totalTaxableValue = Number(noteData.totalTaxableValue || 0);
  const totalCGST = Number(noteData.totalCGST || 0);
  const totalSGST = Number(noteData.totalSGST || 0);
  const totalIGST = Number(noteData.totalIGST || 0);
  const totalCESS = Number(noteData.totalCESS || 0);
  const tdsAmount = Number(noteData.tdsAmount || 0);
  const grandTotal = Number(noteData.grandTotal || 0);
  
  // Add total row
  if (tableData.length > 0) {
    tableData.push([
      '',
      'Total',
      '',
      noteData.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0,
      subTotal.toFixed(2),
      `-${totalDiscount.toFixed(2)}`,
      `Tax: ${(totalCGST + totalSGST + totalIGST + totalCESS).toFixed(2)}`,
      grandTotal.toFixed(2)
    ]);
  }
  
  doc.autoTable({
    startY: 130,
    head: [[
      'Product',
      'Description',
      'HSN/SAC',
      'Qty',
      'Rate ₹',
      'Discount',
      'Tax Details',
      'Total ₹'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
      valign: 'top'
    },
    columnStyles: {
      0: { cellWidth: 35, halign: 'left' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 30, halign: 'left' },
      6: { cellWidth: 25, halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { bottom: 60 }
  });
  
  // Summary section
  let finalY = doc.lastAutoTable.finalY + 15;
  
  if (finalY > 220) {
    finalY = 220;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Summary:', 120, finalY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Sub Total: ₹${subTotal.toFixed(2)}`, 120, finalY + 8);
  doc.text(`Total Discount: ₹${totalDiscount.toFixed(2)}`, 120, finalY + 16);
  doc.text(`Taxable Value: ₹${totalTaxableValue.toFixed(2)}`, 120, finalY + 24);
  doc.text(`CGST: ₹${totalCGST.toFixed(2)}`, 120, finalY + 32);
  doc.text(`SGST: ₹${totalSGST.toFixed(2)}`, 120, finalY + 40);
  
  let nextLineY = finalY + 48;
  if (totalIGST > 0) {
    doc.text(`IGST: ₹${totalIGST.toFixed(2)}`, 120, nextLineY);
    nextLineY += 8;
  }
  
  if (totalCESS > 0) {
    doc.text(`CESS: ₹${totalCESS.toFixed(2)}`, 120, nextLineY);
    nextLineY += 8;
  }
  
  if (tdsAmount > 0) {
    doc.text(`TDS: ₹${tdsAmount.toFixed(2)}`, 120, nextLineY);
    nextLineY += 8;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 120, nextLineY);
  
  if (tdsAmount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const netAmount = grandTotal - tdsAmount;
    doc.text(`Net Amount: ₹${netAmount.toFixed(2)}`, 120, nextLineY + 10);
  }
  
  // Notes section
  if (noteData.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Notes:', 20, finalY + 20);
    const notesLines = doc.splitTextToSize(noteData.notes, 80);
    let notesY = finalY + 28;
    notesLines.forEach(line => {
      doc.text(line, 20, notesY);
      notesY += 4;
    });
  }
  
  // Signature area
  const signatureY = finalY + (tdsAmount > 0 ? 75 : 57);
  doc.line(20, signatureY, 60, signatureY);
  doc.line(140, signatureY, 180, signatureY);
  doc.setFontSize(8);
  doc.text('Prepared By', 30, signatureY + 8);
  doc.text('Authorized Signatory', 150, signatureY + 8);
  
  // Download PDF
  const noteType = noteData.type === 'Credit Note' ? 'CreditNote' : 'DebitNote';
  doc.save(`${noteType}_${noteData.noteNumber || 'NOTE-001'}.pdf`);
};