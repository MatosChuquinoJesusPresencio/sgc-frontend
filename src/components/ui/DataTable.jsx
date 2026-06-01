import TablePagination from "./TablePagination"
import EmptyState from "./EmptyState"

const DataTable = ({
  headers,
  isEmpty,
  emptyMessage,
  emptyIcon,
  paginationProps,
  children,
  variant,
  title,
  actionButton,
  actionButtonClick,
  searchBar,
}) => {
  if (variant === "dashboard") {
    return (
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">{title}</span>
          {actionButton && (
            <button className="btn btn-ghost btn-sm" onClick={actionButtonClick}>
              {actionButton} →
            </button>
          )}
        </div>
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr>
                  <td colSpan={headers.length}>
                    <EmptyState message={emptyMessage} icon={emptyIcon} />
                  </td>
                </tr>
              ) : (
                children
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="data-table-wrapper">
      {searchBar && <div className="data-table-search">{searchBar}</div>}
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={headers.length}>
                  <EmptyState message={emptyMessage} icon={emptyIcon} />
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
      {paginationProps && <TablePagination {...paginationProps} />}
    </div>
  )
}

export default DataTable
