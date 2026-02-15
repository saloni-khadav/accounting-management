import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const BankReconciliation = () => {
  const [collections, setCollections] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingNarration, setEditingNarration] = useState(null);
  const [editingRemarks, setEditingRemarks] = useState(null);
  const [selectedBank, setSelectedBank] = useState('All Banks');
  const [selectedPeriod, setSelectedPeriod] = useState('All Time');

  const narrationOptions = ['Rent', 'Salary', 'Asset', 'Travel Expenses', 'Subscription'];
  const bankOptions = ['All Banks', 'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'];
  const periodOptions = ['All Time', 'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026'];

  const handleNarrationChange = async (index, value) => {
    const transaction = filteredTransactions[index];
    const updatedFiltered = [...filteredTransactions];
    updatedFiltered[index].selectedNarration = value;
    setFilteredTransactions(updatedFiltered);
    
    const originalIndex = transactions.findIndex(t => 
      (t.type === 'collection' ? t.collectionId : t.paymentId) === 
      (transaction.type === 'collection' ? transaction.collectionId : transaction.paymentId)
    );
    const updatedTransactions = [...transactions];
    updatedTransactions[originalIndex].selectedNarration = value;
    setTransactions(updatedTransactions);
    setEditingNarration(null);
    
    try {
      await fetch('http://localhost:5001/api/bank-reconciliation/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.type === 'collection' ? transaction.collectionId : transaction.paymentId,
          transactionType: transaction.type,
          narration: value,
          remarks: transaction.remarks
        })
      });
    } catch (error) {
      console.error('Error saving narration:', error);
    }
  };

  const handleRemarksChange = async (index, value) => {
    const transaction = filteredTransactions[index];
    const updatedFiltered = [...filteredTransactions];
    updatedFiltered[index].remarks = value;
    setFilteredTransactions(updatedFiltered);
    
    const originalIndex = transactions.findIndex(t => 
      (t.type === 'collection' ? t.collectionId : t.paymentId) === 
      (transaction.type === 'collection' ? transaction.collectionId : transaction.paymentId)
    );
    const updatedTransactions = [...transactions];
    updatedTransactions[originalIndex].remarks = value;
    setTransactions(updatedTransactions);
    
    try {
      await fetch('http://localhost:5001/api/bank-reconciliation/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.type === 'collection' ? transaction.collectionId : transaction.paymentId,
          transactionType: transaction.type,
          narration: transaction.selectedNarration || '',
          remarks: value
        })
      });
    } catch (error) {
      console.error('Error saving remarks:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, selectedBank, selectedPeriod]);

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (selectedBank !== 'All Banks') {
      filtered = filtered.filter(t => {
        // Normalize bank names for comparison
        const transactionBank = (t.bankName || '').toLowerCase().replace(/\s+/g, '').replace(/ltd\.?|limited|bank/gi, '');
        const selectedBankNorm = selectedBank.toLowerCase().replace(/\s+/g, '').replace(/ltd\.?|limited|bank/gi, '');
        return transactionBank.includes(selectedBankNorm) || selectedBankNorm.includes(transactionBank);
      });
    }
    
    if (selectedPeriod !== 'All Time') {
      filtered = filtered.filter(t => {
        const [day, month, year] = t.date.split('/');
        const transactionMonth = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        return transactionMonth === selectedPeriod;
      });
    }
    
    setFilteredTransactions(filtered);
  };

  const loadSavedReconciliations = async (transactions) => {
    try {
      const response = await fetch('http://localhost:5001/api/bank-reconciliation');
      const savedData = await response.json();
      
      return transactions.map(t => {
        const saved = savedData.find(s => 
          s.transactionId === (t.type === 'collection' ? t.collectionId : t.paymentId) && 
          s.transactionType === t.type
        );
        return {
          ...t,
          selectedNarration: saved?.narration || '',
          remarks: saved?.remarks || t.remarks
        };
      });
    } catch (error) {
      console.error('Error loading saved reconciliations:', error);
      return transactions;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const collectionsRes = await fetch('http://localhost:5001/api/collections');
      const collectionsData = await collectionsRes.json();
      
      const paymentsRes = await fetch('http://localhost:5001/api/payments');
      const paymentsData = await paymentsRes.json();
      
      const invoicesRes = await fetch('http://localhost:5001/api/invoices');
      const invoicesData = await invoicesRes.json();
      
      const billsRes = await fetch('http://localhost:5001/api/bills');
      const billsData = await billsRes.json();
      
      const clientsRes = await fetch('http://localhost:5001/api/clients');
      const clientsData = await clientsRes.json();
      
      const vendorsRes = await fetch('http://localhost:5001/api/vendors');
      const vendorsData = await vendorsRes.json();
      
      setCollections(collectionsData);
      
      const formattedTransactions = [
        ...collectionsData
          .filter(col => col.approvalStatus === 'Approved')
          .map(col => {
            const invoice = invoicesData.find(inv => inv.invoiceNumber === col.invoiceNumber);
            const client = clientsData.find(c => c.clientName === col.customer);
            const bankAmt = invoice ? invoice.grandTotal : col.netAmount;
            const bookAmt = col.netAmount;
            const tdsAmt = col.tdsAmount || 0;
            const bankName = client?.bankName || col.bankName || 'HDFC Bank';
            return {
              date: new Date(col.collectionDate).toLocaleDateString('en-IN'),
              bankAmount: bankAmt,
              bookAmount: bookAmt,
              tdsAmount: tdsAmt,
              bankName: bankName,
              partyName: col.customer || 'N/A',
              narration: '',
              selectedNarration: '',
              remarks: '',
              status: bankAmt === bookAmt ? 'matched' : 'unmatched',
              type: 'collection',
              collectionId: col._id,
              timestamp: new Date(col.createdAt || col.collectionDate)
            };
          }),
        ...paymentsData
          .filter(payment => payment.status === 'Completed')
          .map(payment => {
            const bill = billsData.find(b => b.billNumber === payment.invoiceNumber);
            const vendor = vendorsData.find(v => v.vendorName === payment.vendor);
            const bankAmt = bill ? bill.grandTotal : payment.netAmount;
            const bookAmt = payment.netAmount;
            // Get TDS from both payment and bill
            const paymentTds = payment.tdsAmount || 0;
            const billTds = bill ? (bill.tdsAmount || 0) : 0;
            const tdsAmt = Math.max(paymentTds, billTds); // Use the higher TDS value
            const bankName = vendor?.bankName || payment.bankName || 'HDFC Bank';
            return {
              date: new Date(payment.paymentDate).toLocaleDateString('en-IN'),
              bankAmount: bankAmt,
              bookAmount: bookAmt,
              tdsAmount: tdsAmt,
              bankName: bankName,
              partyName: payment.vendor || 'N/A',
              narration: '',
              selectedNarration: '',
              remarks: '',
              status: bankAmt === bookAmt ? 'matched' : 'unmatched',
              type: 'payment',
              paymentId: payment._id,
              timestamp: new Date(payment.createdAt || payment.paymentDate)
            };
          })
      ];
      
      const sortedTransactions = formattedTransactions.sort((a, b) => b.timestamp - a.timestamp);
      const transactionsWithSaved = await loadSavedReconciliations(sortedTransactions);
      setTransactions(transactionsWithSaved);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Reconciliation</h1>
        <p className="text-sm text-gray-600">Match bank transactions with your books</p>
      </div>

      {loading && <div className="text-center py-8 text-gray-500">Loading...</div>}

      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Account</label>
            <select 
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
            >
              {bankOptions.map(bank => <option key={bank} value={bank}>{bank}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Period</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
            >
              {periodOptions.map(period => <option key={period} value={period}>{period}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-6">
        <div className="bg-blue-50 rounded-lg p-5 shadow-sm border border-blue-100">
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-blue-700">Bank Total</div>
          <div className="text-2xl font-bold text-blue-900">₹{filteredTransactions.reduce((s, t) => s + (t.bankAmount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-5 shadow-sm border border-green-100">
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-green-700">Books Total</div>
          <div className="text-2xl font-bold text-green-900">₹{filteredTransactions.reduce((s, t) => s + (t.bookAmount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-5 shadow-sm border border-purple-100">
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-purple-700">TDS Total</div>
          <div className="text-2xl font-bold text-purple-900">₹{filteredTransactions.reduce((s, t) => s + (t.tdsAmount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-5 shadow-sm border border-red-100">
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-red-700">Difference</div>
          <div className="text-2xl font-bold text-red-900">₹{Math.abs(filteredTransactions.reduce((s, t) => s + (t.bankAmount || 0), 0) - filteredTransactions.reduce((s, t) => s + (t.bookAmount || 0), 0) + filteredTransactions.reduce((s, t) => s + (t.tdsAmount || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Bank</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Book</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Party</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Narration</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider w-48">Remarks</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 text-sm text-gray-900 font-medium">{t.date}</td>
                  <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">₹{(t.bankAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">₹{(t.bookAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-3.5 px-4 text-sm text-gray-900">{t.partyName}</td>
                  <td className="py-3.5 px-4 text-sm w-32">
                    {editingNarration === i ? (
                      <select value={t.selectedNarration || ''} onChange={(e) => handleNarrationChange(i, e.target.value)} onBlur={() => setEditingNarration(null)} autoFocus className="w-full px-2 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm">
                        <option value="">Select...</option>
                        {narrationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <span onClick={() => setEditingNarration(i)} className="cursor-pointer text-gray-900 hover:text-blue-600 font-medium">{t.selectedNarration || 'Select'}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-sm w-48">
                    {editingRemarks === i ? (
                      <input type="text" value={t.remarks} onChange={(e) => handleRemarksChange(i, e.target.value)} onBlur={() => setEditingRemarks(null)} autoFocus className="w-full px-0 py-1 text-sm border-0 focus:outline-none bg-transparent" />
                    ) : (
                      <span onClick={() => setEditingRemarks(i)} className="cursor-pointer text-gray-600 hover:text-gray-900 block truncate">{t.remarks || 'Add remarks'}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${t.status === 'matched' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {t.status === 'matched' ? 'Matched' : 'Unmatched'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && !loading && <div className="text-center py-12 text-gray-500 text-sm">No transactions found</div>}
      </div>
    </div>
  );
};

export default BankReconciliation;
