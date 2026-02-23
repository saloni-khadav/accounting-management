import React from 'react';

const DataTable = ({ title, columns, data, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-card-border p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column, index) => (
                <th 
                  key={index}
                  className="text-left py-3 px-4 font-medium text-gray-600 text-sm"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="py-3 px-4 text-sm">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
