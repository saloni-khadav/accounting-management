// Auto-increment number generator utility

export const generateInvoiceNumber = () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
  
  // Get last invoice number from localStorage
  const lastInvoiceKey = `lastInvoice_${yearCode}`;
  const lastNumber = parseInt(localStorage.getItem(lastInvoiceKey) || '0');
  const newNumber = lastNumber + 1;
  
  // Store new number
  localStorage.setItem(lastInvoiceKey, newNumber.toString());
  
  // Format: INV. 2526001
  return `INV. ${yearCode}${newNumber.toString().padStart(3, '0')}`;
};

export const generateCreditNoteNumber = () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
  
  // Get last credit note number from localStorage
  const lastCreditNoteKey = `lastCreditNote_${yearCode}`;
  const lastNumber = parseInt(localStorage.getItem(lastCreditNoteKey) || '0');
  const newNumber = lastNumber + 1;
  
  // Store new number
  localStorage.setItem(lastCreditNoteKey, newNumber.toString());
  
  // Format: CN-2526001
  return `CN-${yearCode}${newNumber.toString().padStart(3, '0')}`;
};

export const resetYearlyCounters = () => {
  // Call this function at the start of each year to reset counters
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
  
  localStorage.setItem(`lastInvoice_${yearCode}`, '0');
  localStorage.setItem(`lastCreditNote_${yearCode}`, '0');
};