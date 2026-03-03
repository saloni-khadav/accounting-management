import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePurchaseOrderPDFBase64 = async (poData) => {
  const doc = new jsPDF();
  
  let companyProfile = {};
  try {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    const token = localStorage.getItem('token');
    if (token) {
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        companyProfile = result.user?.profile || {};
      }
    }
  } catch (error) {}

  const addHeaderFooter = (pageNum) => {
    doc.setFontSize(12);
    doc.text('||||| |||||', 15, 15);
    doc.setFontSize(9);
    doc.text('general purchase order', 15, 22);
    doc.setFontSize(8);
    doc.text(companyProfile.tradeName || 'ECOAGRITEK AI SOLUTIONS PRIVATE LIMITED', 15, 285);
    doc.text(`Page ${pageNum} of 6`, 195, 285, { align: 'right' });
    doc.text('PLOT NO 63, GALI NO 1 SATGURU ENCLAVE MOLLAHERA BLOCK C, OPP Maruti Gate No.1, Gurugram, Gurugram, Haryana, 122015', 15, 290);
    doc.text('Email ID: Finance@agritek.co.in   Web address: https://agritek.co.in/    Whatsapp : + 91 94380 31457', 15, 294);
  };

  // PAGE 1
  addHeaderFooter(1);
  
  let y = 35;
  doc.setFontSize(9);
  
  doc.setFont('helvetica', 'bold');
  doc.text('To', 15, y);
  doc.text(':', 45, y);
  doc.setFont('helvetica', 'normal');
  doc.text(poData.supplier || '', 50, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Address', 15, y);
  doc.text(':', 45, y);
  doc.setFont('helvetica', 'normal');
  if (poData.deliveryAddress) {
    const addr = doc.splitTextToSize(poData.deliveryAddress, 60);
    addr.forEach((line, i) => {
      doc.text(line, 50, y + (i * 4));
    });
    y += addr.length * 4;
  }
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN/UIN', 15, y);
  doc.text(':', 45, y);
  doc.setFont('helvetica', 'normal');
  doc.text(poData.gstNumber || '', 50, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Pan Number', 15, y);
  doc.text(':', 45, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Place of Supplier', 15, y);
  doc.text(':', 45, y);
  
  y = 35;
  doc.setFont('helvetica', 'bold');
  doc.text('Order No', 115, y);
  doc.text(':', 145, y);
  doc.setFont('helvetica', 'normal');
  doc.text(poData.poNumber || '', 150, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Order Date', 115, y);
  doc.text(':', 145, y);
  doc.setFont('helvetica', 'normal');
  doc.text(poData.poDate ? new Date(poData.poDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '', 150, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Name', 115, y);
  doc.text(':', 145, y);
  doc.setFont('helvetica', 'normal');
  doc.text(companyProfile.tradeName || 'Ecoagritek AI Solutions Private Limited', 150, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Our Address', 115, y);
  doc.text(':', 145, y);
  doc.setFont('helvetica', 'normal');
  if (companyProfile.address) {
    const ourAddr = doc.splitTextToSize(companyProfile.address, 50);
    ourAddr.forEach((line, i) => {
      doc.text(line, 150, y + (i * 4));
    });
    y += ourAddr.length * 4;
  }
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN', 115, y);
  doc.text(':', 145, y);
  doc.setFont('helvetica', 'normal');
  doc.text(companyProfile.gstNumber || '', 150, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('PAN', 115, y);
  doc.text(':', 145, y);
  doc.setFont('helvetica', 'normal');
  doc.text(companyProfile.panNumber || '', 150, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Place of Supply', 115, y);
  doc.text(':', 145, y);
  doc.setFont('helvetica', 'normal');
  doc.text('[06 - Haryana]', 150, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Printed On', 115, y);
  doc.text(':', 145, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Business unit :', 115, y);
  doc.setFont('helvetica', 'normal');
  doc.text('Agritek - Ecom', 150, y);
  
  y += 10;
  const tableData = [];
  if (poData.items && poData.items.length > 0) {
    poData.items.forEach(item => {
      const itemTotal = (item.quantity * item.rate);
      tableData.push([
        item.name || '',
        item.name || '',
        item.hsn || '',
        item.quantity || 0,
        Number(item.rate || 0).toFixed(2),
        Number(itemTotal).toFixed(2)
      ]);
    });
  }
  
  doc.autoTable({
    startY: y,
    head: [['Item Number', 'Description', 'HSN /SAC', 'Quantity', 'Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    }
  });
  
  let finalY = doc.lastAutoTable.finalY + 10;
  const totalTax = Number(poData.totalTax || 0);
  const grandTotal = Number(poData.totalAmount || 0);
  
  doc.setFontSize(9);
  doc.text('IGST @ 12%', 140, finalY, { align: 'right' });
  doc.text(totalTax.toFixed(2), 195, finalY, { align: 'right' });
  
  finalY += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total', 140, finalY, { align: 'right' });
  doc.text(grandTotal.toFixed(2), 195, finalY, { align: 'right' });
  
  finalY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Rupees One Lakh Forty Five Thousand One Hundred Fifty Two Only', 15, finalY);
  doc.text('CIN: U01611OD2025PTC051238', 15, finalY + 4);
  
  finalY += 12;
  doc.setFontSize(7);
  doc.text('* Please attach a DUPLICATE copy of our order along with Photograph/delivery challan to your bill.', 15, finalY);
  doc.text('* Your bills should be sent to us in TRIPLICATE which needs to be approved by our servicing person.', 15, finalY + 3);
  doc.text('* All bills against this PO are to be submitted within 7 working days from PO receipt; failing which the Order shall stand cancelled.', 15, finalY + 6);
  
  finalY += 12;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('This purchase order is subject to following Terms & conditions :', 15, finalY);
  
  finalY += 6;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Definitions. Capitalized terms have the following meanings: (a) "Goods" means the goods, services and other items to be supplied to Purchaser by Supplier under this Purchase Order; (b) "Purchase Order"', 15, finalY);
  finalY += 3;
  doc.text('means the written or electronic order for Goods as is attached herewith; (c) "Purchaser" means the Purchaser issuing this Purchase Order (d) "Specified" means as specified in the Purchase Order; and (e)', 15, finalY);
  finalY += 3;
  doc.text('"Supplier" means the individual or entity specified in the Purchase Order as the supplier.', 15, finalY);
  finalY += 3;
  doc.text('2. Order, Price and Payment. This Order is being placed by the Purchaser on behalf of its Client and the payments are subject to satisfactory deliverables and proper submission of bills. The Specified price is', 15, finalY);
  finalY += 3;
  doc.text('Exclusive of all applicable taxes, freight, packaging, insurance, handling and all other charges. Taxes, duties, cess as applicable to your services will have to be mentioned separately on your invoices with the', 15, finalY);

  // Add remaining pages (2-6) with terms and conditions
  doc.addPage();
  addHeaderFooter(2);
  doc.addPage();
  addHeaderFooter(3);
  doc.addPage();
  addHeaderFooter(4);
  doc.addPage();
  addHeaderFooter(5);
  doc.addPage();
  addHeaderFooter(6);
  
  return doc.output('dataurlstring').split('base64,')[1];
};
