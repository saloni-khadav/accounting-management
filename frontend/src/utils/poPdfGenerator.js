import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePurchaseOrderPDF = async (poData, returnBase64 = false) => {
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
  } catch (error) {
    console.error('Error fetching company profile:', error);
  }

  const addHeaderFooter = (pageNum) => {
    doc.setFontSize(12);
    doc.text('||||| |||||', 15, 15);
    doc.setFontSize(9);
    doc.text('general purchase order', 15, 22);
    
    try {
      const logo = new Image();
      logo.src = '/logo.png';
      doc.addImage(logo, 'PNG', 170, 10, 25, 15);
    } catch (error) {}
    
    doc.setFontSize(8);
    doc.text(companyProfile.tradeName || 'ECOAGRITEK AI SOLUTIONS PRIVATE LIMITED', 15, 285);
    doc.text(`Page ${pageNum} of 6`, 195, 285, { align: 'right' });
    doc.text('PLOT NO 63, GALI NO 1 SATGURU ENCLAVE MOLLAHERA BLOCK C, OPP Maruti Gate No.1, Gurugram, Gurugram, Haryana, 122015', 15, 290);
    doc.text('Email ID: Finance@agritek.co.in   Web address: https://agritek.co.in/    Whatsapp : + 91 94380 31457', 15, 294);
  };

  const addWrappedText = (textArray, startY) => {
    let y = startY;
    textArray.forEach(text => {
      const lines = doc.splitTextToSize(text, 180);
      lines.forEach(line => {
        if (y > 275) return;
        doc.text(line, 15, y);
        y += 3;
      });
    });
    return y;
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
  const companyName = companyProfile.tradeName || 'Ecoagritek AI Solutions Private Limited';
  const nameLines = doc.splitTextToSize(companyName, 50);
  nameLines.forEach((line, i) => {
    doc.text(line, 150, y + (i * 4));
  });
  y += nameLines.length * 4;
  
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
  
  const termsText1 = [
    '1. Definitions. Capitalized terms have the following meanings: (a) "Goods" means the goods, services and other items to be supplied to Purchaser by Supplier under this Purchase Order; (b) "Purchase Order" means the written or electronic order for Goods as is attached herewith; (c) "Purchaser" means the Purchaser issuing this Purchase Order (d) "Specified" means as specified in the Purchase Order; and (e) "Supplier" means the individual or entity specified in the Purchase Order as the supplier.',
    '2. Order, Price and Payment. This Order is being placed by the Purchaser on behalf of its Client and the payments are subject to satisfactory deliverables and proper submission of bills. The Specified price is Exclusive of all applicable taxes, freight, packaging, insurance, handling and all other charges. Taxes, duties, cess as applicable to your services will have to be mentioned separately on your invoices with the needful registrations, unless otherwise specified. Specified prices are not subject to increases or additional charges for any reason. Supplier will separately invoice Purchaser for all'
  ];
  
  finalY = addWrappedText(termsText1, finalY);

  // PAGE 2
  doc.addPage();
  addHeaderFooter(2);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const page2Text = [
    'amounts payable. The Supplier invoice pertaining to each supply should be submitted by the Supplier along with the acknowledged delivery challan/s , photograph mentioning the following information :',
    'a) Correct & complete legal entity name and address of the Supplier and Service Receiver/ Purchaser should be mentioned on the Invoice',
    'b) Complete address and GSTN of the Supplier as mentioned on this Purchase order and the Service Receiver/ Purchaser should be mentioned on the Invoice',
    'c) Valid PAN / Service Tax/VAT/CST / TIN / GSTN registration numbers of the Supplier should be mentioned on the invoice.',
    'd) The amount of VAT/Service Tax/CST/GST should be disclosed separately on the face of the Invoice along with the appropriate rates.',
    'e) HSN/ SAC of goods/ services provided should be prescribed on the invoice.',
    'f) Purchase Order issued by Purchaser has to be attached duly signed by you.',
    'g) Proof of delivery of the goods/services to be attached like, photograph, delivery challan, installation certificate as applicable.',
    'h) Breakup of Tax changed (including mentioning of C Form - if purchase are made on C Form, without this information C-Forms can\'t be issued to vendor).',
    'i) Stamp & Signature of Supplier\'s Authorised Person (Authorised person means person authorised to sign invoices under respective registration authorities / deptt).',
    'j) In case of Retail / branding /fabrication work: Supplier has to issue TAX INVOICE only.',
    'k) All invoices issued by the vendor should be sent to ECOAGRITEK AI SOLUTIONS PRIVATE LIMITED promptly and in no case beyond 7 days of date of invoice.',
    'l) The acceptance of your invoice by the Purchaser is only for ensuring GST compliance and should not be assumed as an acceptance of your services and the value of bill, under any circumstances.',
    'm) It is the responsibility of the Supplier issue proper Tax invoice quoting all the above information with/on the invoice in order to make it GST Compliant, failing which the Purchaser will not be liable to accept and honour the Invoice. In case of any incorrect / incomplete / non-compliance on behalf of the Supplier, due to which the Purchaser receives any demand by the tax authorities, the Supplier shall be immediately liable to pay the applicable taxes / amounts (including interest, penalty and associated litigation cost) if any, upon notification by the Purchaser.',
    'n) The Purchaser shall pay the GST component charged on Supplier lnvoice/s only after Supplier invoice/s details have been uploaded on GSTN portal by the supplier by filing its monthly returns in Form GSTR -1 and the said invoice/s details is/are reflected in our monthly GSTR-2A and GSTR-2B (with CFS- Y) with invoice details matching with the physical / digital invoice copies submitted to us. In case where the Supplier has opted to file its return in Form GSTR 1 on a quarterly basis, then lnvoice/s details should be uploaded/furnished on a monthly basis through Invoice Furnishing Facility (IFF) on the GST Portal and subsequently file GSTR 1 return on quarterly basis (and the said invoices/s details i/are reflected in our GSTR-2A and GSTR-2B with CFS- Y).',
    '3. Delivery. Time is of the essence in Supplier\'s performance under this Purchase Order. The items covered under this purchase order are for immediate supply as per required specifications unless otherwise stated in writing. Supplier will deliver the Goods to Purchaser at the Specified destination no later than the Specified delivery date. Supplier will properly package the Goods to protect against damage during shipment, handling and storage. Supplier will not be liable for delays that are beyond its reasonable control provided it gives Purchaser prompt written notice of the delay and takes commercially reasonable measures mitigate the delay.',
    'For Outdoor Services :The Supplier shall ensure that the sites which specifies electrical lighting, shall at all agreed times, be lit. If there is damage to the electrical lighting of any Site, or if for any reason the electrical lighting fails to function, the Supplier shall ensure immediate repair/replacement of such electrical lighting, at no extra cost to the Purchaser. The Supplier shall be solely responsible for paying electricity charges for lighting of any advertisement provided under this Purchase Order and no liability towards the same shall accrue to the Purchaser and its Client.',
    '4. Inspection. Purchaser may inspect the Goods at any time, and Supplier will provide reasonable access and facilities for such inspection. Any discrepancy with order would be recorded and would be effected from the final payment accordingly.',
    'For Outdoor Services - Display period will be treated from the date of installation. Deduction on Non illumination days on lit sites will be considered on mutually agreed terms',
    '5. Acceptance. Supplier will be deemed to have accepted all provisions of the Purchase Order unless he reverts with his Non acceptance within 3 days from the issue of the Purchase order.',
    '6. Validity of Purchase Order. The validity of this Purchase Order is 6 months from the date of issue, unless renewed by the Purchaser in writing during the validity of the Purchase order. THE PURCHASER WILL NOT BE BOUND BY, AND SPECIFICALLY OBJECTS TO, ANY PROVISION THAT IS DIFFERENT FROM OR IN ADDITION TO THE PROVISIONS OF THIS PURCHASE ORDER WHETHER OFFERED BY SUPPLIER VERBALLY OR IN ANY QUOTATION, INVOICE, SHIPPING DOCUMENT, ACCEPTANCE, CONFIRMATION, CORRESPONDENCE OR OTHERWISE, UNLESS SUCH PROVISION IS SPECIFICALLY AGREED TO IN WRITING SIGNED BY THE AUTHORISED REPRESENTATIVE OF THE PURCHASER.'
  ];
  
  addWrappedText(page2Text, 35);
  
  // PAGE 3
  doc.addPage();
  addHeaderFooter(3);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const page3Text = [
    '7. Representations and Warranties. Supplier represents and warrants that the Goods (a) are free from defects in design, materials, workmanship and title, (b) are of good and suitable quality, that all materials and other items incorporated in the Goods will be new (not refurbished or reconditioned) and suitable for their intended purpose, (c) do not infringe any patent, trademark, trade dress, copyright or other right, (d) confirm to the requirements of the Purchase Order, (e) shall not contain any obscene, libellous, blasphemous, defamatory or deceitful (f) are of comparable quality as all samples delivered to Purchaser and (g) comply with all applicable laws, regulations and other requirements / permissions of governmental authorities having jurisdiction, which will allow the Purchaser , the full and unrestricted exploitation of the material in perpetuity.',
    '8. Rejection and other Remedies. If the Goods do not strictly comply with the requirements of the Purchase Order, Purchaser may reject them within a reasonable period of time after delivery without regard to whether payment has been made. In such case, Purchaser may (a) retain any or all of such Goods for correction or replacement by Purchaser or others (b) retain any or all of such Goods for use as delivered or (c) return any or all of such Goods with or without instruction for correction. Supplier will promptly comply with any instruction for correction. If Purchaser requests Supplier to make any correction and Supplier thereafter fails or indicates its inability or unwillingness to do so, Purchaser may have the correction made. Purchaser will be entitled to recover from Supplier (by credit, offset, invoice or otherwise) an equitable amount for the diminished value of any uncorrected Goods and all costs reasonably incurred by Purchaser in connection with rejected Goods (including but not limited to all costs of correction by Purchaser and all costs to return Goods to Supplier). The Supplier will intimate the Purchaser immediately of any circumstances, which may affect the execution of the Purchase Order and will assist the Purchaser in taking necessary actions arising out of such circumstances',
    '9. Manpower .The Supplier shall be entirely responsible for deployment of man power services, facilities etc. and shall be the Principal Employer for such manpower under all circumstances and shall ensure that the services under this Purchase Order are rendered /delivered to the Purchaser with utmost satisfaction. It shall also comply with all applicable statutes including but not limited to Provident Fund and Miscellaneous Provisions Act, Employees State Insurance Act, Minimum Wages Act, Bonus Act, Payments of Wages Act etc. as may be in force from time to time in terms of coverage, returns, records maintenance and the like. The Purchaser shall not be liable in any manner whatsoever for any non-compliance on Suppliers part of such applicable laws and in the event of any adverse claim of whatsoever nature arising thereof, the entire burden including legal proceedings shall be exclusively borne by the Supplier. The Supplier shall be entirely responsible for payment of all and any cost and liabilities associated with the employment of its employees, manpower services, and or its subcontractors / third parties, who are deployed and /or engaged for performing the Services under this Purchase Order including but not limited to salary, provident fund contributions, insurance, workmen\'s compensation, etc',
    '10. Defense and Indemnity. Supplier will defend and indemnify Purchaser from any allegation or claim based on or any loss, damage, settlement, cost, expense and any other liability (including but not limited to reasonable attorney fees) arising out of any allegation or claim related to (a) the design, manufacture, possession, ownership, use, sale or transfer of the Goods, (b) an actual or alleged breach of any of Supplier\'s representations, warranties or other obligations under this Purchase Order or (c) any act or omission of Supplier or its employees or agents, except to the extent caused by the negligence or wilful misconduct of Purchaser as determined by a final, non-appealable order of a court having jurisdiction(d) arising out of any injury incurred by any employee of the Supplier in the premises of the Purchaser. Additionally, the Supplier agrees that in case of any failure to comply with its GST obligations, if any cost is incurred by Purchaser (including but not limited to loss of credit, tax or cess liability, interest, penalty) by the Supplier / any person appointed by Supplier / third party contractor, then the Supplier undertakes to indemnify the Purchaser for an amount equal to amount payable by Purchaser. Supplier\'s duty to defend is independent of its duty to indemnify. Supplier\'s obligations under this Section are independent of any other obligation of Purchaser under this Purchase Order. Supplier\'s obligations under this Section will survive Purchaser\'s acceptance of and payment for the Goods. Notwithstanding the above, the Purchaser reserves the right to adjust, any recovery to be made by it for loss suffered due to failure on part of the Supplier in its GST Compliances, by adjusting it or withholding it from any amount deposited with Purchaser or its Group Companies or any other amount payable by Purchaser to the vendor (present or future).',
    '11. Insurance. Supplier will maintain insurance policies (including, without limitation, automobile insurance, commercial liability insurance, and statutory workers\' compensation insurance) that are sufficient to protect Supplier\'s business against all applicable risks. Supplier will cause Purchaser to be named as an added insured on the policies required under this Purchase Order and shall cause its insurance to be primary to any insurance carried by Supplier. Supplier will provide Purchaser with certificates of insurance and other supporting materials as Purchaser reasonably may request to evidence Purchaser\'s continuing compliance with the preceding sentences.',
    '12. Confidential Information. Supplier and its representatives will (a) keep confidential the terms and existence of this Purchase Order and all information obtained from Purchaser in connection with this Purchase Order that is identified as confidential or proprietary or that, given the nature of such information or the manner of its disclosure, reasonably should be considered confidential or proprietary and (b) use such information only for the purposes of this Purchase Order. All such information is Purchaser\'s exclusive property. Supplier will not refer to Purchaser or its affiliates in any advertisements or other promotional materials without Purchaser\'s prior written consent.',
    '13. Safety: The Supplier shall adhere and maintain all general safety norms as required by any applicable laws. the Purchaser shall have the right to object to any unsafe practices carried on by either the Supplier or its sub-contractors/suppliers (or associated contractors) to carry out the Services in a safe manner and the Supplier and its sub-contractors/supplier shall abide by such instructions and/or directions given by the Purchaser. The Supplier shall be solely responsible to ensure that the Services under this Purchase Order is carried out safely, under proper supervision and with all requite safety requirement, using safe apparels, safe tools and in accordance with any applicable Laws. The Supplier shall be solely responsible for deputing technically qualified personnel to perform the Services under this Purchase Order. The Purchaser and its Clients reverses the right to audit Safety system and processes including audit of adherence of safety norms anytime at actual site by themselves or by any third party.'
  ];
  
  addWrappedText(page3Text, 35);
  
  // PAGE 4
  doc.addPage();
  addHeaderFooter(4);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const page4Text = [
    '14. Human Rights. The Supplier shall respect internationally proclaimed human rights, and shall avoid being complicit in human rights abuses of any kind. The supplier shall respect the personal dignity, privacy and rights of each individual.',
    '15. Forced Labour. The Supplier shall not use forced of compulsory labour, including, but not limited to, debt bonded labour. The Supplier shall ensure that the work relationship between the Worker and the Supplier is freely chosen and free from threats.',
    '16. Child Labour. The Supplier shall not employ or use child labour. In these Principles "Child" means anyone under 15 years of age, unless national or local law stipulates a higher mandatory school leaving or minimum working age, in which case the higher age shall apply. "Child labour" means any work by child or young person unless it is considered acceptable under the ILO Minimum Age Convention 1973 (C 138). If any child is found working at the premises of the Supplier, it shall immediately take steps to redress the situation in accordance with the best interests of the child. The Supplier shall secure that persons under the age of 18 do not perform any hazardous work. In these Principles "hazardous work" means work which exposes children to physical, psychological or sexual abuse; work underground, under water, at dangerous heights, in confined spaces; work with dangerous machinery, equipment and tools, or which involves the handling or transport of heavy loads; exposure to hazardous substances, agents or processes, temperatures, noise levels or vibrations; particularly difficult conditions such as work for long hours or at night or where the child is unreasonably confined to the premises of the Supplier.',
    '17. Employment conditions. The Supplier shall provide remuneration that meets any national legal standard on minimum wage. The basis on which Workers are being paid is to be clearly conveyed to them in a timely manner. The Supplier shall secure that working hours are not excessive and as a minimum comply with applicable local laws. The Supplier shall respect the individual Workers need for recovery and secure that all Workers have the right to adequate leave from work with pay. The Supplier shall secure that all Workers are provided with written agreements of employment setting out employment conditions in a language understandable to the Worker.',
    '18. Health & Safety. The Supplier shall secure that the Workers are provided with a healthy and safe working environment in accordance with internationally recognised standards. The Supplier shall do its utmost to control hazards and take necessary precautionary measures against accidents and occupational diseases. Whenever necessary Workers are to be provided with, and instructed to use, appropriate personal protective equipment. The Supplier shall provide adequate and regular training to ensure that workers are adequately educated on health and safety issues. The Supplier shall secure that, where it provides accommodation, it shall be clean, safe and meet the basis need of the Workers, and, where appropriate, for their families.',
    '19. Environment. The Supplier shall take a precautionary approach towards environmental challenges, undertake initiatives to promote greater environmental responsibility, and encourage the development and diffusion of environmentally friendly technologies. The Supplier shall minimize its environmental impact and continuously improve its environmental performance.',
    '20. Non Solicitation. The Supplier shall abstain from approaching any of the Purchaser Clients directly for any business for a period of 1 year from the date of execution of the activity under this Purchase Order.',
    '21. Cancellation and Modifications. Purchaser may, at any time prior to Supplier\'s acceptance of this Purchase Order (as specified in Section 2 above), cancel or modify this Purchase Order without liability or obligation to Supplier except to pay the Supplier for (a) the estimated costs that would have been incurred by Supplier to complete and deliver the cancelled Goods, and (b) the reasonable value of the cancelled Goods at the time of cancellation; if these are conveyed before commencement of work.',
    '22. Successors and Assigns. Supplier will not assign this Purchase Order (in whole or part) without Purchaser\'s prior written consent. Any assignment without Purchaser\'s consent will be voidable at Purchaser\'s option. Subject to the foregoing restrictions, the Purchase Order will be fully binding upon, inure to the benefit of and be enforceable by Supplier, Purchaser and their respective successors and assigns.',
    '23. Applicable Law. The Purchase Order will be governed by the laws of India. Any dispute arising out of or in respect to the Purchase Order will be determined by the courts of Haryana.',
    '24. No Waiver. Failure by any party to insist on compliance with any of the terms of this Purchase Order or to exercise any right hereunder will not constitute a waiver by such party of such compliance or right.',
    '25. Cumulative Rights. The rights and remedies of the parties under this Purchase Order are cumulative, and either party may enforce any of its rights or remedies under this Purchase Order or other rights and remedies available to it at law or in equity.',
    '26. Construction. The section headings of this Purchase Order are for convenience only and have no interpretive value.',
    '27. Limitation of Liability. Purchaser is not liable under any circumstances for lost opportunities or profits, or for consequential, special, punitive or indirect damages of any kind. CONFIDENTIALITY: The Vendor/Supplier hereby agree that the "confidential information" relating to Ecoagritek AI Solutions Private Limited and/or its clients shall mean and include all information of Ecoagritek AI Solutions Private Limited and/or its clients which are disclosed, furnished or communicated by any mode, and hand written and marked Confidential , type written or machine written and marked Confidential, readable form, text, drawings, graphics, designs, plans, figures, documents, paper books, plans, sketches, formulae, accounts, records, photographs, slides, floppies, discs or any form of modern information in words and or figures including compilation of data, facts, queries, statements or correspondence or any other forms, all the drawings, electronic documents, written data or other tangible information, including without limitation, written or printed documents and computer disks or tapes, whether machine or user readable or in any storage form, electronic or otherwise which are disclosed to'
  ];
  
  addWrappedText(page4Text, 35);
  
  // PAGE 5
  doc.addPage();
  addHeaderFooter(5);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const page5Text = [
    'Vendor/Supplier and whether or not marked confidential. "Confidential information" shall include ideas, concepts, techniques, procedure, design, drawings, specifications; marketing techniques, materials, and plans; customer and vendor data; information relating to group companies; business policy or practices; financial projections, data and other related information only in respect of the Purpose set out herein. All the above said shall be treated as absolute secret and confidential and will impose a similar duty of confidentiality on any person to whom it is permitted to share such information and shall not disclose to any person such information otherwise than in these terms.',
    'OBLIGATIONS OF THE VENDOR/SUPPLIER',
    'a) In consideration of the disclosure and release of the Confidential Information by or on behalf of Ecoagritek AI Solutions Private Limited and/or its clients to the Vendor/Supplier the Vendor/Supplier shall hold and keep in strictest confidence any and all such confidential information.',
    'b) The Vendor/Supplier undertakes that its Representatives shall make use of the Confidential Information, directly or indirectly, solely for the purpose of considering, evaluating and effecting for the purpose of the Project and not for the Vendor\'s/Supplier\'s own benefit or for the benefit of any other person/entity by whatever name, for whatever reason. The Confidential Information shall not be used by the Vendor/Supplier in any way detrimental to the interests or reputation of Ecoagritek AI Solutions Private Limited and/or its clients',
    'c) The Vendor/Supplier herein shall take all steps and measures to minimize the risk of disclosure of the Confidential Information received; by ensuring that only such Representatives who are directly involved in the Project and whose duties require those to possess the Confidential Information shall have access to the Confidential Information strictly on a "need-to-know" basis. For such scope, these persons who need to have access to the Confidential Information shall sign, individually and previously a declaration of adherence to this Agreement, or bound them by confidentiality terms substantially equal to those set forth in this Agreement.',
    'd) The Vendor/Supplier shall take all reasonable security precautions, at least as equivalent to the precautions it takes to protect its own confidential information, to keep confidential the Confidential Information.',
    'e) The Vendor/Supplier shall keep all documents and other material containing, reflecting, or which are generated from any of the Confidential Information (a) separated from all other documents and materials; (b) at the usual place of business of the Vendor/Supplier;',
    'f) The Vendor/Supplier shall keep a written record of all documents and other materials which contain or reflect or are generated from any Confidential Information specifying the individuals who have had access to any such information, documents or other materials. Such record shall be at any time made available by the Vendor/Supplier to Ecoagritek AI Solutions Private Limited and/or its clients for inspection/verification.',
    'g)The Vendor/Supplier herein undertake to notify Ecoagritek AI Solutions  Private Limited and/or its clients immediately upon the discovery of any unauthorised use or disclosure of Confidential Information or any other breach of this Agreement by any third Party and the Vendor/Supplier shall co-operate with Ecoagritek AI Solutions Private Limited and/or its clients in every reasonable way to help regain possession of the Confidential Information and prevent its further unauthorised use.',
    'h)In the event the Vendor/Supplier or any of their representative are obliged to disclose any confidential information as a result of a Court Order or pursuant to government action, the Vendor/Supplier shall take all possible steps to inform Ecoagritek AI Solutions Private Limited and/or its clients before giving such Confidential Information.',
    'i) Vendor/Supplier agrees that it will ensure that its employees, officers and directors will make reasonable efforts to ensure that its agent will hold in confidence all such classified information, data and will not disclose the same to any third party or use such Confidential Information or any part thereof without Ecoagritek AI Solutions  Private Limited and/or its clients prior written approval.',
    'j) All information, notes analysis, compilations, studies, specifications, drawings or other documents received by Vendor/Supplier from Ecoagritek AI Solutions Private Limited and/or its clients and or its Representatives in connection with the proposed Project shall be deemed to be the property of Ecoagritek AI Solutions  Private Limited and/or its clients.',
    'k)The disclosure of proprietary information shall not be construed to grant the Vendor/Supplier a license of any type of any technology, patents, patent applications, trade secrets, copyrights, know-how, or trademarks owned or controlled by Ecoagritek AI Solutions  Private Limited and/or its clients.',
    'l) The Vendor/Supplier shall immediately advise Ecoagritek AI Solutions Private Limited and/or its clients. of any unauthorized disclosure, misappropriation or misuse or accidental disclosure by any persons of the Confidential Information upon Vendor/Supplier having Knowledge of the same. In such an event the Vendor/Supplier / shall make all the reasonable efforts to remedy the situation and Unless waived in writing by Ecoagritek AI Solutions Private Limited and/or its clients.',
    'm) These terms shall be valid and binding upon the Vendor/Supplier and shall remain in effect for a period of 5(five) years from the date hereof.',
    'n) The Vendor/Supplier agrees that monetary damages would not be a sufficient remedy for Ecoagritek AI Solutions Private Limited and/or its clients. for any breach of this Agreement by Vendor/Supplier and that in addition to the remedies provided in this Agreement and any other remedies, Ecoagritek AI Solutions Private Limited and/or its clients. shall be entitled to specific performance and injunctive or other equitable relief as a remedy for any such breach.'
  ];
  
  addWrappedText(page5Text, 35);
  
  // PAGE 6
  doc.addPage();
  addHeaderFooter(6);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const page6Text = [
    'that in addition to the remedies provided in this Agreement and any other remedies, Ecoagritek AI Solutions Private Limited and/or its clients. shall be entitled to specific performance and injunctive or other equitable relief as a remedy for any such breach.'
  ];
  
  y = addWrappedText(page6Text, 35);
  
  y += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('For Mayukh Kumar', 15, y);
  doc.text('ECOAGRITEK AI SOLUTIONS PRIVATE LIMITED', 120, y);
  
  y += 5;
  doc.text('Supackstar', 15, y);
  doc.text('(Prepared By)', 120, y);
  
  y += 15;
  doc.text('Authorized Signatory', 15, y);
  doc.text('(Authorized Signatory)', 120, y);
  
  if (returnBase64) {
    return doc.output('dataurlstring').split('base64,')[1];
  } else {
    doc.save(`PurchaseOrder_${poData.poNumber || 'PO-001'}.pdf`);
  }
};
