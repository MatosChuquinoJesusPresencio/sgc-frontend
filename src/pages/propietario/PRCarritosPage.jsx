import { useState, useMemo, useEffect } from "react";
import {
  ShoppingCart,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  History,
  ArrowLeft,
  Info,
  X,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useData } from "../../hooks/useData";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { useHistoryMappings } from "../../hooks/useHistoryMappings";
import NoCondoWarning from "../../components/ui/NoCondoWarning";

const PRCarritosPage = () => {
  const { authUser } = useAuth();
  const { getTable, updateTable } = useData();

  const carritos = getTable("carritos_carga");
  const logsPrestamos = getTable("logs_prestamo_carrito");
  const configuraciones = getTable("configuraciones");
  const apartamentos = getTable("apartamentos");
  const usuarios = getTable("usuarios");
  const inquilinos = getTable("inquilinos_temporales");
  const pisos = getTable("pisos");
  const torres = getTable("torres");
  const condominios = getTable("condominios");

  const myApartments = useMemo(() => {
    return apartamentos
      .filter((a) => a.id_usuario === authUser?.id)
      .map((a) => {
        const piso = pisos.find((p) => p.id === a.id_piso);
        const torre = torres.find((t) => t.id === piso?.id_torre);
        return { ...a, id_condominio: torre?.id_condominio };
      });
  }, [apartamentos, pisos, torres, authUser]);
  const miApto = myApartments[0];

  const config = useMemo(
    () =>
      configuraciones.find((c) =>
        myApartments.some((a) => a.id_condominio === c.id_condominio),
      ),
    [configuraciones, myApartments],
  );

  const { mappedCarritos: recentCarritoLogs } = useHistoryMappings({
    logsCarrito: logsPrestamos,
    logsEstacionamiento: [],
    apartamentos,
    estacionamientos: [],
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

  if (!authUser) return <div className="p-5 text-center">Cargando...</div>;
  if (myApartments.length === 0) return <NoCondoWarning />;

  const [searchTerm, setSearchTerm] = useState("");
  const [now, setNow] = useState(new Date());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedCarrito, setSelectedCarrito] = useState(null);
  const [selectedApto, setSelectedApto] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const carritosMapped = useMemo(() => {
    return carritos
      .filter((c) =>
        myApartments.some((a) => a.id_condominio === c.id_condominio),
      )
      .map((c) => {
        const activeLoan = logsPrestamos.find(
          (log) => log.id_carrito === c.id && log.fecha_salida === null,
        );

        let currentUser = null;

        if (activeLoan) {
          const user = usuarios.find((u) => u.id === activeLoan.id_usuario);
          const apto = apartamentos.find(
            (a) => a.id === activeLoan.id_apartamento,
          );

          let fine = 0;
          if (config) {
            const startDate = new Date(activeLoan.fecha_entrada);
            const diffMs = now - startDate;
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins > config.tiempo_max_prestamo_min) {
              fine =
                (diffMins - config.tiempo_max_prestamo_min) *
                config.penalizacion_por_minuto;
            }
          }

          currentUser = {
            id: activeLoan.id_usuario,
            nombre: user?.nombre || "Desconocido",
            aptoNumero: apto?.numero,
            isMe: activeLoan.id_usuario === authUser?.id,
            loanId: activeLoan.id,
            fine,
            fechaEntrada: activeLoan.fecha_entrada,
          };
        }

        return {
          ...c,
          currentUser,
          fine: currentUser?.fine || 0,
        };
      });
  }, [
    carritos,
    logsPrestamos,
    myApartments,
    usuarios,
    apartamentos,
    config,
    now,
    authUser,
  ]);

  const stats = useMemo(() => {
    const total = carritosMapped.length;
    const disponibles = carritosMapped.filter(
      (c) => c.estado === "Disponible",
    ).length;
    const miUso = carritosMapped.filter((c) => c.currentUser?.isMe).length;

    return { total, disponibles, miUso };
  }, [carritosMapped]);

  const filteredCarritos = useMemo(() => {
    return carritosMapped.filter((c) =>
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [carritosMapped, searchTerm]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    itemsPerPage,
  } = usePagination(filteredCarritos);

  const handleRequest = (carrito) => {
    setSelectedCarrito(carrito);
    if (myApartments.length === 1) {
      setSelectedApto(myApartments[0].id.toString());
    } else {
      setSelectedApto("");
    }
    setShowRequestModal(true);
  };

  const confirmRequest = () => {
    if (!selectedApto) return;

    const newLoanId =
      logsPrestamos.length > 0
        ? Math.max(...logsPrestamos.map((l) => l.id)) + 1
        : 1;
    const newLoan = {
      id: newLoanId,
      id_carrito: selectedCarrito?.id,
      id_apartamento: parseInt(selectedApto),
      id_usuario: authUser?.id,
      id_inquilino_temporal: null,
      solicitante: "Propietario",
      penalizacion: 0.0,
      fecha_entrada: new Date().toISOString(),
      fecha_salida: null,
    };

    const updatedCarritos = carritos.map((c) =>
      c.id === selectedCarrito?.id ? { ...c, estado: "En uso" } : c,
    );

    updateTable("logs_prestamo_carrito", [...logsPrestamos, newLoan]);
    updateTable("carritos_carga", updatedCarritos);

    setShowRequestModal(false);
    setSelectedCarrito(null);
  };

  const handleReturn = (carrito) => {
    setSelectedCarrito(carrito);
    setShowReturnModal(true);
  };

  const confirmReturn = () => {
    if (!selectedCarrito) return;

    const loan = selectedCarrito.currentUser;
    const updatedLogs = logsPrestamos.map((l) => {
      if (l.id === loan?.loanId) {
        return {
          ...l,
          fecha_salida: new Date().toISOString(),
          penalizacion: loan?.fine || 0,
        };
      }
      return l;
    });

    const updatedCarritos = carritos.map((c) =>
      c.id === selectedCarrito?.id ? { ...c, estado: "Disponible" } : c,
    );

    updateTable("logs_prestamo_carrito", updatedLogs);
    updateTable("carritos_carga", updatedCarritos);

    setShowReturnModal(false);
    setSelectedCarrito(null);
  };

  const getStatusBadge = (carrito) => {
    if (carrito.estado === "Disponible") {
      return (
        <span className="badge badge-success">
          Disponible
        </span>
      );
    }
    if (carrito.currentUser?.isMe) {
      return (
        <span className="badge badge-info">
          En mi poder
        </span>
      );
    }
    return (
      <span className="badge badge-warning">
        Ocupado
      </span>
    );
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={ShoppingCart}
          title="Servicio de Carritos"
          badgeText="Residente"
          welcomeText="Consulta disponibilidad y solicita carritos de carga para tus mudanzas o compras."
        />

        <div className="grid grid-3 gap-4 mb-5">
          <StatCard
            icon={ShoppingCart}
            label="Total Flota"
            value={stats.total}
            colorClass="primary-theme"
          />
          <StatCard
            icon={CheckCircle}
            label="Disponibles Ahora"
            value={stats.disponibles}
            colorClass="primary-theme"
          />
          <StatCard
            icon={User}
            label="En mi Posesión"
            value={stats.miUso}
            colorClass="primary-theme"
          />
        </div>

        <DataTable
          headers={[
            "#",
            "Código",
            "Estado",
            "Información de Uso",
            "Acción",
          ]}
          isEmpty={paginatedData.length === 0}
          emptyMessage="No hay carritos registrados para tu condominio."
          emptyIcon={ShoppingCart}
          searchBar={
            <div className="flex items-center justify-between">
              <h5 className="fw-bold flex items-center gap-2">
                <div className="cell-icon primary">
                  <ShoppingCart size={14} />
                </div>
                Carritos Disponibles
              </h5>
              <div style={{ width: "300px" }}>
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Buscar por código..."
                />
              </div>
            </div>
          }
          paginationProps={{
            currentPage: currentPage,
            totalPages: totalPages,
            onPageChange: setCurrentPage,
            totalItems: filteredCarritos.length,
            itemsShowing: paginatedData.length,
          }}
        >
          {paginatedData.map((carrito, index) => {
            const actualIndex =
              (currentPage - 1) * itemsPerPage + index + 1;
            const isMine = carrito.currentUser?.isMe;
            const isAvailable = carrito.estado === "Disponible";

            return (
              <tr key={carrito.id}>
                <td className="text-center">
                  <span className="text-secondary fw-bold">
                    {actualIndex.toString().padStart(2, "0")}
                  </span>
                </td>
                <td>
                  <div className="fw-bold">{carrito.codigo}</div>
                </td>
                <td>{getStatusBadge(carrito)}</td>
                <td>
                  {carrito.currentUser ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted">
                        {isMine
                          ? "Tú lo tienes"
                          : `Apto ${carrito.currentUser.aptoNumero}`}
                      </span>
                      {carrito.fine > 0 && (
                        <span className="text-xs text-danger fw-bold">
                          Multa: S/. {carrito.fine.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted text-sm">
                      Libre para solicitar
                    </span>
                  )}
                </td>
                <td>
                  {isAvailable ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRequest(carrito)}
                    >
                      <ArrowRight size={14} /> Solicitar
                    </button>
                  ) : isMine ? (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleReturn(carrito)}
                    >
                      <ArrowLeft size={14} /> Devolver
                    </button>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled
                    >
                      No disponible
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </DataTable>

        <section className="mb-5">
          <h5 className="fw-bold mb-4 flex items-center gap-2">
            <div className="cell-icon warning">
              <History size={14} />
            </div>
            Uso Reciente de mi Apartamento
          </h5>
          <DataTable
            headers={[
              "Carrito",
              "Usuario",
              "Solicitante",
              "Salida",
              "Retorno",
              "Estado",
            ]}
            isEmpty={recentCarritoLogs.length === 0}
            emptyMessage="No hay préstamos recientes en tu apartamento."
            emptyIcon={History}
            searchBar={null}
          >
            {recentCarritoLogs.slice(0, 5).map((log) => {
              const isReturned = !!log.fecha_salida;

              return (
                <tr key={log.id}>
                  <td>
                    <span className="fw-bold">
                      {log.carritoNombre || `Carrito #${log.id_carrito}`}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-muted">
                      {log.usuarioNombre || "Cargando..."}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-neutral">
                      {log.solicitante}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs text-muted">
                      {new Date(log.fecha_entrada).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs text-muted">
                      {isReturned
                        ? new Date(log.fecha_salida).toLocaleString()
                        : "---"}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${isReturned ? "badge-success" : "badge-warning"}`}>
                      {isReturned ? "Devuelto" : "En uso"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </section>
      </div>

      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Solicitar Carrito</div>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info flex items-center gap-2">
                <Info size={16} />
                <span>Recuerda que tienes un tiempo máximo de <strong>{config?.tiempo_max_prestamo_min} minutos</strong>. Pasado este tiempo se aplicará una multa automática.</span>
              </div>

              <div className="text-center p-3 mb-4">
                <div className="text-muted text-sm mb-1">Carrito seleccionado</div>
                <div className="h4 fw-bold mb-0">
                  {selectedCarrito?.codigo}
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label fw-bold text-sm text-muted">
                  ¿Para qué apartamento?
                </label>
                <select
                  className="form-select"
                  value={selectedApto}
                  onChange={(e) => setSelectedApto(e.target.value)}
                >
                  <option value="">Seleccionar apartamento...</option>
                  {myApartments.map((a) => (
                    <option key={a.id} value={a.id}>
                      Apto {a.numero}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowRequestModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmRequest}
                disabled={!selectedApto}
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Devolver Carrito</div>
              <button className="modal-close" onClick={() => setShowReturnModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body text-center py-3">
              <div className="cell-icon primary" style={{ width: 80, height: 80, margin: "0 auto 1rem" }}>
                <ShoppingCart size={40} />
              </div>
              <h5 className="fw-bold">
                ¿Has terminado de usar el carrito {selectedCarrito?.codigo}?
              </h5>
              <p className="text-muted text-sm">
                Al confirmar, el carrito quedará disponible para otros residentes.
              </p>

              {selectedCarrito?.fine > 0 && (
                <div className="alert alert-danger flex items-center gap-3">
                  <AlertTriangle size={24} />
                  <div className="text-left">
                    <div className="fw-bold">Multa por exceso de tiempo</div>
                    <div className="text-sm">
                      Se ha generado un cargo de{" "}
                      <strong>S/. {selectedCarrito.fine.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowReturnModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmReturn}
              >
                Confirmar Devolución
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default PRCarritosPage;
