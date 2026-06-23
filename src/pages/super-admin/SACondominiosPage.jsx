import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Edit3,
  PlusCircle,
  Globe,
  MapPin,
  Users,
  Calendar,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { superAdminService } from "../../services/superAdminService";
import { catalogService } from "../../services/catalogService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import AnimatedPage from "../../components/animations/AnimatedPage";
import CondoFormModal from "../../components/modals/CondoFormModal";
import CondoRelationsModal from "../../components/modals/CondoRelationsModal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";

const PAGE_SIZE = 10;

const SACondominiosPage = () => {
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [condominios, setCondominios] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [availableAdmins, setAvailableAdmins] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingCondo, setEditingCondo] = useState(null);
  const [showRelationsModal, setShowRelationsModal] = useState(false);
  const [condoToDelete, setCondoToDelete] = useState(null);
  const [relations, setRelations] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const fetchCondominiums = useCallback(async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getCondominiums({
        search: searchTerm || undefined,
        page: currentPage - 1,
        size: PAGE_SIZE,
      });
      setCondominios(res.items || []);
      setTotalItems(res.total || 0);
    } catch (err) {
      setError(err.message || "Error al cargar condominios.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    fetchCondominiums();
  }, [fetchCondominiums]);

  const openCreateModal = async () => {
    setEditingCondo(null);
    setCities([]);
    try {
      const [countriesData, adminsData] = await Promise.all([
        catalogService.getCountries(),
        superAdminService.getUnassignedAdministrators(),
      ]);
      setCountries(countriesData || []);
      setAvailableAdmins(adminsData || []);
    } catch (e) {
      console.warn("Error loading form data", e);
    }
    setShowModal(true);
  };

  const openEditModal = async (condo) => {
    setEditingCondo(condo);
    setCities([]);
    try {
      const [countriesData, adminsData] = await Promise.all([
        catalogService.getCountries(),
        superAdminService.getUnassignedAdministrators(),
      ]);
      setCountries(countriesData || []);
      setAvailableAdmins(adminsData || []);
      if (condo.idPais) {
        const citiesData = await catalogService.getCities(condo.idPais);
        setCities(citiesData || []);
      }
    } catch (e) {
      console.warn("Error loading form data", e);
    }
    setShowModal(true);
  };

  const handleCountryChange = async (countryId) => {
    if (!countryId) { setCities([]); return; }
    setLoadingCities(true);
    try {
      const data = await catalogService.getCities(Number(countryId));
      setCities(data || []);
    } catch (e) {
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleDeleteClick = async (condo) => {
    setCondoToDelete(condo);
    setRelations([]);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await superAdminService.deleteCondominium(condoToDelete.id);
      setShowConfirmDelete(false);
      setCondoToDelete(null);
      fetchCondominiums();
    } catch (err) {
      setError(err.message || "Error al eliminar condominio.");
    }
  };

  const onSubmit = async (data) => {
    try {
      const body = {
        nombre: data.nombre,
        idPais: Number(data.idPais),
        idCiudad: Number(data.idCiudad),
        direccion: data.direccion,
      };

      if (editingCondo) {
        await superAdminService.updateCondominium(editingCondo.id, body);
        if (data.idAdministrador) {
          await superAdminService.assignCondominium(Number(data.idAdministrador), { idCondominio: editingCondo.id });
        }
      } else {
        const created = await superAdminService.createCondominium(body);
        if (data.idAdministrador) {
          await superAdminService.assignCondominium(Number(data.idAdministrador), { idCondominio: created.id });
        }
      }

      setShowModal(false);
      setEditingCondo(null);
      fetchCondominiums();
    } catch (err) {
      setError(err.message || "Error al guardar condominio.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentItems = condominios;

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Building2}
          title="Gesti\u00f3n de Condominios"
          badgeText="Super Admin"
          welcomeText={`Bienvenido, ${authUser?.nombre || "Administrador"}. Aqu\u00ed puedes gestionar todos los condominios del sistema.`}
        >
          <button className="btn btn-primary" onClick={openCreateModal}>
            <PlusCircle size={16} />
            <span>Nuevo Condominio</span>
          </button>
        </DashboardHeader>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <DataTable
          headers={["#", "Condominio", "Ubicaci\u00f3n", "Administrador", "Registro", "Acciones"]}
          isEmpty={!loading && currentItems.length === 0}
          emptyMessage={searchTerm ? `No se encontraron condominios que coincidan con "${searchTerm}"` : "No hay condominios registrados."}
          emptyIcon={Building2}
          searchBar={
            <div className="flex items-center gap-3">
              <div style={{ flex: 8 }}>
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                  placeholder="Buscar por nombre, pa\u00eds o direcci\u00f3n..."
                />
              </div>
            </div>
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems, itemsShowing: currentItems.length }}
        >
          {loading ? (
            <tr><td colSpan={6} className="text-center py-4"><Loader2 size={24} className="spinner" /></td></tr>
          ) : (
            currentItems.map((condo, index) => {
              const actualIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
              return (
                <tr key={condo.id}>
                  <td className="px-4 py-3 text-center">
                    <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                  </td>
                  <td className="py-3">
                    <div className="fw-bold mb-0">{condo.nombre}</div>
                    <div className="text-xs text-muted flex items-center gap-1"><Globe size={10} /> {condo.nombrePais}</div>
                  </td>
                  <td className="py-3">
                    <div className="text-sm fw-medium">{condo.direccion}</div>
                    <div className="text-xs text-muted flex items-center gap-1"><MapPin size={10} /> {condo.nombreCiudad}</div>
                  </td>
                  <td className="py-3">
                    {condo.nombreAdministrador ? (
                      <div className="text-sm fw-bold">{condo.nombreAdministrador}</div>
                    ) : (
                      <span className="badge badge-warning">Sin asignar</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="text-sm flex items-center gap-2">
                      <Calendar size={12} />
                      {condo.fechaCreacion ? new Date(condo.fechaCreacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(condo)}>
                        <Edit3 size={14} /> <span>Editar</span>
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClick(condo)}>
                        <Trash2 size={14} /> <span>Borrar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </DataTable>
      </div>


      <CondoFormModal
        show={showModal}
        onHide={() => { setShowModal(false); setEditingCondo(null); }}
        onSubmit={onSubmit}
        editingCondo={editingCondo}
        countries={countries}
        cities={cities}
        onCountryChange={handleCountryChange}
        loadingCities={loadingCities}
        availableAdmins={availableAdmins}
      />
      <CondoRelationsModal show={showRelationsModal} onHide={() => { setShowRelationsModal(false); setCondoToDelete(null); setRelations([]); }} condoName={condoToDelete?.nombre} relations={relations} />
      <ConfirmDialog
        show={showConfirmDelete}
        onHide={() => { setShowConfirmDelete(false); setCondoToDelete(null); }}
        onConfirm={confirmDelete}
        title="\u00bfEst\u00e1s seguro?"
        message={`Est\u00e1s a punto de eliminar el condominio ${condoToDelete?.nombre}. Esta acci\u00f3n no se puede deshacer.`}
        confirmText="S\u00ed, Eliminar"
        Icon={AlertTriangle}
      />
    </AnimatedPage>
  );
};

export default SACondominiosPage;
