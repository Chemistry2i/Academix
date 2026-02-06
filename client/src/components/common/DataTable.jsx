// Academix - Data Table Component
import { useState, useMemo } from 'react';
import { Table, Form, Pagination, Badge } from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown, FaSearch } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

/**
 * DataTable - Reusable data table with sorting, filtering, and pagination
 */
const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  pageSize = 10,
  searchable = true,
  sortable = true,
  pagination = true,
  striped = true,
  hover = true,
  responsive = true,
  emptyMessage = 'No data available',
  onRowClick = null,
  selectedRows = [],
  onSelectionChange = null,
  actions = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.accessor];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ms-1 text-muted" />;
    return sortConfig.direction === 'asc' ? (
      <FaSortUp className="ms-1 text-primary" />
    ) : (
      <FaSortDown className="ms-1 text-primary" />
    );
  };

  const handleSelectAll = (e) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange(paginatedData.map((row) => row.id || row._id));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectRow = (rowId) => {
    if (onSelectionChange) {
      if (selectedRows.includes(rowId)) {
        onSelectionChange(selectedRows.filter((id) => id !== rowId));
      } else {
        onSelectionChange([...selectedRows, rowId]);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="py-5">
        <LoadingSpinner text="Loading data..." />
      </div>
    );
  }

  return (
    <div className="data-table">
      {/* Search and Actions Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {searchable && (
          <div className="position-relative" style={{ maxWidth: '300px' }}>
            <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
            <Form.Control
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="ps-5"
            />
          </div>
        )}
        <div className="d-flex align-items-center gap-2">
          {selectedRows.length > 0 && (
            <Badge bg="primary" className="me-2">
              {selectedRows.length} selected
            </Badge>
          )}
          {actions}
        </div>
      </div>

      {/* Table */}
      <div className={responsive ? 'table-responsive' : ''}>
        <Table striped={striped} hover={hover} className="mb-0">
          <thead className="table-light">
            <tr>
              {onSelectionChange && (
                <th style={{ width: '40px' }}>
                  <Form.Check
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((row) =>
                        selectedRows.includes(row.id || row._id)
                      )
                    }
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  style={{
                    cursor: sortable && col.sortable !== false ? 'pointer' : 'default',
                    minWidth: col.minWidth,
                    width: col.width,
                  }}
                  onClick={() => col.sortable !== false && handleSort(col.accessor)}
                >
                  <span className="d-flex align-items-center">
                    {col.header}
                    {sortable && col.sortable !== false && getSortIcon(col.accessor)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                  className="text-center py-4 text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || row._id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  className={
                    selectedRows.includes(row.id || row._id) ? 'table-primary' : ''
                  }
                >
                  {onSelectionChange && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <Form.Check
                        type="checkbox"
                        checked={selectedRows.includes(row.id || row._id)}
                        onChange={() => handleSelectRow(row.id || row._id)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.accessor}>
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}{' '}
            entries
          </small>
          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}
            <Pagination.Next
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DataTable;
