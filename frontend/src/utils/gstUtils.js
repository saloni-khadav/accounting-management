// GST validation utility
export const validateGST = (gstNumber) => {
  if (!gstNumber) return { isValid: false, error: 'GST number is required' };
  
  // Remove spaces and convert to uppercase
  const cleanGST = gstNumber.replace(/\s/g, '').toUpperCase();
  
  // Check length
  if (cleanGST.length !== 15) {
    return { isValid: false, error: 'GST number must be 15 characters long' };
  }
  
  // Check format: 2 digits + 5 letters + 4 digits + 1 letter + 1 digit/letter + Z + 1 digit/letter
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstRegex.test(cleanGST)) {
    return { isValid: false, error: 'Invalid GST number format' };
  }
  
  return { isValid: true, cleanGST };
};

// Extract PAN from GST number
export const extractPANFromGST = (gstNumber) => {
  if (!gstNumber || gstNumber.length < 12) return '';
  return gstNumber.substring(2, 12);
};

// Format GST number for display
export const formatGSTForDisplay = (gstNumber) => {
  if (!gstNumber) return '';
  const clean = gstNumber.replace(/\s/g, '');
  if (clean.length !== 15) return gstNumber;
  
  return `${clean.substring(0, 2)} ${clean.substring(2, 7)} ${clean.substring(7, 11)} ${clean.substring(11, 12)} ${clean.substring(12, 13)} ${clean.substring(13, 14)} ${clean.substring(14, 15)}`;
};