import { Employee } from '../types';

const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Design', 'Product'];
const positions = ['Manager', 'Senior', 'Lead', 'Junior', 'Director', 'VP', 'Associate', 'Coordinator'];
const statuses = ['Active', 'On Leave', 'Remote'];
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Skyler', 'Drew'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

export const generateMockData = (count: number): Employee[] => {
  const data: Employee[] = [];
  const startDate = new Date('2015-01-01').getTime();
  const endDate = new Date('2024-12-31').getTime();

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const hireDate = new Date(startDate + Math.random() * (endDate - startDate));

    data.push({
      id: i + 1,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      salary: Math.floor(Math.random() * (200000 - 50000) + 50000),
      hireDate: hireDate.toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }

  return data;
};

// CSV export Utility
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  columns: Array<{ id: string; header: string; accessor: keyof T | ((row: T) => any) }>,
  filename: string = 'export.csv'
): void => {
  if (data.length === 0) return;

  const headers = columns.map(col => col.header).join(',');

  const rows = data.map(row => {
    return columns.map(col => {
      const value = typeof col.accessor === 'function'
        ? col.accessor(row)
        : row[col.accessor];

      // since need to escape comma's and quotes for CSV
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  }).join('\n');

  const csv = `${headers}\n${rows}`;

  // downlod the file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getCellValue = <T>(row: T, accessor: keyof T | ((row: T) => any)): any => {
  return typeof accessor === 'function' ? accessor(row) : row[accessor];
};
