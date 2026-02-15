import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = ({ value, onChange, placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dateInputRef = useRef(null);

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  return (
    <div className="relative">
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg pr-12 cursor-pointer"
        style={{ 
          colorScheme: 'light',
          WebkitAppearance: 'none',
          MozAppearance: 'textfield'
        }}
      />
      <button
        type="button"
        onClick={handleCalendarClick}
        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        <Calendar size={20} />
      </button>
      <style jsx>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default DatePicker;