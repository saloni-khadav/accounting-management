import React from 'react';

const MetricsCard = ({ title, value, change, changeType, icon: Icon, color = 'primary' }) => {
  return (
    <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
      
      <div className="flex items-start justify-between ml-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-1 break-words">{value}</p>
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
          <div className="flex-shrink-0 p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;