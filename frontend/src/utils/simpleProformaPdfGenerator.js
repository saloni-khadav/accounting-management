import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateSimpleProformaPDF = async (poData, returnBase64 = false) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFORMA INVOICE', 105, 20, { align: 'center' });
  
  // PI Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PI Number: ${poData.piNumber || poData.poNumber}`, 15, 35);
  doc.text(`Date: ${new Date(poData.piDate || poData.poDate).toLocaleDateString('en-IN')}`, 15, 42);
  if (poData.deliveryDate) {
    doc.text(`Delivery Date: ${new Date(poData.deliveryDate).toLocaleDateString('en-IN')}`, 15, 49);
  }
  
  // Customer Details
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', 15, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${poData.supplierName}`, 15, 67);
  if (poData.gstNumber) {
    doc.text(`GST Number: ${poData.gstNumber}`, 15, 74);
  }
  if (poData.deliveryAddress) {
    const addr = doc.splitTextToSize(`Address: ${poData.deliveryAddress}`, 85);
    let y = 81;
    addr.forEach(line => {
      doc.text(line, 15, y);
      y += 7;
    });
  }
  
  // Items Table
  const tableData = poData.items.map((item, index) => {
    const itemTotal = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100) + 
                     (((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100)) * ((item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0)) / 100);
    return [
      index + 1,
      item.name,
      item.hsn,
      item.quantity,
      `₹${item.rate.toFixed(2)}`,
      `${item.discount}%`,
      `${item.cgstRate || 0}%`,
      `${item.sgstRate || 0}%`,
      `${item.igstRate || 0}%`,
      `₹${itemTotal.toFixed(2)}`
    ];
  });
  
  doc.autoTable({
    startY: 100,
    head: [['S.No', 'Item', 'HSN', 'Qty', 'Rate', 'Disc%', 'CGST%', 'SGST%', 'IGST%', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 35 },
      2: { cellWidth: 18 },
      3: { cellWidth: 12 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 },
      6: { cellWidth: 15 },
      7: { cellWidth: 15 },
      8: { cellWidth: 15 },
      9: { cellWidth: 25 }
    }
  });
  
  // Totals
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.text(`Sub Total: ₹${poData.subTotal.toFixed(2)}`, 140, finalY, { align: 'right' });
  finalY += 6;
  doc.text(`Total Discount: ₹${poData.totalDiscount.toFixed(2)}`, 140, finalY, { align: 'right' });
  finalY += 6;
  doc.text(`Total Tax: ₹${poData.totalTax.toFixed(2)}`, 140, finalY, { align: 'right' });
  finalY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Total Amount: ₹${poData.totalAmount.toFixed(2)}`, 140, finalY, { align: 'right' });
  
  if (returnBase64) {
    return doc.output('dataurlstring').split('base64,')[1];
  } else {
    doc.save(`PI-${poData.piNumber || poData.poNumber}.pdf`);
  }
};
