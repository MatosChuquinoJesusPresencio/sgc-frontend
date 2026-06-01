import { useState, useMemo } from "react";
import {
  Home,
  User,
  Users,
  Building2,
  GitBranch,
  Info,
  MapPin,
  Eye,
  X,
} from "lucide-react";

import { useData } from "../../hooks/useData";
import { usePagination } from "../../hooks/usePagination";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";

const SAApartamentosPage = () => {
  const { getTable } = useData();

  const apartamentos = getTable("apartamentos");
  const pisos = getTable("pisos");
  const torres = getTable("torres");
  const usuarios = getTable("usuarios");
  const condominios = getTable("condominios");
  const inquilinosTemporales = getTable("inquilinos_temporales");

  const [searchTerm, setSearchTerm] = useState("");
  const [condoFilter, setCondoFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAptoId, setSelectedAptoId] = useState(null);

  const allAptos = useMemo(() => {
    return apartamentos.map((a) => {
      const piso = pisos.find((p) => p.id === a.id_piso);
      const torre = torres.find((t) => t.id === piso?.id_torre);
      const condo = condominios.find((c) => c.id === torre?.id_condominio);
      const owner = usuarios.find((u) => u.id === a.id_usuario);
      const residents = inquilinosTemporales.filter((i) => i.id_apartamento === a.id);
      return { ...a, condoId: condo?.id, condoNombre: condo?.nombre || "N/A", torreNombre: torre?.nombre || "N/A", pisoNumero: piso?.numero_piso || "?", ownerName: owner?.nombre || "Sin Propietario", residents };
    });
  }, [apartamentos, pisos, torres, condominios, usuarios, inquilinosTemporales]);

  const stats = useMemo(() => ({
    totalUnidades: allAptos.length,
    totalCondos: condominios.length,
    ocupacion: allAptos.length > 0 ? Math.round((allAptos.filter((a) => a.id_usuario !== null).length / allAptos.length) * 100) : 0,
    totalPoblacion: inquilinosTemporales.length,
  }), [allAptos, condominios, inquilinosTemporales]);

  const filteredAptos = useMemo(() => {
    return allAptos.filter((apto) => {
      const matchesSearch = apto.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apto.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apto.condoNombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCondo = condoFilter === "all" || apto.condoId?.toString() === condoFilter;
      return matchesSearch && matchesCondo;
    });
  }, [allAptos, searchTerm, condoFilter]);

  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedAptos, itemsPerPage } = usePagination(filteredAptos);

  const currentApto = useMemo(() => allAptos.find((a) => a.id === selectedAptoId), [allAptos, selectedAptoId]);

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader icon={GitBranch} title="Explorador Global de Unidades" badgeText="Vista de Auditoría" welcomeText="Supervisa la ocupación y distribución de unidades habitacionales en todos los condominios registrados." />

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard icon={Building2} label="Total Unidades" value={stats.totalUnidades} colorClass="primary-theme" />
          <StatCard icon={MapPin} label="Condominios" value={stats.totalCondos} colorClass="primary-theme" />
          <StatCard icon={Info} label="Ocupación Global" value={`${stats.ocupacion}%`} colorClass="primary-theme" />
          <StatCard icon={Users} label="Inquilinos Totales" value={stats.totalPoblacion} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={["#", "Condominio", "Unidad", "Ubicación", "Propietario", "Residentes", "Acción"]}
          isEmpty={paginatedAptos.length === 0}
          emptyMessage="No hay unidades que coincidan con los criterios de búsqueda global."
          emptyIcon={Home}
          searchBar={
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
              placeholder="Buscar por unidad, propietario o condo..."
              filterValue={condoFilter}
              onFilterChange={(val) => { setCondoFilter(val); setCurrentPage(1); }}
              filterOptions={[{ value: "all", label: "Todos los Condominios" }, ...condominios.map((c) => ({ value: c.id.toString(), label: c.nombre }))]}
              colSize={{ search: 4, filter: 3 }}
            />
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems: filteredAptos.length, itemsShowing: paginatedAptos.length }}
        >
          {paginatedAptos.map((apto, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={apto.id}>
                <td className="px-4 py-3 text-center"><span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span></td>
                <td className="py-3">
                  <div className="fw-bold text-accent text-sm">{apto.condoNombre}</div>
                  <div className="text-xs text-muted">ID Condo: {apto.condoId}</div>
                </td>
                <td className="py-3"><span className="badge badge-neutral">{apto.numero}</span></td>
                <td className="py-3"><div className="text-sm text-secondary">{apto.torreNombre} • Piso {apto.pisoNumero}</div></td>
                <td className="py-3"><div className="text-sm fw-medium">{apto.ownerName}</div></td>
                <td className="py-3 text-center">
                  {apto.residents.length > 0 ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-sm fw-medium text-muted">{apto.residents.length} {apto.residents.length === 1 ? "Residente" : "Residentes"}</div>
                    </div>
                  ) : (
                    <div className="text-sm fw-medium text-muted">Vacío</div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="btn btn-outline btn-sm" onClick={() => { setSelectedAptoId(apto.id); setShowDetailModal(true); }}>
                    <Eye size={14} /> <span>Detalles</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Detalle de Residentes</div>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="flex items-center gap-3 p-3 mb-4">
                <div className="cell-icon primary">
                  <Home size={24} />
                </div>
                <div>
                  <div className="fw-bold">Unidad {currentApto?.numero}</div>
                  <div className="text-sm text-muted">{currentApto?.condoNombre} • {currentApto?.torreNombre}</div>
                </div>
              </div>
              <h6 className="fw-bold text-secondary mb-3 text-sm">PROPIETARIO LEGAL</h6>
              <div className="flex items-center gap-2 px-3 py-2 mb-4 text-sm fw-medium">
                <User size={12} className="text-muted" /> {currentApto?.ownerName}
              </div>
              <h6 className="fw-bold text-secondary mb-3 text-sm">RESIDENTES / INQUILINOS</h6>
              <div>
                {currentApto?.residents.length > 0 ? (
                  currentApto.residents.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="fw-bold text-sm">{r.nombre}</div>
                        <div className="text-xs text-muted">DNI: {r.dni}</div>
                      </div>
                      <span className="badge badge-neutral">Inquilino</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted text-sm">No hay inquilinos registrados para esta unidad.</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary w-full" onClick={() => setShowDetailModal(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default SAApartamentosPage;
