import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateTaxInvoicePDF = (invoiceData) => {
  const doc = new jsPDF();
  
  // Header Background
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(invoiceData.supplierName, 20, 20);
  
  // TAX INVOICE title
  doc.setFontSize(18);
  doc.text('TAX INVOICE', 150, 20);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Company Details Box
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 45, 90, 35, 'F');
  doc.rect(15, 45, 90, 35, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Supplier Details:', 18, 52);
  doc.text(invoiceData.supplierAddress, 18, 58);
  doc.text(`GSTIN: ${invoiceData.supplierGSTIN}`, 18, 64);
  doc.text(`PAN: ${invoiceData.supplierPAN}`, 18, 70);
  
  // Invoice Details Box
  doc.setFillColor(219, 234, 254);
  doc.rect(110, 45, 85, 35, 'F');
  doc.rect(110, 45, 85, 35, 'S');
  
  doc.text('Invoice Details:', 113, 52);
  doc.text(`Invoice No: ${invoiceData.invoiceNumber}`, 113, 58);
  doc.text(`Date: ${invoiceData.invoiceDate}`, 113, 64);
  doc.text(`Place of Supply: ${invoiceData.placeOfSupply}`, 113, 70);
  doc.text(`Payment Terms: ${invoiceData.paymentTerms}`, 113, 76);
  
  // Customer Details Box
  doc.setFillColor(219, 234, 254);
  doc.rect(15, 85, 180, 25, 'F');
  doc.rect(15, 85, 180, 25, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 18, 92);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.customerName, 18, 98);
  doc.text(invoiceData.customerAddress, 18, 104);
  if (invoiceData.customerGSTIN) {
    doc.text(`GSTIN: ${invoiceData.customerGSTIN}`, 120, 98);
  }
  if (invoiceData.customerPlace) {
    doc.text(`Place: ${invoiceData.customerPlace}`, 120, 104);
  }
  
  // Items Table
  const tableData = invoiceData.items.map(item => [
    item.product || '',
    item.description,
    item.hsnCode,
    item.quantity,
    item.unit,
    `₹${item.unitPrice.toFixed(2)}`,
    `₹${item.discount.toFixed(2)}`,
    `₹${item.taxableValue.toFixed(2)}`,
    `${item.cgstRate}%`,
    `${item.sgstRate}%`,
    `${item.igstRate}%`,
    `₹${item.totalAmount.toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: 115,
    head: [['Product', 'Description', 'HSN', 'Qty', 'Unit', 'Rate', 'Disc', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 8,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });
  
  // Tax Summary Box
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFillColor(248, 250, 252);
  doc.rect(130, finalY, 65, 60, 'F');
  doc.rect(130, finalY, 65, 60, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Tax Summary', 133, finalY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Subtotal: ₹${invoiceData.subtotal.toFixed(2)}`, 133, finalY + 16);
  doc.text(`Discount: ₹${invoiceData.totalDiscount.toFixed(2)}`, 133, finalY + 22);
  doc.text(`Taxable: ₹${invoiceData.totalTaxableValue.toFixed(2)}`, 133, finalY + 28);
  doc.text(`CGST: ₹${invoiceData.totalCGST.toFixed(2)}`, 133, finalY + 34);
  doc.text(`SGST: ₹${invoiceData.totalSGST.toFixed(2)}`, 133, finalY + 40);
  doc.text(`IGST: ₹${invoiceData.totalIGST.toFixed(2)}`, 133, finalY + 46);
  
  // Grand Total with highlight
  doc.setFillColor(59, 130, 246);
  doc.rect(130, finalY + 50, 65, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Grand Total: ₹${invoiceData.grandTotal.toFixed(2)}`, 133, finalY + 57);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Terms & Conditions
  if (invoiceData.termsConditions) {
    doc.setFillColor(254, 243, 199);
    doc.rect(15, finalY + 10, 110, 30, 'F');
    doc.rect(15, finalY + 10, 110, 30, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Terms & Conditions:', 18, finalY + 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitText = doc.splitTextToSize(invoiceData.termsConditions, 100);
    doc.text(splitText, 18, finalY + 25);
  }
  
  // Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 270, 210, 27, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('This is a computer generated invoice and does not require signature.', 20, 280);
  doc.text('GST Compliance: This invoice is issued as per GST regulations.', 20, 285);
  
  // Download PDF
  doc.save(`Invoice_${invoiceData.invoiceNumber}.pdf`);
};

export const generateCreditNotePDF = (creditNoteData) => {
  const doc = new jsPDF();
  
  // Header Background
  doc.setFillColor(220, 38, 127); // Pink background for credit note
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(creditNoteData.supplierName, 20, 20);
  
  // CREDIT NOTE title
  doc.setFontSize(18);
  doc.text('CREDIT NOTE', 150, 20);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Company Details Box
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 45, 90, 35, 'F');
  doc.rect(15, 45, 90, 35, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Supplier Details:', 18, 52);
  doc.text(creditNoteData.supplierAddress, 18, 58);
  doc.text(`GSTIN: ${creditNoteData.supplierGSTIN}`, 18, 64);
  doc.text(`PAN: ${creditNoteData.supplierPAN}`, 18, 70);
  
  // Credit Note Details Box
  doc.setFillColor(254, 226, 226);
  doc.rect(110, 45, 85, 45, 'F');
  doc.rect(110, 45, 85, 45, 'S');
  
  doc.text('Credit Note Details:', 113, 52);
  doc.text(`Credit Note No: ${creditNoteData.creditNoteNumber}`, 113, 58);
  doc.text(`Date: ${new Date(creditNoteData.creditNoteDate).toLocaleDateString()}`, 113, 64);
  doc.text(`Original Invoice: ${creditNoteData.originalInvoiceNumber}`, 113, 70);
  if (creditNoteData.originalInvoiceDate) {
    doc.text(`Invoice Date: ${new Date(creditNoteData.originalInvoiceDate).toLocaleDateString()}`, 113, 76);
  }
  if (creditNoteData.reason) {
    doc.text(`Reason: ${creditNoteData.reason}`, 113, 82);
  }
  
  // Customer Details Box
  doc.setFillColor(254, 226, 226);
  doc.rect(15, 95, 180, 25, 'F');
  doc.rect(15, 95, 180, 25, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details:', 18, 102);
  doc.setFont('helvetica', 'normal');
  doc.text(creditNoteData.customerName, 18, 108);
  doc.text(creditNoteData.customerAddress, 18, 114);
  if (creditNoteData.customerGSTIN) {
    doc.text(`GSTIN: ${creditNoteData.customerGSTIN}`, 120, 108);
  }
  
  // Items Table
  const tableData = creditNoteData.items.map(item => [
    item.description,
    item.hsnCode,
    item.quantity,
    item.unit,
    `₹${Number(item.unitPrice || 0).toFixed(2)}`,
    `₹${Number(item.taxableValue || 0).toFixed(2)}`,
    `${item.cgstRate}%`,
    `${item.sgstRate}%`,
    `₹${Number(item.totalAmount || 0).toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: 125,
    head: [['Description', 'HSN', 'Qty', 'Unit', 'Rate', 'Taxable', 'CGST', 'SGST', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [220, 38, 127],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 8,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [254, 242, 242]
    }
  });
  
  // Tax Summary Box
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFillColor(254, 242, 242);
  doc.rect(130, finalY, 65, 50, 'F');
  doc.rect(130, finalY, 65, 50, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Credit Summary', 133, finalY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Subtotal: ₹${creditNoteData.subtotal?.toFixed(2) || '0.00'}`, 133, finalY + 16);
  doc.text(`Taxable: ₹${creditNoteData.totalTaxableValue?.toFixed(2) || '0.00'}`, 133, finalY + 22);
  doc.text(`CGST: ₹${creditNoteData.totalCGST?.toFixed(2) || '0.00'}`, 133, finalY + 28);
  doc.text(`SGST: ₹${creditNoteData.totalSGST?.toFixed(2) || '0.00'}`, 133, finalY + 34);
  
  // Grand Total with highlight
  doc.setFillColor(220, 38, 127);
  doc.rect(130, finalY + 40, 65, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Credit Total: ₹${creditNoteData.grandTotal?.toFixed(2) || '0.00'}`, 133, finalY + 47);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Notes
  if (creditNoteData.notes) {
    doc.setFillColor(254, 243, 199);
    doc.rect(15, finalY + 10, 110, 25, 'F');
    doc.rect(15, finalY + 10, 110, 25, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notes:', 18, finalY + 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitText = doc.splitTextToSize(creditNoteData.notes, 100);
    doc.text(splitText, 18, finalY + 25);
  }
  
  // Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 270, 210, 27, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('This is a computer generated credit note and does not require signature.', 20, 280);
  doc.text('GST Compliance: This credit note is issued as per GST regulations.', 20, 285);
  
  // Download PDF
  doc.save(`CreditNote_${creditNoteData.creditNoteNumber}.pdf`);
};