import React from 'react';
import { cn } from './index';

export const Table = ({ children, className }) => (
  <div className="overflow-x-auto">
    <table className={cn("w-full text-left", className)}>
      {children}
    </table>
  </div>
);

export const THead = ({ children }) => (
  <thead>
    <tr className="border-b border-secondary-100 dark:border-secondary-800">
      {children}
    </tr>
  </thead>
);

export const TBody = ({ children }) => (
  <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
    {children}
  </tbody>
);

export const Th = ({ children, className }) => (
  <th className={cn("pb-4 font-semibold text-secondary-500 text-sm px-4", className)}>
    {children}
  </th>
);

export const Td = ({ children, className }) => (
  <td className={cn("py-4 px-4 text-sm text-secondary-600 dark:text-secondary-400", className)}>
    {children}
  </td>
);
