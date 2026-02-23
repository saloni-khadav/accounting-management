import React from 'react';

const MetricsCard = ({ title, value, bgColor = 'bg-blue-500' }) => {
  return (
    <div className={`${bgColor} text-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="text-sm mb-2">{title}</div>
      <div className="text-5xl font-bold">{value}</div>
    </div>
  );
};

export default MetricsCard;
