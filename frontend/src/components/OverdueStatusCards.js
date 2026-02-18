import React from 'react';

const OverdueStatusCards = ({ stats = {} }) => {
  const statusCards = [
    {
      title: 'Overdue',
      count: stats.overdue || 0,
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      textColor: 'text-red-900',
      labelColor: 'text-red-700',
      borderColor: 'border-red-200',
      iconColor: 'text-red-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Due Soon',
      count: stats.dueSoon || 0,
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      textColor: 'text-orange-900',
      labelColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Not Paid',
      count: stats.notPaid || 0,
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      textColor: 'text-gray-900',
      labelColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Partially Paid',
      count: stats.partiallyPaid || 0,
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      textColor: 'text-yellow-900',
      labelColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      title: 'Fully Paid',
      count: stats.fullyPaid || 0,
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      textColor: 'text-green-900',
      labelColor: 'text-green-700',
      borderColor: 'border-green-200',
      iconColor: 'text-green-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {statusCards.map((card, index) => (
        <div 
          key={index}
          className={`${card.bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ${card.borderColor} border`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-medium ${card.labelColor}`}>
              {card.title}
            </h3>
            <div className={card.iconColor}>
              {card.icon}
            </div>
          </div>
          <p className={`text-3xl font-bold ${card.textColor}`}>
            {card.count}
          </p>
        </div>
      ))}
    </div>
  );
};

export default OverdueStatusCards;