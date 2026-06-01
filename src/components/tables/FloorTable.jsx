import { useState, useMemo } from "react";
import { Layers, Edit3, Trash2 } from "lucide-react";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../ui/DataTable";
import SearchBar from "../ui/SearchBar";

const FloorTable = ({ data, torres, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [towerFilter, setTowerFilter] = useState("all");

  const filtered = useMemo(() => {
    return data.filter((f) => {
      const matchesSearch = f.numero_piso.toString().includes(searchTerm);
      const matchesTower = towerFilter === "all" || f.id_torre.toString() === towerFilter;
      return matchesSearch && matchesTower;
    });
  }, [data, searchTerm, towerFilter]);

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
          placeholder="Buscar por número de piso..."
          filterValue={towerFilter}
          onFilterChange={(val) => {
            setTowerFilter(val);
            setCurrentPage(1);
          }}
          filterOptions={[
            { value: "all", label: "Todas las Torres" },
            ...torres.map((t) => ({ value: t.id.toString(), label: t.nombre })),
          ]}
        />
      </div>
      <DataTable
        headers={["Número de Piso", "Torre Perteneciente", "Acciones"]}
        isEmpty={paginatedData.length === 0}
        emptyMessage="No hay pisos registrados."
        emptyIcon={Layers}
        paginationProps={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          totalItems: filtered.length,
          itemsShowing: paginatedData.length,
        }}
      >
        {paginatedData.map((floor) => (
          <tr key={floor.id}>
            <td>
              <div className="cell-label">
                <div className="cell-icon info">
                  <Layers size={14} />
                </div>
                <div className="cell-title">Piso {floor.numero_piso}</div>
              </div>
            </td>
            <td>
              <span className="badge badge-neutral">
                {torres.find((t) => t.id === floor.id_torre)?.nombre || "N/A"}
              </span>
            </td>
            <td>
              <div className="cell-actions">
                <button className="btn btn-outline btn-sm" onClick={() => onEdit(floor)}>
                  <Edit3 size={13} /> Editar
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => onDelete(floor)}>
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

export default FloorTable;
