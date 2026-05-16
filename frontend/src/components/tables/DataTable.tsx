import React from 'react';

interface DataTableProps {
  columns: string[];
  data: Record<string, any>[];
}

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {columns.map((col) => (
              <td key={`${idx}-${col}`}>{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
