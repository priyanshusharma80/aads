export interface Column<T = any> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  width?: number;
  minWidth?: number;
  maxWidth?: number
  sortable?: boolean
  filterable?: boolean;
}

export interface SortConfig {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [columnId: string]: string
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  rowHeight?: number
  onRowClick?: (row: T, index: number) => void
  className?: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string
  salary: number
  hireDate: string;
  status: string
}
