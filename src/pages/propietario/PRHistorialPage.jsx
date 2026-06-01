import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import {
  History,
  ShoppingCart,
  Car,
  CheckCircle,
  Home,
  User,
  Clock,
  Calendar,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useData } from "../../hooks/useData";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import DataTable from "../../components/ui/DataTable";
import SearchBar from "../../components/ui/SearchBar";
import { usePagination } from "../../hooks/usePagination";
import { useHistoryMappings } from "../../hooks/useHistoryMappings";
import { formatDateTime } from "../../utils/formatters";

const PRHistorialPage = () => {
  const { authUser } = useAuth();
  const { getTable } = useData();
  const [searchParams] = useSearchParams();

  const logsCarritos = getTable("logs_prestamo_carrito");
  const logsVehiculos = getTable("logs_acceso_vehicular");
  const carritos = getTable("carritos_carga");
  const apartamentos = getTable("apartamentos");
  const usuarios = getTable("usuarios");
  const inquilinos = getTable("inquilinos_temporales");
  const estacionamientos = getTable("estacionamientos");
  const configuraciones = getTable("configuraciones");
  const torres = getTable("torres");
  const pisos = getTable("pisos");
  const condominios = getTable("condominios");

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const miApto = useMemo(
    () => apartamentos.find((a) => a.id_usuario === authUser?.id),
    [apartamentos, authUser],
  );

  const config = useMemo(
    () =>
      miApto &&
      configuraciones.find(
        (c) => c.id_condominio === miApto.id_condominio,
      ),
    [configuraciones, miApto],
  );

  const initialTab = searchParams.get("tab") || "carritos";

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "carritos" || tab === "estacionamiento")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [searchTerm, setSearchTerm] = useState("");

  const { mappedCarritos, mappedEstacionamiento } = useHistoryMappings({
    logsCarrito: logsCarritos,
    logsEstacionamiento: logsVehiculos,
    apartamentos,
    estacionamientos,
    carritos,
    usuarios,
    inquilinosTemporales: inquilinos,
    torres,
    pisos,
    condominios,
    configuraciones,
    config,
    now,
    idApartamentoFilter: miApto?.id,
  });

  const filteredData = useMemo(() => {
    const source =
      activeTab === "carritos" ? mappedCarritos : mappedEstacionamiento;

    return source.filter((item) => {
      const matchesSearch =
        activeTab === "carritos"
          ? item.carritoNombre.toLowerCase().includes(searchTerm.toLowerCase())
          : item.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.vehiculoInfo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [activeTab, mappedCarritos, mappedEstacionamiento, searchTerm]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    itemsPerPage,
  } = usePagination(filteredData);

  if (!miApto) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center">
          <div className="card card-custom p-5 text-center">
            <History size={60} className="text-muted mb-3" />
            <h3 className="fw-bold">Actividad no disponible</h3>
            <p className="text-muted">
              Necesitas una unidad asignada para ver tu historial.
            </p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={History}
          title="Mi Historial de Actividad"
          badgeText="Residente"
          welcomeText="Consulta el historial de accesos de tus vehículos y préstamos de carritos."
        />

        <div className="grid grid-3 gap-4 mb-5">
          <StatCard
            icon={Car}
            label="Accesos Vehiculares"
            value={mappedEstacionamiento.length}
            colorClass="primary-theme"
          />
          <StatCard
            icon={ShoppingCart}
            label="Uso de Carritos"
            value={mappedCarritos.length}
            colorClass="primary-theme"
          />
          <StatCard
            icon={CheckCircle}
            label="Registros Totales"
            value={filteredData.length}
            colorClass="primary-theme"
          />
        </div>

        <DataTable
          headers={
            activeTab === "carritos"
              ? ["#", "Unidad", "Carrito", "Solicitante", "Salida", "Retorno", "Multa", "Estado"]
              : [
                  "#",
                  "Vehículo / Placa",
                  "Espacio",
                  "Entrada",
                  "Salida",
                  "Estado",
                ]
          }
          isEmpty={paginatedData.length === 0}
          emptyMessage={
            activeTab === "carritos"
              ? "No hay registros de carritos."
              : "No hay registros de acceso vehicular."
          }
          emptyIcon={activeTab === "carritos" ? ShoppingCart : Car}
          searchBar={
            <>
              <div className="tabs mb-4">
                <button
                  className={`tab ${activeTab === "carritos" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("carritos");
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                >
                  <ShoppingCart size={14} /> Historial Carritos
                </button>
                <button
                  className={`tab ${activeTab === "estacionamiento" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("estacionamiento");
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                >
                  <Car size={14} /> Historial Accesos
                </button>
              </div>

              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={(val) => {
                  setSearchTerm(val);
                  setCurrentPage(1);
                }}
                placeholder={
                  activeTab === "carritos"
                    ? "Buscar por nombre de carrito..."
                    : "Buscar por placa o modelo..."
                }
              />
            </>
          }
          paginationProps={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
            totalItems: filteredData.length,
            itemsShowing: paginatedData.length,
          }}
        >
          {paginatedData.map((log, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;

            if (activeTab === "carritos") {
              return (
                <tr key={log.id}>
                  <td className="text-center">
                    <span className="text-secondary fw-bold">
                      {actualIndex.toString().padStart(2, "0")}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm">
                      <Home size={14} className="text-muted" />{" "}
                      {log.aptoNumero || log.id_apartamento}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm fw-medium">
                      {log.carritoNombre || `Carrito ${log.id_carrito}`}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-muted">
                      <User size={14} />{" "}
                      {log.usuarioNombre || log.solicitante}
                    </div>
                  </td>
                   <td>
                    <div className="text-xs">
                      <Clock size={12} className="text-muted" />{" "}
                      {formatDateTime(log.fecha_entrada)}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs">
                      <Clock size={12} className="text-muted" />{" "}
                      {log.fecha_salida ? formatDateTime(log.fecha_salida) : "---"}
                    </div>
                  </td>
                  <td>
                    {log.penalizacionCalculada > 0 ? (
                      <span className="text-danger fw-bold text-sm">
                        S/. {log.penalizacionCalculada.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted text-sm">S/. 0.00</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${log.fecha_salida ? "badge-success" : "badge-warning"}`}>
                      {log.fecha_salida ? "Devuelto" : "En uso"}
                    </span>
                  </td>
                </tr>
              );
            } else {
              return (
                <tr key={log.id}>
                  <td className="text-center">
                    <span className="text-secondary fw-bold">
                      {actualIndex.toString().padStart(2, "0")}
                    </span>
                  </td>
                  <td>
                    <div className="fw-bold text-sm">{log.placa}</div>
                    <div className="text-xs text-muted">{log.vehiculoInfo}</div>
                  </td>
                  <td className="text-center">
                    <span className="badge badge-neutral">
                      {log.estacionamientoNumero || log.id_estacionamiento}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs">
                      <Calendar size={12} className="text-muted" />{" "}
                      {formatDateTime(log.fecha_entrada)}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs">
                      <Calendar size={12} className="text-muted" />{" "}
                      {formatDateTime(log.fecha_salida)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${log.fecha_salida ? "badge-neutral" : "badge-info"}`}>
                      {log.estado}
                    </span>
                  </td>
                </tr>
              );
            }
          })}
        </DataTable>
      </div>
    </AnimatedPage>
  );
};

export default PRHistorialPage;
