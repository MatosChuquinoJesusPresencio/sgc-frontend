import { AlertTriangle, X } from "lucide-react"
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
  error,
  onErrorDismiss,
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
      {error && (
        <div className="flex items-center gap-3" style={{
          padding: "12px 16px",
          background: "var(--danger-light)",
          borderBottom: "1px solid rgba(var(--danger-rgb), 0.15)",
          color: "var(--danger)",
          fontSize: 13,
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span className="fw-bold" style={{ flex: 1 }}>{error}</span>
          {onErrorDismiss && (
            <button className="btn btn-ghost btn-sm" onClick={onErrorDismiss} style={{ padding: 2, color: "var(--danger)" }}>
              <X size={14} />
            </button>
          )}
        </div>
      )}
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
