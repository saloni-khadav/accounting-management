// Utility function to determine GST type based on company and vendor GST numbers
export const determineGSTType = (companyGST, vendorGST) => {
  if (!companyGST || !vendorGST) {
    return { type: 'CGST_SGST', cgstRate: 9, sgstRate: 9, igstRate: 0 };
  }

  // Extract first two digits (state code) from GST numbers
  const companyStateCode = companyGST.substring(0, 2);
  const vendorStateCode = vendorGST.substring(0, 2);

  // If state codes are same, use CGST + SGST, otherwise use IGST
  if (companyStateCode === vendorStateCode) {
    return { type: 'CGST_SGST', cgstRate: 9, sgstRate: 9, igstRate: 0 };
  } else {
    return { type: 'IGST', cgstRate: 0, sgstRate: 0, igstRate: 18 };
  }
};

// Function to apply GST rates to all items
export const applyGSTRates = (items, gstType) => {
  return items.map(item => ({
    ...item,
    cgstRate: gstType.cgstRate,
    sgstRate: gstType.sgstRate,
    igstRate: gstType.igstRate
  }));
};