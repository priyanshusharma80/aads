import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { SortConfig, FilterConfig, DataTableProps } from '../types';
import { getCellValue, exportToCSV } from '../utils';
import './DataTable.css';

function DataTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  height = 600,
  rowHeight = 48,
  onRowClick,
  className = ''
}: DataTableProps<T>) {
  const [columns, setColumns] = useState(initialColumns);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<FilterConfig>({});
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  const parentRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter data method
  const filteredData = useMemo(() => {
    let result = [...data];

    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue.trim()) {
        const column = columns.find(col => col.id === columnId);
        if (column) {
          result = result.filter(row => {
            const value = getCellValue(row, column.accessor);
            return String(value).toLowerCase().includes(filterValue.toLowerCase());
          });
        }
      }
    })

    return result;
  }, [data, filters, columns]);

  // sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const column = columns.find(col => col.id === sortConfig.columnId);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getCellValue(a, column.accessor);
      const bValue = getCellValue(b, column.accessor)

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    })
  }, [filteredData, sortConfig, columns]);

  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => rowHeight, [rowHeight]),
    overscan: 10
  });

  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    setSortConfig(current => {
      if (!current || current.columnId !== columnId) {
        return { columnId, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { columnId, direction: 'desc' };
      }
      return null; // back to unsorted
    });
  };

  // Filter handler setting filters.
  const handleFilter = (columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  // when resizing happens .
  const handleResizeStart = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    setResizingColumn(columnId)
    setResizeStartX(e.clientX)
    setResizeStartWidth(column.width || 150);
    // console.log('resizing happening', columnId); 
  };

  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX;
      const newWidth = Math.max(100, resizeStartWidth + diff); // min width 100px

      setColumns(prev =>
        prev.map(col =>
          col.id === resizingColumn
            ? { ...col, width: newWidth }
            : col
        )
      );
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedCell) return;

      const { row, col } = focusedCell;
      let newRow = row;
      let newCol = col;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRow = Math.max(0, row - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRow = Math.min(sortedData.length - 1, row + 1)
          break;
        case 'ArrowLeft':
          e.preventDefault()
          newCol = Math.max(0, col - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newCol = Math.min(columns.length - 1, col + 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (onRowClick) onRowClick(sortedData[row], row)
          break;
        case 'Escape':
          setFocusedCell(null)
          break;
        default:
          return;
      }

      if (newRow !== row || newCol !== col) {
        setFocusedCell({ row: newRow, col: newCol });
        rowVirtualizer.scrollToIndex(newRow, { align: 'auto' }); // scroll into view
      }
    };

    if (focusedCell) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [focusedCell, sortedData.length, columns.length, onRowClick, rowVirtualizer, sortedData]);

  const handleExport = () => exportToCSV(sortedData, columns, 'data-export.csv');

  return (
    <div className={`data-table-container ${className}`}>
      <div className="data-table-toolbar">
        <div className="toolbar-left">
          <h2 className="table-title">Data Table</h2>
          <span className="table-stats">
            {sortedData.length.toLocaleString()} {sortedData.length === 1 ? 'row' : 'rows'}
            {filteredData.length < data.length && ` (filtered from ${data.length.toLocaleString()})`}
          </span>
        </div>
        <div className="toolbar-right">
          <button onClick={handleExport} className="export-btn" title="Export to CSV">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div
        ref={parentRef}
        className="data-table-scroll"
        style={{ height: `${height}px` }}
      >
        <div
          ref={tableRef}
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative'
          }}
        >
          <div className="data-table-header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <div className="data-table-row header-row">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className={`data-table-cell header-cell ${column.sortable ? 'sortable' : ''}`}
                  style={{
                    width: column.width || 150,
                    minWidth: column.minWidth || 100,
                    maxWidth: column.maxWidth
                  }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="header-content">
                    <span className="header-text">{column.header}</span>
                    {column.sortable && (
                      <span className="sort-indicator">
                        {sortConfig?.columnId === column.id && (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        )}
                      </span>
                    )}
                  </div>
                  {column.filterable && (
                    <input
                      type="text"
                      className="filter-input"
                      placeholder="Filter..."
                      value={filters[column.id] || ''}
                      onChange={(e) => handleFilter(column.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <div
                    className="resize-handle"
                    onMouseDown={(e) => handleResizeStart(e, column.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
            const row = sortedData[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                className="data-table-row body-row"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
                onClick={() => onRowClick?.(row, virtualRow.index)}
              >
                {columns.map((column, colIndex) => {
                  const isFocused = focusedCell?.row === virtualRow.index && focusedCell?.col === colIndex;
                  return (
                    <div
                      key={column.id}
                      className={`data-table-cell body-cell ${isFocused ? 'focused' : ''}`}
                      style={{
                        width: column.width || 150,
                        minWidth: column.minWidth || 100,
                        maxWidth: column.maxWidth
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedCell({ row: virtualRow.index, col: colIndex });
                      }}
                      tabIndex={isFocused ? 0 : -1}
                    >
                      {String(getCellValue(row, column.accessor))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {sortedData.length === 0 && (
        <div className="empty-state">
          <p>No data to display</p>
          {Object.keys(filters).some(key => filters[key]) && (
            <button onClick={() => setFilters({})} className="clear-filters-btn">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;