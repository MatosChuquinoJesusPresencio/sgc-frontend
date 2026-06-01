import { useMemo } from "react";

export function useHistoryMappings({
  logsCarrito = [],
  logsEstacionamiento = [],
  apartamentos = [],
  estacionamientos = [],
  carritos = [],
  usuarios = [],
  inquilinosTemporales = [],
  torres = [],
  pisos = [],
  condominios = [],
  configuraciones = [],
  config: configOverride = null,
  now = new Date(),
  idCondominioFilter = null,
  idApartamentoFilter = null,
}) {
  const mappedCarritos = useMemo(() => {
    return logsCarrito
      .filter((log) => {
        if (idApartamentoFilter && log.id_apartamento !== idApartamentoFilter) return false;
        return true;
      })
      .map((log) => {
        const apto = apartamentos.find((a) => a.id === log.id_apartamento);
        const carrito = carritos.find((c) => c.id === log.id_carrito);
        const usuario = usuarios.find((u) => u.id === log.id_usuario);
        const inquilino = inquilinosTemporales.find((t) => t.id === log.id_inquilino_temporal);
        const piso = pisos.find((p) => p.id === apto?.id_piso);
        const torre = torres.find((t) => t.id === piso?.id_torre);
        const condo = condominios.find((c) => c.id === carrito?.id_condominio);

        return {
          ...log,
          carritoNombre: carrito?.nombre || `Carrito ${log.id_carrito}`,
          aptoNumero: apto?.numero || log.id_apartamento?.toString(),
          usuarioNombre: usuario?.nombre || inquilino?.nombre || log.solicitante || "N/A",
          torreNombre: torre?.nombre || "",
          pisoNumero: piso?.numero_piso || "",
          condominioId: condo?.id,
          condoNombre: condo?.nombre || "N/A",
        };
      });
  }, [logsCarrito, apartamentos, carritos, usuarios, inquilinosTemporales, pisos, torres, condominios, idApartamentoFilter]);

  const mappedEstacionamiento = useMemo(() => {
    return logsEstacionamiento
      .map((log) => {
        const est = estacionamientos.find((e) => e.id === log.id_estacionamiento);
        const apto = apartamentos.find((a) => a.id === est?.id_apartamento);
        const usuario = usuarios.find((u) => u.id === log.id_usuario);
        const piso = pisos.find((p) => p.id === apto?.id_piso);
        const torre = torres.find((t) => t.id === piso?.id_torre);
        const condo = condominios.find((c) => c.id === usuario?.id_condominio);

        return {
          ...log,
          placa: log.placa || "---",
          vehiculoInfo: log.metodo || "",
          estacionamientoNumero: est?.numero || log.id_estacionamiento?.toString(),
          aptoNumero: apto?.numero || "",
          usuarioNombre: usuario?.nombre || "N/A",
          torreNombre: torre?.nombre || "",
          condoNombre: condo?.nombre || "N/A",
        };
      });
  }, [logsEstacionamiento, estacionamientos, apartamentos, usuarios, pisos, torres, condominios]);

  return { mappedCarritos, mappedEstacionamiento };
}

export default useHistoryMappings;
