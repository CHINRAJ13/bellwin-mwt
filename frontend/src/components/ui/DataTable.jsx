import { Table, THead, TBody, TR, TH, TD } from './Table';
import Loading from './Loading';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import { ClipboardList } from 'lucide-react';

const DataTable = ({
  headers = [],
  data = [],
  renderRow,
  loading = false,
  emptyMessage = "No records found",
  pagination,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-none border border-gray-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {loading ? (
        <Loading size="md" />
      ) : data.length === 0 ? (
        <EmptyState icon={ClipboardList} description={emptyMessage} />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                {headers.map((h, i) => (
                  <TH key={i} className={typeof h === 'object' ? h.className || '' : ''}>
                    {typeof h === 'string' ? h : h.label}
                  </TH>
                ))}
              </TR>
            </THead>
            <TBody>
              {data.map((row, index) => renderRow(row, index))}
            </TBody>
          </Table>
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;
