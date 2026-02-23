import React, { useState, useEffect } from 'react';
import { Download, DollarSign, Clock, AlertTriangle, FileText } from 'lucide-react';
import MetricsCard from './ui/MetricsCard';

const ClientOutstanding = () => {
  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [currentOutstanding, setCurrentOutstanding] = useState(0);
  const [overdueOutstanding, setOverdueOutstanding] = useState(0);

  useEffect(() => {
    fetchOutstandingData();
  }, []);

  const fetchOutstandingData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [invoicesRes, collectionsRes, creditNotesRes] = await Promise.all([
        fetch('https://nextbook-backend.nextsphere.co.in/api/invoices'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/collections'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/credit-notes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (invoicesRes.ok && collectionsRes.ok) {
        const invoices = await invoicesRes.json();
        const collections = await collectionsRes.json();
        const creditNotes = creditNotesRes.ok ? await creditNotesRes.json() : [];
        processOutstandingData(invoices, collections, creditNotes);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processOutstandingData = (invoices, collections, creditNotes) => {
    const approvedInvoices = invoices.filter(inv => inv.approvalStatus === 'Approved');
    const approvedCollections = collections.filter(col => col.approvalStatus === 'Approved');
    const approvedCreditNotes = creditNotes.filter(cn => cn.approvalStatus === 'Approved');

    const clientMap = {};
    let totalOutstandingAmount = 0;
    let currentOutstandingAmount = 0;
    let overdueOutstandingAmount = 0;

    approvedInvoices.forEach(invoice => {
      const clientName = invoice.customerName;
      const invoiceAmount = invoice.grandTotal || 0;
      
      // Calculate total collected for this invoice
      const invoiceCollections = approvedCollections.filter(col => 
        col.invoiceNumber?.includes(invoice.invoiceNumber)
      );
      const totalCollected = invoiceCollections.reduce((sum, col) => 
        sum + (parseFloat(col.netAmount) || parseFloat(col.amount) || 0), 0
      );
      
      // Calculate total credit notes for this invoice
      const invoiceCreditNotes = approvedCreditNotes.filter(cn => 
        cn.originalInvoiceNumber === invoice.invoiceNumber
      );
      const totalCredited = invoiceCreditNotes.reduce((sum, cn) => 
        sum + (parseFloat(cn.grandTotal) || 0), 0
      );
      
      // Calculate TDS from collections
      const totalTDS = invoiceCollections.reduce((sum, col) => 
        sum + (parseFloat(col.tdsAmount) || 0), 0
      );
      
      const totalSettled = totalCollected + totalCredited;
      const totalOutstanding = invoiceAmount - totalSettled - totalTDS;

      // Only show if there's outstanding amount
      if (totalOutstanding > 0) {
        if (!clientMap[clientName]) {
          clientMap[clientName] = { clientName, invoices: [] };
        }

        clientMap[clientName].invoices.push({
          invoiceNo: invoice.invoiceNumber,
          invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('en-IN'),
          invoiceAmount: `₹${invoiceAmount.toLocaleString('en-IN')}`,
          tdsAmount: `₹${totalTDS.toLocaleString('en-IN')}`,
          totalReceived: `₹${totalSettled.toLocaleString('en-IN')}`,
          totalOutstanding: `₹${totalOutstanding.toLocaleString('en-IN')}`,
          status: invoice.status
        });

        totalOutstandingAmount += totalOutstanding;
        
        const daysOverdue = Math.floor((new Date() - new Date(invoice.invoiceDate)) / (1000 * 60 * 60 * 24));
        if (daysOverdue > 60) {
          overdueOutstandingAmount += totalOutstanding;
        } else {
          currentOutstandingAmount += totalOutstanding;
        }
      }
    });

    const processedData = [];
    Object.values(clientMap).forEach(client => {
      client.invoices.forEach(invoice => {
        processedData.push({ clientName: client.clientName, ...invoice });
      });
    });

    setClientData(processedData);
    setTotalOutstanding(totalOutstandingAmount);
    setCurrentOutstanding(currentOutstandingAmount);
    setOverdueOutstanding(overdueOutstandingAmount);
  };

  const handleExportToExcel = () => {
    if (clientData.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = clientData.map(client => ({
      'Client Name': client.clientName,
      'Invoice No': client.invoiceNo,
      'Invoice Date': client.invoiceDate,
      'Invoice Amount': client.invoiceAmount.replace('₹', '').replace(/,/g, ''),
      'TDS Amount': client.tdsAmount.replace('₹', '').replace(/,/g, ''),
      'Total Received': client.totalReceived.replace('₹', '').replace(/,/g, ''),
      'Total Outstanding': client.totalOutstanding.replace('₹', '').replace(/,/g, '')
    }));

    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `client_outstanding_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h1 className="text-2xl font-bold">Client Outstanding</h1>
          <button 
            onClick={handleExportToExcel}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-medium transition-colors"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricsCard
          title="Total Outstanding"
          value={`₹${totalOutstanding.toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="primary"
        />
        <MetricsCard
          title="Current Outstanding"
          value={`₹${currentOutstanding.toLocaleString('en-IN')}`}
          icon={Clock}
          color="success"
        />
        <MetricsCard
          title="60+ Days Outstanding"
          value={`₹${overdueOutstanding.toLocaleString('en-IN')}`}
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      {/* Client Overview Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-3">
          <h2 className="text-lg font-semibold">Client Overview</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm uppercase tracking-wider">Client Name</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm uppercase tracking-wider">Invoice No.</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm uppercase tracking-wider">Invoice Date</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm uppercase tracking-wider">Invoice Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm uppercase tracking-wider">TDS Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm uppercase tracking-wider">Total Received</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm uppercase tracking-wider">Total Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                      <p className="text-gray-500">Loading outstanding data...</p>
                    </div>
                  </td>
                </tr>
              ) : clientData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 px-6 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">No outstanding data available</p>
                    <p className="text-gray-400 text-sm mt-1">Outstanding amounts will appear here</p>
                  </td>
                </tr>
              ) : (
                clientData.map((client, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{client.clientName}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{client.invoiceNo}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{client.invoiceDate}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{client.invoiceAmount}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{client.tdsAmount}</td>
                    <td className="py-4 px-6 text-sm text-green-600 font-medium">{client.totalReceived}</td>
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

