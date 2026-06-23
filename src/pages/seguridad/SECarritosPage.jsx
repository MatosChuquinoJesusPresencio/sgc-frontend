import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ShoppingCart, PlusCircle, RotateCcw, Loader2, X } from "lucide-react";
import { securityService } from "../../services/securityService";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import AnimatedPage from "../../components/animations/AnimatedPage";
import FormInput from "../../components/form/FormInput";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/modals/ConfirmDialog";

const SECarritosPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loans, setLoans] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await securityService.getActiveCartLoans();
      setLoans(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Error al cargar pr\u00e9stamos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleOpenCreate = () => {
    reset({ codigoCarrito: "", numeroApartamento: "", nombreSolicitante: "", dniSolicitante: "" });
    setShowFormModal(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      await securityService.registerCartLoan({
        codigoCarrito: data.codigoCarrito,
        numeroApartamento: parseInt(data.numeroApartamento),
        nombreSolicitante: data.nombreSolicitante,
        dniSolicitante: data.dniSolicitante,
      });
      setShowFormModal(false);
      setSuccessMsg("Pr\u00e9stamo registrado exitosamente.");
      fetchLoans();
    } catch (err) {
      setError(err.message || "Error al registrar pr\u00e9stamo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!returnTarget) return;
    setSubmitting(true);
    setError(null);
    try {
      await securityService.returnCartLoan(returnTarget.id);
      setReturnTarget(null);
      setSuccessMsg("Devoluci\u00f3n registrada exitosamente.");
      fetchLoans();
    } catch (err) {
      setError(err.message || "Error al registrar devoluci\u00f3n.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={ShoppingCart}
          title="Pr\u00e9stamos de Carritos"
          welcomeText="Gestiona los pr\u00e9stamos activos de carritos de carga."
        >
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <PlusCircle size={16} /><span>Nuevo Préstamo</span>
          </button>
        </DashboardHeader>

        {successMsg && <div className="alert alert-success mb-3">{successMsg}</div>}
        {error && <div className="alert alert-danger mb-3">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
            <Loader2 size={32} className="spinner" />
          </div>
        ) : (
          <DataTable
            headers={["#", "Solicitante", "DNI", "Carrito", "Fecha Pr\u00e9stamo", "Penalizaci\u00f3n", "Acciones"]}
            isEmpty={loans.length === 0}
            emptyMessage="No hay pr\u00e9stamos activos."
            emptyIcon={ShoppingCart}
          >
            {loans.map((loan, index) => (
              <tr key={loan.id}>
                <td className="px-4 py-3 text-center">
                  <span className="text-secondary fw-bold">{(index + 1).toString().padStart(2, "0")}</span>
                </td>
                <td className="py-3 fw-bold">{loan.nombreSolicitante}</td>
                <td className="py-3">{loan.dniSolicitante}</td>
                <td className="py-3">
                  <span className="badge badge-info">{loan.codigoCarrito}</span>
                </td>
                <td className="py-3">
                  {loan.fechaPrestamo ? new Date(loan.fechaPrestamo).toLocaleString("es-ES") : "-"}
                </td>
                <td className="py-3">
                  {loan.penalizacion ? `S/ ${loan.penalizacion}` : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="btn btn-outline btn-sm" onClick={() => setReturnTarget(loan)}>
                    <RotateCcw size={14} /> <span>Devolver</span>
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>

      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Nuevo Préstamo de Carrito</div>
              <button className="modal-close" onClick={() => setShowFormModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="grid-2 gap-3">
                  <FormInput
                    label="C\u00f3digo del Carrito"
                    name="codigoCarrito"
                    register={register}
                    validation={{ required: "Requerido" }}
                    error={errors.codigoCarrito}
                    placeholder="Ej: C-001"
                  />
                  <FormInput
                    label="N\u00famero de Apartamento"
                    name="numeroApartamento"
                    type="number"
                    register={register}
                    validation={{ required: "Requerido" }}
                    error={errors.numeroApartamento}
                    placeholder="Ej: 101"
                  />
                </div>
                <div className="grid-2 gap-3">
                  <FormInput
                    label="Nombre del Solicitante"
                    name="nombreSolicitante"
                    register={register}
                    validation={{ required: "Requerido" }}
                    error={errors.nombreSolicitante}
                    placeholder="Nombre completo"
                  />
                  <FormInput
                    label="DNI del Solicitante"
                    name="dniSolicitante"
                    register={register}
                    validation={{ required: "Requerido" }}
                    error={errors.dniSolicitante}
                    placeholder="N\u00famero de DNI"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowFormModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="spinner" /> : null}
                  Registrar Pr\u00e9stamo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={!!returnTarget}
        onHide={() => setReturnTarget(null)}
        onConfirm={handleReturn}
        title="Confirmar Devoluci\u00f3n"
        message={"\u00bfEst\u00e1s seguro de registrar la devoluci\u00f3n del carrito " + (returnTarget?.codigoCarrito || "") + "?"}
      />
    </AnimatedPage>
  );
};

export default SECarritosPage;
