import React from 'react';

const MetricsCard = ({ title, value, change, changeType, icon: Icon, color = 'primary' }) => {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-600 mb-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-semibold ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'positive' ? '↑' : '↓'} {change}
              </span>
              <span className="text-xs text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-4 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform duration-300">
            <Icon size={28} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;