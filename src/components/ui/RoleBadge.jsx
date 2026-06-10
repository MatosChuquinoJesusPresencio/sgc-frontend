const ROLES = {
  1: { className: "badge-warning", label: "Super Admin" },
  2: { className: "badge-accent", label: "Admin Condo" },
  3: { className: "badge-success", label: "Propietario" },
  4: { className: "badge-neutral", label: "Seguridad" },
  SUPER_ADMINISTRADOR: { className: "badge-warning", label: "Super Administrador" },
  ADMINISTRADOR_CONDOMINIO: { className: "badge-accent", label: "Administrador Condominio" },
  PROPIETARIO: { className: "badge-success", label: "Propietario" },
  AGENTE_SEGURIDAD: { className: "badge-neutral", label: "Agente de Seguridad" },
};

const RoleBadge = ({ roleId, rol }) => {
  const key = rol || roleId;
  const role = ROLES[key] || { className: "badge-neutral", label: "Usuario" };

  return (
    <span className={`badge ${role.className}`}>
      {role.label}
    </span>
  );
};

export default RoleBadge;