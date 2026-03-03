import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const VendorBillSubmit = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [poData, setPOData] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [billData, setBillData] = useState({
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    invoiceFile: null
  });

  useEffect(() => {
    const poId = searchParams.get('po');
    const vendorId = searchParams.get('vendor');
    const token = searchParams.get('token');

    if (poId && vendorId && token) {
      fetchPODetails(poId, vendorId, token);
    }
  }, [searchParams]);

  const fetchPODetails = async (poId, vendorId, token) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    try {
      const response = await fetch(`${baseUrl}/api/vendor-bill/po-details?po=${poId}&vendor=${vendorId}&token=${token}`);
      if (response.ok) {
        const data = await response.json();
        setPOData(data.po);
        setVendorData(data.vendor);
      }
    } catch (error) {
      console.error('Error fetching PO details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    
    const formData = new FormData();
    formData.append('poId', searchParams.get('po'));
    formData.append('vendorId', searchParams.get('vendor'));
    formData.append('token', searchParams.get('token'));
    formData.append('billNumber', billData.billNumber);
    formData.append('billDate', billData.billDate);
    if (billData.invoiceFile) {
      formData.append('invoice', billData.invoiceFile);
    }

    try {
      const response = await fetch(`${baseUrl}/api/vendor-bill/submit`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting bill:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bill Submitted Successfully!</h2>
          <p className="text-gray-600">Your bill has been submitted for approval. You will be notified once it's reviewed.</p>
        </div>
      </div>
    );
  }

  if (!poData || !vendorData) {
    return <div className="flex items-center justify-center min-h-screen">Invalid link or expired</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Submit Bill for Purchase Order</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="font-bold text-blue-800">PO Details</h3>
          <p className="text-sm text-blue-700">PO Number: {poData.poNumber}</p>
          <p className="text-sm text-blue-700">PO Date: {new Date(poData.poDate).toLocaleDateString('en-GB')}</p>
          <p className="text-sm text-blue-700">Amount: ₹{poData.totalAmount?.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bill Number *</label>
            <input
              type="text"
              required
              value={billData.billNumber}
              onChange={(e) => setBillData({...billData, billNumber: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your bill/invoice number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bill Date *</label>
            <input
              type="date"
              required
              value={billData.billDate}
              onChange={(e) => setBillData({...billData, billDate: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Invoice (PDF) *</label>
            <input
              type="file"
              required
              accept=".pdf"
              onChange={(e) => setBillData({...billData, invoiceFile: e.target.files[0]})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Submit Bill for Approval
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorBillSubmit;
