import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

const APReport = () => {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
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
      const [billsResponse, paymentsResponse] = await Promise.all([
        fetch('http://localhost:5001/api/bills'),
        fetch('http://localhost:5001/api/payments')
      ]);
      
      if (billsResponse.ok) {
        const billsData = await billsResponse.json();
        setBills(billsData);
      }
      
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // Calculate metrics from real data
  const invoicesProcessed = bills.length;
  const invoicesPaid = bills.filter(bill => bill.status === 'Fully Paid').length;
  const totalPaid = payments
    .filter(payment => payment.status === 'Completed')
    .reduce((sum, payment) => sum + payment.netAmount, 0);

  // Generate vendor chart data
  const getVendorData = () => {
    const vendorStats = {};
    
    bills.forEach(bill => {
      const vendorName = bill.vendorName;
      if (!vendorStats[vendorName]) {
        vendorStats[vendorName] = { name: vendorName, value: 0 };
      }
      vendorStats[vendorName].value += 1;
    });
    
    return Object.values(vendorStats)
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)
      .map(vendor => ({
        name: vendor.name.length > 10 ? vendor.name.substring(0, 10) + '...' : vendor.name,
        value: vendor.value
      }));
  };

  const vendorData = getVendorData();
  const uniqueVendors = [...new Set(bills.map(bill => bill.vendorName))];

  const periods = ['This Quarter', 'This Month', 'Last Month', 'This Year', 'Last Year'];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">AP Report</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border">
          <label className="text-gray-600 mb-2 block">Period:</label>
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
        <div className="bg-white p-4 rounded-lg border">
          <label className="text-gray-600 mb-2 block">Vendor:</label>
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

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Invoices Processed</p>
          <p className="text-4xl font-bold">{loading ? '...' : invoicesProcessed}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Invoices Paid</p>
          <p className="text-4xl font-bold">{loading ? '...' : invoicesPaid}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Total Paid</p>
          <p className="text-4xl font-bold">{loading ? '...' : `₹${totalPaid.toLocaleString('en-IN')}`}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-6">Invoices by Vendor</h2>
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
              <Tooltip />
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
