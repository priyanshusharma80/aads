import { useMemo } from 'react';
import DataTable from './components/DataTable';
import { useDarkMode } from './hooks/useDarkMode';
import { generateMockData } from './utils';
import { Column, Employee } from './types';
import { departments } from './utils';
import './App.css';

function App() {
  const [isDark, toggleDark] = useDarkMode();

  // getting generated 5000 + rows of mock data and using memoization)
  const data = useMemo(() => generateMockData(5000), []);

  const columns: Column<Employee>[] = useMemo(() => [
    {
      id: 'id',
      header: 'ID',
      accessor: 'id',
      width: 100,
      sortable: true,
      filterable: true
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      width: 200,
      sortable: true,
      filterable: true
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      width: 280,
      sortable: true,
      filterable: true
    },
    {
      id: 'department',
      header: 'Department',
      accessor: 'department',
      width: 150,
      sortable: true,
      // filterable: true
    },
    {
      id: 'position',
      header: 'Position',
      accessor: 'position',
      width: 150,
      sortable: true,
      filterable: true
    },
    {
      id: 'salary',
      header: 'Salary',
      accessor: (row) => `$${row.salary.toLocaleString()}`,
      width: 140,
      sortable: true,
      filterable: true
    },
    {
      id: 'hireDate',
      header: 'Hire Date',
      accessor: 'hireDate',
      width: 140,
      sortable: true,
      filterable: true
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      width: 120,
      sortable: true,
      filterable: true
    }
  ], []);

  const handleRowClick = (row: Employee, index: number) => {
    console.log('Row clicked:', row, 'at index:', index);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">

          <button
            onClick={toggleDark}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="table-container">

        <div>
          <label htmlFor="Filter by department"></label>
          <select onChange={(e) => {
            const filtered = e.target.value ? data.filter(emp => emp.department === e.target.value) : data;
          }}>
            <option value="">All Departments</option>
            {departments.map((item, index) => {
              return <option id={index.toString()} value={item}>{item}</option>
            })}
          </select>
        </div>

        <DataTable
          data={data}
          columns={columns}
          height={600}
          rowHeight={48}
          onRowClick={handleRowClick}
        />
      </main>
    </div>
  );
}

export default App;
