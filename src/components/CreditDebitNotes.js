import React from 'react';

const CreditDebitNotes = () => {
  const notesData = [
    { date: 'April 9.2024', noteNo: 'CN-0008', vendor: 'Ace Solutions', type: 'Credit Note', amount: '₹8,400', status: 'Open' },
    { date: 'April 7.2024', noteNo: 'CN-0007', vendor: 'Beacon Industries', type: 'Credit Note', amount: '₹17,200', status: 'Closed' },
    { date: 'April 5.2024', noteNo: 'DN-0005', vendor: 'Omni Enterprises', type: 'Debit Note', amount: '₹12,800', status: 'Closed' },
    { date: 'April 2.2024', noteNo: 'CN-0006', vendor: 'Vision Trade Ltd.', type: 'Credit Note', amount: '₹4,000', status: 'Closed' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Credit Notes / Debit Notes</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-600 mb-2">Credit Amount</h3>
          <p className="text-4xl font-bold text-gray-900">₹25,600</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-600 mb-2">Debit Amount</h3>
          <p className="text-4xl font-bold text-gray-900">₹12,800</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-600 mb-2">Net Amount</h3>
          <p className="text-4xl font-bold text-gray-900">₹12,800</p>
        </div>
      </div>

      {/* Note Details Table */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Note Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Note No.</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Vendor</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Type</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Amount</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Status</th>
              </tr>
            </thead>
            <tbody>
              {notesData.map((note, index) => (
                <tr key={note.noteNo} className="border-b border-gray-100">
                  <td className="py-5 px-4 text-gray-900">{note.date}</td>
                  <td className="py-5 px-4 text-gray-900">{note.noteNo}</td>
                  <td className="py-5 px-4 text-gray-900">{note.vendor}</td>
                  <td className="py-5 px-4 text-gray-900">{note.type}</td>
                  <td className="py-5 px-4 text-gray-900 font-semibold">{note.amount}</td>
                  <td className="py-5 px-4">
                    <span className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                      note.status === 'Open' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {note.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreditDebitNotes;
