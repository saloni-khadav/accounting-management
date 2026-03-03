import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateTaxInvoicePDF = async (invoice, returnBase64 = false) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 105, 20, { align: 'center' });
  
  // Invoice Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 15, 35);
  doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, 15, 42);
  if (invoice.piNumber) {
    doc.text(`PI Number: ${invoice.piNumber}`, 15, 49);
  }
  
  // Supplier Details
  doc.setFont('helvetica', 'bold');
  doc.text('Supplier Details', 15, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${invoice.supplierName}`, 15, 67);
  doc.text(`Address: ${invoice.supplierAddress}`, 15, 74);
  doc.text(`GSTIN: ${invoice.supplierGSTIN}`, 15, 81);
  doc.text(`PAN: ${invoice.supplierPAN}`, 15, 88);
  
  // Customer Details
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', 110, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${invoice.customerName}`, 110, 67);
  const custAddr = doc.splitTextToSize(invoice.customerAddress, 85);
  doc.text(`Address: ${custAddr[0]}`, 110, 74);
  if (invoice.customerGSTIN) {
    doc.text(`GSTIN: ${invoice.customerGSTIN}`, 110, 81);
  }
  
  // Items Table
  const tableData = invoice.items.map((item, index) => [
    index + 1,
    item.description || item.product || '',
    item.hsnCode,
    item.quantity,
    `₹${item.unitPrice.toFixed(2)}`,
    `₹${item.taxableValue.toFixed(2)}`,
    `${item.cgstRate}%\n₹${item.cgstAmount.toFixed(2)}`,
    `${item.sgstRate}%\n₹${item.sgstAmount.toFixed(2)}`,
    `${item.igstRate}%\n₹${item.igstAmount.toFixed(2)}`,
    `₹${item.totalAmount.toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: 100,
    head: [['S.No', 'Description', 'HSN', 'Qty', 'Rate', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total']],
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
      5: { cellWidth: 22 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 },
      9: { cellWidth: 22 }
    }
  });
  
  // Totals
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, 140, finalY, { align: 'right' });
  finalY += 6;
  doc.text(`Total Discount: ₹${invoice.totalDiscount.toFixed(2)}`, 140, finalY, { align: 'right' });
  finalY += 6;
  doc.text(`Taxable Value: ₹${invoice.totalTaxableValue.toFixed(2)}`, 140, finalY, { align: 'right' });
  finalY += 6;
  doc.text(`CGST: ₹${invoice.totalCGST.toFixed(2)}`, 140, finalY, { align: 'right' });
  finalY += 6;
  doc.text(`SGST: ₹${invoice.totalSGST.toFixed(2)}`, 140, finalY, { align: 'right' });
  finalY += 6;
  doc.text(`IGST: ₹${invoice.totalIGST.toFixed(2)}`, 140, finalY, { align: 'right' });
  finalY += 6;
  doc.text(`Total Tax: ₹${invoice.totalTax.toFixed(2)}`, 140, finalY, { align: 'right' });
  finalY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Grand Total: ₹${invoice.grandTotal.toFixed(2)}`, 140, finalY, { align: 'right' });
  
  if (invoice.notes) {
    finalY += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Notes: ${invoice.notes}`, 15, finalY);
  }
  
  if (returnBase64) {
    return doc.output('dataurlstring').split('base64,')[1];
  } else {
    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  }
};
