import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const ApprovalsWorkflows = () => {
  const [activeTab, setActiveTab] = useState('approvals');

  const approvals = [
    { flow: 'Bills Approval', date: 'May 12, 2023', status: 'Pending' },
    { flow: 'PO Approval', date: 'Apr 28, 2023', status: 'Approved' },
    { flow: 'Payments Review', date: 'Apr 20, 2023', status: 'Approved' },
    { flow: 'Bills Approval', date: 'Apr 15, 2023', status: 'Rejected' }
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Approvals & Workflows</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex gap-8 mb-8 border-b">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 font-medium ${activeTab === 'approvals' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Approvals
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`pb-3 font-medium ${activeTab === 'workflows' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Workflows
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-6">My Approvals</h2>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Pending Requests</p>
          <p className="text-4xl font-bold">2</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Approved</p>
          <p className="text-4xl font-bold">4</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Rejected</p>
          <p className="text-4xl font-bold">1</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-4 font-semibold">Flow Name</th>
              <th className="text-left p-4 font-semibold">Request Date</th>
              <th className="text-left p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((item, index) => (
              <tr key={index} className="border-b last:border-b-0">
                <td className="p-4">{item.flow}</td>
                <td className="p-4">{item.date}</td>
                <td className="p-4">
                  <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                    item.status === 'Pending' ? 'bg-yellow-500 text-white' :
                    item.status === 'Approved' ? 'bg-green-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center items-center gap-2 p-4 border-t">
          <button className="px-3 py-1 hover:bg-gray-100 rounded">&lt;</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
          <button className="px-3 py-1 hover:bg-gray-100 rounded">2</button>
          <button className="px-3 py-1 hover:bg-gray-100 rounded">3</button>
          <button className="px-3 py-1 hover:bg-gray-100 rounded">4</button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsWorkflows;
