import React from 'react';

const MetricsCard = ({ title, value, change, changeType, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-50',
    success: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    danger: 'text-red-600 bg-red-50'
  };

  return (
    <div className="bg-white rounded-lg border border-card-border p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'positive' ? '+' : ''}{change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;