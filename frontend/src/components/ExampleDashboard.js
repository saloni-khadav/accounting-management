import React, { useState, useEffect } from 'react';
import OverdueStatusCards from './OverdueStatusCards';

const ExampleDashboard = () => {
  const [overdueStats, setOverdueStats] = useState({
    overdue: 0,
    dueSoon: 0,
    notPaid: 0,
    partiallyPaid: 0,
    fullyPaid: 0
  });

  useEffect(() => {
    // Example of fetching overdue statistics
    fetchOverdueStats();
  }, []);

  const fetchOverdueStats = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/invoices/overdue-stats');
      if (response.ok) {
        const data = await response.json();
        setOverdueStats(data);
      }
    } catch (error) {
      console.error('Error fetching overdue stats:', error);
      // Set example data for demonstration
      setOverdueStats({
        overdue: 12,
        dueSoon: 8,
        notPaid: 25,
        partiallyPaid: 15,
        fullyPaid: 142
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Invoice Status Dashboard</h1>
      
      {/* Overdue Status Cards */}
      <div className="mb-8">
        <OverdueStatusCards stats={overdueStats} />
      </div>
      
      {/* Rest of your dashboard content */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Additional Dashboard Content</h2>
        <p className="text-gray-600">Your other dashboard components go here...</p>
      </div>
    </div>
  );
};

export default ExampleDashboard;