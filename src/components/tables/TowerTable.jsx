import { useState, useMemo } from "react";
import { Building2, Edit3, Trash2 } from "lucide-react";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../ui/DataTable";
import SearchBar from "../ui/SearchBar";

const TowerTable = ({ data, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    return data.filter((t) =>
      t.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  const { currentPage, setCurrentPage, totalPages, paginatedData } = usePagination(filtered);

  return (
    <>
      <div className="mb-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Buscar torre por nombre..."
        />
      </div>
      <DataTable
        headers={["Nombre de la Torre", "ID Referencia", "Acciones"]}
        isEmpty={paginatedData.length === 0}
        emptyMessage="No hay torres registradas."
        emptyIcon={Building2}
        paginationProps={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          totalItems: filtered.length,
          itemsShowing: paginatedData.length,
        }}
      >
        {paginatedData.map((tower) => (
          <tr key={tower.id}>
            <td>
              <div className="cell-label">
                <div className="cell-icon primary">
                  <Building2 size={14} />
                </div>
                <div className="cell-title">{tower.nombre}</div>
              </div>
            </td>
            <td><span className="text-muted">#{tower.id}</span></td>
            <td>
              <div className="cell-actions">
                <button className="btn btn-outline btn-sm" onClick={() => onEdit(tower)}>
                  <Edit3 size={13} /> Editar
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => onDelete(tower)}>
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
};

export default TowerTable;
