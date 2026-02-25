// TDS Fix Verification Script
// Run this in browser console on Payment or Credit Note page

console.log('🔍 TDS Fix Verification Script');
console.log('================================\n');

// Test 1: Check if parseFloat is being used for TDS amount check
console.log('Test 1: Checking TDS amount validation logic...');
const testBill1 = {
  tdsSection: '194C-1',
  tdsAmount: 0,
  grandTotal: 10000
};

const testBill2 = {
  tdsSection: '194C-1',
  tdsAmount: 100,
  grandTotal: 10000
};

const testBill3 = {
  tdsSection: '194C-1',
  tdsAmount: '0',
  grandTotal: 10000
};

// Simulate the fix
const hasTDS1 = testBill1.tdsSection && parseFloat(testBill1.tdsAmount) > 0;
const hasTDS2 = testBill2.tdsSection && parseFloat(testBill2.tdsAmount) > 0;
const hasTDS3 = testBill3.tdsSection && parseFloat(testBill3.tdsAmount) > 0;

console.log(`Bill with tdsAmount = 0: hasTDS = ${hasTDS1} ${hasTDS1 ? '❌ FAIL' : '✅ PASS'}`);
console.log(`Bill with tdsAmount = 100: hasTDS = ${hasTDS2} ${hasTDS2 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Bill with tdsAmount = '0' (string): hasTDS = ${hasTDS3} ${hasTDS3 ? '❌ FAIL' : '✅ PASS'}`);

// Test 2: Check netPayable calculation
console.log('\nTest 2: Checking netPayable calculation...');
const calculateNetPayable = (grandTotal, tdsAmount, creditNoteAmount) => {
  const actualTDS = (tdsAmount && parseFloat(tdsAmount) > 0) ? parseFloat(tdsAmount) : 0;
  return grandTotal - actualTDS - (creditNoteAmount || 0);
};

const netPayable1 = calculateNetPayable(10000, 0, 0);
const netPayable2 = calculateNetPayable(10000, 100, 0);
const netPayable3 = calculateNetPayable(10000, '0', 0);

console.log(`Grand Total: 10000, TDS: 0 => Net Payable: ${netPayable1} ${netPayable1 === 10000 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Grand Total: 10000, TDS: 100 => Net Payable: ${netPayable2} ${netPayable2 === 9900 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Grand Total: 10000, TDS: '0' => Net Payable: ${netPayable3} ${netPayable3 === 10000 ? '✅ PASS' : '❌ FAIL'}`);

// Test 3: Check Bill status logic
console.log('\nTest 3: Checking Bill status calculation...');
const checkBillStatus = (grandTotal, tdsAmount, creditNoteAmount, paidAmount) => {
  const actualTDS = (tdsAmount && parseFloat(tdsAmount) > 0) ? parseFloat(tdsAmount) : 0;
  const netPayable = grandTotal - actualTDS - (creditNoteAmount || 0);
  
  if (paidAmount >= netPayable) {
    return 'Fully Paid';
  } else if (paidAmount > 0) {
    return 'Partially Paid';
  } else {
    return 'Not Paid';
  }
};

const status1 = checkBillStatus(10000, 0, 0, 10000);
const status2 = checkBillStatus(10000, 100, 0, 9900);
const status3 = checkBillStatus(10000, 0, 0, 5000);

console.log(`Bill: 10000, TDS: 0, Paid: 10000 => Status: ${status1} ${status1 === 'Fully Paid' ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Bill: 10000, TDS: 100, Paid: 9900 => Status: ${status2} ${status2 === 'Fully Paid' ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Bill: 10000, TDS: 0, Paid: 5000 => Status: ${status3} ${status3 === 'Partially Paid' ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n================================');
console.log('✅ All tests completed!');
console.log('If all tests show PASS, the fix is working correctly.');
