import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, Calendar, Download, IndianRupee } from 'lucide-react';
import * as XLSX from 'xlsx';

const TDSReconciliation = () => {
  const [tdsData, setTdsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    fetchTDSData();
  }, []);

  const fetchTDSData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/tds');
      if (response.ok) {
        const data = await response.json();
        setTdsData(data);
      }
    } catch (error) {
      console.error('Error fetching TDS data:', error);
    }
    setLoading(false);
  };

  // Calculate current month TDS (1st to end of month)
  const getCurrentMonthRange = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getCurrentMonthRange();
  const currentMonthTDS = tdsData
    .filter(item => {
      const itemDate = new Date(item.invoiceDate);
      return itemDate >= startDate && itemDate < endDate;
    })
    .reduce((sum, item) => sum + (item.tdsAmount || 0), 0);

  // Count invoices with TDS
  const invoicesWithTDS = tdsData.length;

  // Count bills where TDS should be deducted but is not (taxable > threshold but TDS = 0)
  const notDeducted = tdsData.filter(item => 
    item.taxableValue > 30000 && item.tdsAmount === 0
  ).length;

  // Calculate next TDS due date (7th of next month)
  const getNextDueDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 7);
    return nextMonth.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Filter data based on selected filters
  const filteredData = tdsData.filter(item => {
    const sectionMatch = selectedSection === 'All' || item.tdsSection === selectedSection;
    let filterMatch = true;
    
    if (selectedFilter === 'Mismatch') {
      // Show mismatches: where TDS should be deducted but isn't, or incorrect calculation
      const expectedTDS = (item.taxableValue * (item.tdsSection === '194C' ? 1 : 10)) / 100;
      filterMatch = Math.abs(item.tdsAmount - expectedTDS) > 1 || (item.taxableValue > 30000 && item.tdsAmount === 0);
    } else if (selectedFilter === 'Not Deducted') {
      filterMatch = item.taxableValue > 30000 && item.tdsAmount === 0;
    }
    
    return sectionMatch && filterMatch;
  });

  // Get unique TDS sections
  const tdsSections = ['All', ...new Set(tdsData.map(item => item.tdsSection).filter(Boolean))];

  const applyFilters = () => {
    // Filters are applied automatically through filteredData
  };

  const exportToExcel = () => {
    const exportData = filteredData.map(item => ({
      'Date': new Date(item.invoiceDate).toLocaleDateString('en-GB'),
      'Invoice No.': item.invoiceNo,
      'Party': item.vendorName,
      'TDS Section': item.tdsSection || 'N/A',
      'Taxable Amount': item.taxableValue,
      'TDS Deducted': item.tdsAmount
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TDS Reconciliation');
    XLSX.writeFile(wb, `TDS_Reconciliation_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">TDS Reconciliation</h1>
        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Download size={18} />
          Export to Excel
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">TDS Amount</p>
              <p className="text-xs text-gray-500 mb-1">(This Month)</p>
              <p className="text-2xl font-bold text-gray-900">₹ {currentMonthTDS.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 rounded-lg text-green-600 bg-green-50">
              <IndianRupee size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Invoices with TDS</p>
              <p className="text-2xl font-bold text-gray-900">{invoicesWithTDS}</p>
            </div>
            <div className="p-3 rounded-lg text-blue-600 bg-blue-50">
              <FileText size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Not Deducted</p>
              <p className="text-xs text-gray-500 mb-1">Where Applicable</p>
              <p className="text-2xl font-bold text-red-600">{notDeducted}</p>
            </div>
            <div className="p-3 rounded-lg text-red-600 bg-red-50">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Due Date</p>
              <p className="text-xl font-bold text-gray-900">{getNextDueDate()}</p>
            </div>
            <div className="p-3 rounded-lg text-purple-600 bg-purple-50">
              <Calendar size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm">Section</span>
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            {tdsSections.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Mismatch">Mismatch</option>
            <option value="Not Deducted">Not Deducted</option>
          </select>
        </div>
        <button 
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={applyFilters}
        >
          Apply Filters
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Invoice No.</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Party</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">TDS Section</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Taxable Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">TDS Deducted</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {new Date(item.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">{item.invoiceNo}</td>
                  <td className="px-4 py-3">{item.vendorName}</td>
                  <td className="px-4 py-3">{item.tdsSection || 'N/A'}</td>
                  <td className="px-4 py-3">₹ {item.taxableValue.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">₹ {item.tdsAmount.toLocaleString('en-IN')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No TDS records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TDSReconciliation;