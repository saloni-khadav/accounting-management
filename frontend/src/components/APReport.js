import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

const APReport = () => {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [creditDebitNotes, setCreditDebitNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Quarter');
  const [selectedVendor, setSelectedVendor] = useState('All Vendors');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billsResponse, paymentsResponse, notesResponse] = await Promise.all([
        fetch('https://nextbook-backend.nextsphere.co.in/api/bills'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/payments'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/credit-debit-notes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      
      if (billsResponse.ok) {
        const billsData = await billsResponse.json();
        
        // Get payments data
        let paymentsData = [];
        if (paymentsResponse.ok) {
          paymentsData = await paymentsResponse.json();
        }
        
        // Get credit/debit notes data
        let notesData = [];
        if (notesResponse.ok) {
          notesData = await notesResponse.json();
          const approvedNotes = notesData.filter(note => note.approvalStatus === 'approved');
          setCreditDebitNotes(approvedNotes);
        }
        
        // Calculate paid amounts for each bill (same logic as Bills component)
        const billsWithPaidAmounts = billsData
          .filter(bill => bill.approvalStatus === 'approved') // Only approved bills
          .map(bill => {
          const billPayments = paymentsData.filter(payment => 
            payment.billId === bill._id && 
            payment.approvalStatus === 'approved'
          );
          const totalPaid = billPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          
          return {
            ...bill,
            paidAmount: totalPaid
          };
        });
        
        setBills(billsWithPaidAmounts);
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // Helper function to get financial year and quarter
  const getFinancialYearAndQuarter = (date) => {
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();
    
    let financialYear, quarter;
    
    if (month >= 3) { // April to March (next year)
      financialYear = year;
    } else { // January to March
      financialYear = year - 1;
    }
    
    // Quarter mapping: Apr-Jun=1, Jul-Sep=2, Oct-Dec=3, Jan-Mar=4
    if (month >= 3 && month <= 5) quarter = 1; // Apr, May, Jun
    else if (month >= 6 && month <= 8) quarter = 2; // Jul, Aug, Sep
    else if (month >= 9 && month <= 11) quarter = 3; // Oct, Nov, Dec
    else quarter = 4; // Jan, Feb, Mar
    
    return { financialYear, quarter };
  };

  // Filter data based on selected period and vendor
  const getFilteredBills = () => {
    let filtered = [...bills];
    
    // Filter by vendor
    if (selectedVendor !== 'All Vendors') {
      filtered = filtered.filter(bill => bill.vendorName === selectedVendor);
    }
    
    // Filter by period
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const { financialYear: currentFY, quarter: currentQuarter } = getFinancialYearAndQuarter(now);
    
    filtered = filtered.filter(bill => {
      const billDate = new Date(bill.billDate || bill.createdAt);
      const billMonth = billDate.getMonth();
      const billYear = billDate.getFullYear();
      const { financialYear: billFY, quarter: billQuarter } = getFinancialYearAndQuarter(billDate);
      
      switch (selectedPeriod) {
        case 'This Month':
          return billYear === currentYear && billMonth === currentMonth;
        case 'Last Month':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return billYear === lastMonthYear && billMonth === lastMonth;
        case 'First Quarter': // Apr, May, Jun
          return billFY === currentFY && billQuarter === 1;
        case 'Second Quarter': // Jul, Aug, Sep
          return billFY === currentFY && billQuarter === 2;
        case 'Third Quarter': // Oct, Nov, Dec
          return billFY === currentFY && billQuarter === 3;
        case 'Fourth Quarter': // Jan, Feb, Mar
          return billFY === currentFY && billQuarter === 4;
        case 'Last Quarter':
          const lastQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
          const lastQuarterFY = currentQuarter === 1 ? currentFY - 1 : currentFY;
          return billFY === lastQuarterFY && billQuarter === lastQuarter;
        case 'This Year': // Apr current year to Mar next year
          return billFY === currentFY;
        case 'Last Year': // Apr last year to Mar current year
          return billFY === currentFY - 1;
        default:
          return true;
      }
    });
    
    return filtered;
  };
  
  const filteredBills = getFilteredBills();
  
  // Filter payments based on selected period and vendor
  const getFilteredPayments = () => {
    let filtered = [...payments];
    
    // Filter by vendor - match payments to bills of selected vendor
    if (selectedVendor !== 'All Vendors') {
      const vendorBillIds = filteredBills.map(bill => bill._id);
      filtered = filtered.filter(payment => vendorBillIds.includes(payment.billId));
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const { financialYear: currentFY, quarter: currentQuarter } = getFinancialYearAndQuarter(now);
    
    filtered = filtered.filter(payment => {
      const paymentDate = new Date(payment.paymentDate || payment.createdAt);
      const paymentMonth = paymentDate.getMonth();
      const paymentYear = paymentDate.getFullYear();
      const { financialYear: paymentFY, quarter: paymentQuarter } = getFinancialYearAndQuarter(paymentDate);
      
      switch (selectedPeriod) {
        case 'This Month':
          return paymentYear === currentYear && paymentMonth === currentMonth;
        case 'Last Month':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return paymentYear === lastMonthYear && paymentMonth === lastMonth;
        case 'First Quarter': // Apr, May, Jun
          return paymentFY === currentFY && paymentQuarter === 1;
        case 'Second Quarter': // Jul, Aug, Sep
          return paymentFY === currentFY && paymentQuarter === 2;
        case 'Third Quarter': // Oct, Nov, Dec
          return paymentFY === currentFY && paymentQuarter === 3;
        case 'Fourth Quarter': // Jan, Feb, Mar
          return paymentFY === currentFY && paymentQuarter === 4;
        case 'Last Quarter':
          const lastQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
          const lastQuarterFY = currentQuarter === 1 ? currentFY - 1 : currentFY;
          return paymentFY === lastQuarterFY && paymentQuarter === lastQuarter;
        case 'This Year': // Apr current year to Mar next year
          return paymentFY === currentFY;
        case 'Last Year': // Apr last year to Mar current year
          return paymentFY === currentFY - 1;
        default:
          return true;
      }
    });
    
    return filtered;
  };
  
  const filteredPayments = getFilteredPayments();

  // Function to calculate bill status based on payment and due date (same as Bills component)
  const calculateBillStatus = (bill) => {
    const netPayable = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
    const paidAmount = bill.paidAmount || 0;
    const currentDate = new Date();
    const dueDate = bill.dueDate ? new Date(bill.dueDate) : null;
    
    // Payment status takes priority
    if (paidAmount >= netPayable) {
      return 'Fully Paid';
    }
    
    if (paidAmount > 0 && paidAmount < netPayable) {
      return 'Partially Paid';
    }
    
    // Due date status only when no payment is made (paidAmount === 0)
    if (paidAmount === 0 && dueDate) {
      const timeDiff = dueDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff < 0) {
        return 'Overdue';
      } else if (daysDiff <= 7) {
        return 'Due Soon';
      } else {
        return 'Not Paid';
      }
    }
    
    // Default status when no due date is set
    return 'Not Paid';
  };

  // Calculate metrics from filtered data
  const invoicesProcessed = filteredBills.length;
  
  // Count fully paid and partially paid invoices using calculated status
  const fullyPaidInvoices = filteredBills.filter(bill => calculateBillStatus(bill) === 'Fully Paid').length;
  const partiallyPaidInvoices = filteredBills.filter(bill => calculateBillStatus(bill) === 'Partially Paid').length;
  
  const totalPaid = filteredPayments
    .filter(payment => payment.status === 'Completed')
    .reduce((sum, payment) => sum + payment.netAmount, 0);

  // Calculate total credit notes amount and count
  const creditNotesData = creditDebitNotes.filter(note => note.type === 'Credit Note' && note.status !== 'Cancelled');
  const totalCreditNotesAmount = creditNotesData.reduce((sum, note) => sum + (note.grandTotal || 0), 0);
  const totalCreditNotesCount = creditNotesData.length;

  // Generate vendor chart data from filtered bills
  const getVendorData = () => {
    const vendorStats = {};
    
    filteredBills.forEach(bill => {
      const vendorName = bill.vendorName;
      if (!vendorStats[vendorName]) {
        vendorStats[vendorName] = { 
          name: vendorName, 
          value: 0, 
          amount: 0 
        };
      }
      vendorStats[vendorName].value += 1;
      vendorStats[vendorName].amount += bill.grandTotal || 0;
    });
    
    return Object.values(vendorStats)
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)
      .map(vendor => ({
        name: vendor.name.length > 10 ? vendor.name.substring(0, 10) + '...' : vendor.name,
        fullName: vendor.name,
        value: vendor.value,
        amount: vendor.amount
      }));
  };

  const vendorData = getVendorData();
  const uniqueVendors = [...new Set(bills.map(bill => bill.vendorName))];

  const periods = ['This Month', 'Last Month', 'First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter', 'Last Quarter', 'This Year', 'Last Year'];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AP Report</h1>
        <p className="text-gray-600 text-lg mt-1">Accounts payable analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <label className="text-gray-700 font-semibold mb-3 block">Period:</label>
          <div className="relative">
            <div 
              className="flex items-center justify-between bg-white border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            >
              <span className="font-medium">{selectedPeriod}</span>
              <ChevronDown size={20} className="text-gray-400" />
            </div>
            {showPeriodDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10">
                {periods.map((period) => (
                  <div
                    key={period}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedPeriod(period);
                      setShowPeriodDropdown(false);
                    }}
                  >
                    {period}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <label className="text-gray-700 font-semibold mb-3 block">Vendor:</label>
          <div className="relative">
            <div 
              className="flex items-center justify-between bg-white border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowVendorDropdown(!showVendorDropdown)}
            >
              <span className="font-medium">{selectedVendor}</span>
              <ChevronDown size={20} className="text-gray-400" />
            </div>
            {showVendorDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                <div
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedVendor('All Vendors');
                    setShowVendorDropdown(false);
                  }}
                >
                  All Vendors
                </div>
                {uniqueVendors.map((vendor) => (
                  <div
                    key={vendor}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setShowVendorDropdown(false);
                    }}
                  >
                    {vendor}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200">
          <p className="text-sm font-medium text-blue-700 mb-2">Invoices Processed</p>
          <p className="text-4xl font-bold text-blue-900">{loading ? '...' : invoicesProcessed}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
          <p className="text-sm font-medium text-green-700 mb-2">Fully Paid Invoices</p>
          <p className="text-4xl font-bold text-green-900">{loading ? '...' : fullyPaidInvoices}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-700 mb-2">Partially Paid Invoices</p>
          <p className="text-4xl font-bold text-yellow-900">{loading ? '...' : partiallyPaidInvoices}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-200">
          <p className="text-sm font-medium text-purple-700 mb-2">Total Paid</p>
          <p className="text-3xl font-bold text-purple-900">{loading ? '...' : `₹${totalPaid.toLocaleString('en-IN')}`}</p>
        </div>
        <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200">
          <p className="text-sm font-medium text-blue-700 mb-2">Total Credit Notes</p>
          <p className="text-4xl font-bold text-blue-900">{loading ? '...' : totalCreditNotesCount}</p>
          <p className="text-sm text-blue-600 mt-1 font-semibold">₹{totalCreditNotesAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h2 className="text-xl font-bold text-gray-900">Invoices by Vendor</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        ) : vendorData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={vendorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'value') {
                    return [value, 'Invoices'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const vendor = vendorData.find(v => v.name === label);
                  return vendor ? vendor.fullName : label;
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold">{data.fullName}</p>
                        <p className="text-blue-600">Invoices: {data.value}</p>
                        <p className="text-green-600">Amount: ₹{data.amount.toLocaleString('en-IN')}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#5ebbbb" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">No vendor data available</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APReport;
