import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const ClientOutstanding = () => {
  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [currentOutstanding, setCurrentOutstanding] = useState(0);
  const [overdueOutstanding, setOverdueOutstanding] = useState(0);

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/invoices');
      if (response.ok) {
        const invoices = await response.json();
        processInvoiceData(invoices);
      }
    } catch (error) {
      console.error('Error fetching invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processInvoiceData = (invoices) => {
    // Filter unpaid invoices (Sent, Overdue status)
    const unpaidInvoices = invoices.filter(invoice => 
      ['Sent', 'Overdue'].includes(invoice.status)
    );

    // Group by client and calculate outstanding amounts
    const clientMap = {};
    let totalOutstandingAmount = 0;
    let currentOutstandingAmount = 0;
    let overdueOutstandingAmount = 0;

    unpaidInvoices.forEach(invoice => {
      const clientName = invoice.customerName;
      const invoiceAmount = invoice.grandTotal || 0;
      const tdsAmount = invoice.totalTax || 0; // Using total tax as TDS for now
      const totalReceivable = invoiceAmount;
      const totalOutstanding = invoiceAmount; // Assuming full amount is outstanding

      if (!clientMap[clientName]) {
        clientMap[clientName] = {
          clientName,
          invoices: []
        };
      }

      clientMap[clientName].invoices.push({
        invoiceNo: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('en-IN'),
        invoiceAmount: `₹${invoiceAmount.toLocaleString('en-IN')}`,
        tdsAmount: `₹${tdsAmount.toLocaleString('en-IN')}`,
        totalReceivable: `₹${totalReceivable.toLocaleString('en-IN')}`,
        totalOutstanding: `₹${totalOutstanding.toLocaleString('en-IN')}`,
        status: invoice.status
      });

      totalOutstandingAmount += totalOutstanding;
      
      if (invoice.status === 'Overdue') {
        overdueOutstandingAmount += totalOutstanding;
      } else {
        currentOutstandingAmount += totalOutstanding;
      }
    });

    // Convert to array format for table display
    const processedData = [];
    Object.values(clientMap).forEach(client => {
      client.invoices.forEach(invoice => {
        processedData.push({
          clientName: client.clientName,
          ...invoice
        });
      });
    });

    setClientData(processedData);
    setTotalOutstanding(totalOutstandingAmount);
    setCurrentOutstanding(currentOutstandingAmount);
    setOverdueOutstanding(overdueOutstandingAmount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Client Outstanding</h1>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Outstanding</h3>
          <p className="text-3xl font-bold text-gray-900">₹{totalOutstanding.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Current Outstanding</h3>
          <p className="text-3xl font-bold text-gray-900">₹{currentOutstanding.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">60+ Days Outstanding</h3>
          <p className="text-3xl font-bold text-red-600">₹{overdueOutstanding.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Client Overview Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Client Overview</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Client Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Invoice No.</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Invoice Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Invoice Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">TDS Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Total Receivable</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Total Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 px-6 text-center text-gray-500">
                    Loading outstanding data...
                  </td>
                </tr>
              ) : clientData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 px-6 text-center text-gray-500">
                    No outstanding data available
                  </td>
                </tr>
              ) : (
                clientData.map((client, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{client.clientName}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{client.invoiceNo}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{client.invoiceDate}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{client.invoiceAmount}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{client.tdsAmount}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{client.totalReceivable}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">{client.totalOutstanding}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientOutstanding;
