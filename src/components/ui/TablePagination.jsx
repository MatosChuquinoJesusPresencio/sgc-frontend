import { ChevronLeft, ChevronRight } from "lucide-react";

const TablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsShowing,
}) => {
  if (!totalItems || totalItems === 0) return null;

  return (
    <div className="pagination">
      <div className="pagination-info">
        Mostrando <strong>{itemsShowing}</strong> de <strong>{totalItems}</strong> registros
      </div>
      {totalPages > 1 && (
        <div className="pagination-btns">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={14} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`pagination-btn ${i + 1 === currentPage ? "active" : ""}`}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TablePagination;
