import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import DatePicker from './ui/DatePicker';
import { generatePONumber } from '../utils/numberGenerator';

const CreatePO = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [supplierData, setSupplierData] = useState({
    gstNumber: '',
    billingAddress: '',
    contactPerson: '',
    email: '',
    contactDetails: ''
  });
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getNextPONumber = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/pos/next-number');
      if (response.ok) {
        const data = await response.json();
        return data.poNumber;
      }
    } catch (error) {
      console.error('Error fetching PO number:', error);
    }
    // Dynamic fallback based on current year
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    return `PO-${yearCode}-001`;
  };

  const [poNumber, setPoNumber] = useState(() => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    return `PO-${yearCode}-001`;
  });

  // Fetch next PO number on component mount
  useEffect(() => {
    const fetchPONumber = async () => {
      const nextNumber = await getNextPONumber();
      setPoNumber(nextNumber);
    };
    fetchPONumber();
  }, []);
  const [poDate, setPoDate] = useState(getCurrentDate());
  const [deliveryDate, setDeliveryDate] = useState(getCurrentDate());
  const [items, setItems] = useState([
    { name: '', hsn: '', quantity: 0, rate: 0, discount: 0 }
  ]);

  // Filter clients based on search
  const filteredClients = clients.filter(client => 
    client.clientName.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/clients');
      if (response.ok) {
        const clientsData = await response.json();
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client._id);
    setSupplierSearch(client.clientName);
    setShowDropdown(false);
    setSupplierData({
      gstNumber: client.gstNumber || '',
      billingAddress: client.billingAddress || '',
      contactPerson: client.contactPerson || '',
      email: client.email || '',
      contactDetails: client.contactDetails || ''
    });
  };

  const handleSupplierSearchChange = (e) => {
    setSupplierSearch(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setSelectedClient('');
      setSupplierData({
        gstNumber: '',
        billingAddress: '',
        contactPerson: '',
        email: '',
        contactDetails: ''
      });
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', hsn: '', quantity: 0, rate: 0, discount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateDiscount = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.rate;
      return sum + (itemTotal * item.discount / 100);
    }, 0);
  };

  const calculateTax = () => {
    const afterDiscount = calculateSubTotal() - calculateDiscount();
    return afterDiscount * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubTotal() - calculateDiscount() + calculateTax();
  };

  const resetForm = () => {
    setSelectedClient('');
    setSupplierSearch('');
    setSupplierData({
      gstNumber: '',
      billingAddress: '',
      contactPerson: '',
      email: '',
      contactDetails: ''
    });
    setPoDate(getCurrentDate());
    setDeliveryDate(getCurrentDate());
    setItems([{ name: '', hsn: '', quantity: 0, rate: 0, discount: 0 }]);
  };

  const handleCreatePO = async () => {
    const confirmed = window.confirm('Do you want to create this Purchase Order?');
    if (!confirmed) return;

    try {
      const poData = {
        poNumber,
        supplier: selectedClient,
        supplierName: supplierSearch,
        poDate,
        deliveryDate,
        gstNumber: supplierData.gstNumber,
        items,
        subTotal: calculateSubTotal(),
        totalDiscount: calculateDiscount(),
        tax: calculateTax(),
        totalAmount: calculateTotal()
      };

      const response = await fetch('http://localhost:5001/api/pos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(poData)
      });

      if (response.ok) {
        alert('Purchase Order created successfully!');
        resetForm();
        // Get next PO number
        const nextNumber = await getNextPONumber();
        setPoNumber(nextNumber);
      } else {
        alert('Error creating Purchase Order');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating Purchase Order');
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Purchase Order</h1>
      </div>

      {/* All Fields in One Row */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Supplier</label>
          <div className="relative">
            <input
              type="text"
              value={supplierSearch}
              onChange={handleSupplierSearchChange}
              onFocus={() => setShowDropdown(true)}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg"
              placeholder="Search or select supplier"
            />
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown size={20} />
            </button>
            {showDropdown && filteredClients.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {filteredClients.map(client => (
                  <div
                    key={client._id}
                    onMouseDown={() => handleClientSelect(client)}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    {client.clientName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">PO Number</label>
          <input 
            type="text" 
            value={poNumber} 
            onChange={(e) => setPoNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg" 
            placeholder="Enter PO Number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">PO Date</label>
          <DatePicker 
            value={poDate} 
            onChange={setPoDate} 
            placeholder="Select PO Date" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Delivery Date</label>
          <DatePicker 
            value={deliveryDate} 
            onChange={setDeliveryDate} 
            placeholder="Select Delivery Date" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">GST Number</label>
          <input 
            type="text" 
            value={supplierData.gstNumber} 
            onChange={(e) => setSupplierData({...supplierData, gstNumber: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg" 
            placeholder="Enter GST Number"
          />
        </div>
      </div>

      {/* Item Details and Summary Side by Side */}
      <div className="flex gap-8 mb-8">
        {/* Item Details */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4">Item Details</h2>
          
          <div className="grid grid-cols-12 gap-4 mb-3 text-sm font-medium text-gray-600">
            <div className="col-span-3">Item Name</div>
            <div className="col-span-2">HSN/SAC</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Rate</div>
            <div className="col-span-2">Discount</div>
            <div className="col-span-1">Action</div>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 mb-3">
              <input 
                type="text" 
                value={item.name}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].name = e.target.value;
                  setItems(newItems);
                }}
                className="col-span-3 p-3 border border-gray-300 rounded-lg"
                placeholder="Item Name"
              />
              <input 
                type="text" 
                value={item.hsn}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].hsn = e.target.value;
                  setItems(newItems);
                }}
                className="col-span-2 p-3 border border-gray-300 rounded-lg"
                placeholder="HSN/SAC"
              />
              <input 
                type="number" 
                value={item.quantity}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].quantity = parseInt(e.target.value) || 0;
                  setItems(newItems);
                }}
                className="col-span-2 p-3 border border-gray-300 rounded-lg"
                placeholder="Qty"
              />
              <input 
                type="number" 
                value={item.rate}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].rate = parseInt(e.target.value) || 0;
                  setItems(newItems);
                }}
                className="col-span-2 p-3 border border-gray-300 rounded-lg"
                placeholder="Rate"
              />
              <input 
                type="number" 
                value={item.discount}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].discount = parseInt(e.target.value) || 0;
                  setItems(newItems);
                }}
                className="col-span-2 p-3 border border-gray-300 rounded-lg"
                placeholder="Discount %"
              />
              <button 
                onClick={() => removeItem(idx)}
                className="col-span-1 p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                disabled={items.length === 1}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button 
            onClick={addItem}
            className="flex items-center gap-2 text-blue-600 font-medium mt-4 hover:text-blue-700"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {/* Summary */}
        <div className="w-80">
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span>Sub Total</span>
              <span className="font-semibold">₹ {calculateSubTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>₹ {calculateDiscount().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹ {calculateTax().toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-xl font-bold">
              <span>Total Amount</span>
              <span>₹ {calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button 
          onClick={handleCreatePO}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default CreatePO;
