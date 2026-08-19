export const Table = ({ children, className = '' }) => (
  <div className="overflow-x-auto w-full">
    <table className={`w-full border-collapse text-left text-sm ${className}`}>
      {children}
    </table>
  </div>
);

export const THead = ({ children, className = '' }) => (
  <thead className={`bg-gray-50 border-b border-gray-200 ${className}`}>
    {children}
  </thead>
);

export const TBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-gray-100 ${className}`}>
    {children}
  </tbody>
);

export const TR = ({ children, className = '' }) => (
  <tr className={`transition-colors hover:bg-green-50/20 ${className}`}>
    {children}
  </tr>
);

export const TH = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TD = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-gray-900 ${className}`}>
    {children}
  </td>
);
