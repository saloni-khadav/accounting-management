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
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-lg px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">TDS Reconciliation</h1>
              <p className="text-white text-sm sm:text-base">Monitor TDS deductions and compliance</p>
            </div>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8 lg:mb-10">
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-5 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group min-h-[130px]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2">
              <div className="flex items-start justify-end mb-1">
                <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <IndianRupee className="w-4 h-4" strokeWidth={2} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">TDS Amount</p>
                <p className="text-xs text-gray-400 mb-2">(This Month)</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 truncate">₹{currentMonthTDS.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-5 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group min-h-[130px]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2">
              <div className="flex items-start justify-end mb-1">
                <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <FileText className="w-4 h-4" strokeWidth={2} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Invoices with TDS</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 truncate">{invoicesWithTDS}</p>
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-5 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group min-h-[130px]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2">
              <div className="flex items-start justify-end mb-1">
                <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Not Deducted</p>
                <p className="text-xs text-gray-400 mb-2">Where Applicable</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 truncate">{notDeducted}</p>
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-5 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group min-h-[130px]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2">
              <div className="flex items-start justify-end mb-1">
                <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Due Date</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 truncate">{getNextDueDate()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8 lg:mb-10">
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Section</label>
                <select 
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  {tdsSections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Filter</label>
                <select 
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Mismatch">Mismatch</option>
                  <option value="Not Deducted">Not Deducted</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <h3 className="text-base sm:text-lg font-semibold text-white">TDS Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice No.</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Party</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">TDS Section</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Taxable Amount</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">TDS Deducted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 text-sm text-gray-900 font-medium whitespace-nowrap">
                        {new Date(item.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-900 whitespace-nowrap">{item.invoiceNo}</td>
                      <td className="py-3.5 px-4 text-sm text-gray-900 whitespace-nowrap">{item.vendorName}</td>
                      <td className="py-3.5 px-4 text-sm text-gray-900 whitespace-nowrap">{item.tdsSection || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-gray-900 whitespace-nowrap">₹{item.taxableValue.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-gray-900 whitespace-nowrap">₹{item.tdsAmount.toLocaleString('en-IN')}</td>
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
      </div>
    </div>
  );
};

export default TDSReconciliation;
