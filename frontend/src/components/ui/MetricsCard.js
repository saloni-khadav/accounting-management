import React from 'react';

const MetricsCard = ({ title, value, change, changeType, icon: Icon, color = 'primary' }) => {
  return (
    <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-2xl"></div>
      
      <div className="flex items-start justify-between ml-2">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</p>
          <p className="text-3xl font-bold text-gray-700 mb-1">{value}</p>
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
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Icon size={26} strokeWidth={2.5} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;