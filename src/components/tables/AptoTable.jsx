import { useState, useMemo } from "react";
import { Home, Edit3, Trash2, User } from "lucide-react";
import { usePagination } from "../../hooks/usePagination";
import DataTable from "../ui/DataTable";
import SearchBar from "../ui/SearchBar";

const AptoTable = ({ data, pisos, torres, usuarios, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [towerFilter, setTowerFilter] = useState("all");

  const filtered = useMemo(() => {
    return data.filter((a) => {
      const piso = pisos.find((p) => p.id === a.id_piso);
      const owner = usuarios.find((u) => u.id === a.id_usuario);
      const matchesSearch =
        a.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (owner?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTower =
        towerFilter === "all" || piso?.id_torre.toString() === towerFilter;
      return matchesSearch && matchesTower;
    });
  }, [data, searchTerm, towerFilter, pisos, usuarios]);

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
          placeholder="Buscar por número o propietario..."
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
        headers={["Apartamento", "Ubicación", "Propietario", "Acciones"]}
        isEmpty={paginatedData.length === 0}
        emptyMessage="No hay apartamentos registrados."
        emptyIcon={Home}
        paginationProps={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          totalItems: filtered.length,
          itemsShowing: paginatedData.length,
        }}
      >
        {paginatedData.map((apto) => {
          const piso = pisos.find((p) => p.id === apto.id_piso);
          const torre = torres.find((t) => t.id === piso?.id_torre);
          const owner = usuarios.find((u) => u.id === apto.id_usuario);

          return (
            <tr key={apto.id}>
              <td>
                <div className="cell-label">
                  <div className="cell-icon success">
                    <Home size={14} />
                  </div>
                  <div>
                    <div className="cell-title">Apto {apto.numero}</div>
                    <div className="cell-sub">{apto.metraje} m²</div>
                  </div>
                </div>
              </td>
              <td>
                <span className="fw-medium">{torre?.nombre} • Piso {piso?.numero_piso}</span>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <User size={13} className="text-muted" />
                  <span className={owner ? "fw-medium" : "text-danger"}>
                    {owner?.nombre || "Sin asignar"}
                  </span>
                </div>
              </td>
              <td>
                <div className="cell-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => onEdit(apto)}>
                    <Edit3 size={13} /> Editar
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => onDelete(apto)}>
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
};

export default AptoTable;
