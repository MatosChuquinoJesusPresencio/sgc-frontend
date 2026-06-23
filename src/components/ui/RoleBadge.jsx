const ROLE_STYLE = {
  SUPER_ADMINISTRADOR: "badge-warning",
  ADMINISTRADOR_CONDOMINIO: "badge-accent",
  PROPIETARIO: "badge-success",
  AGENTE_SEGURIDAD: "badge-neutral",
};

const ROLE_LABEL = {
  SUPER_ADMINISTRADOR: "Super Admin",
  ADMINISTRADOR_CONDOMINIO: "Admin Condo",
  PROPIETARIO: "Propietario",
  AGENTE_SEGURIDAD: "Seguridad",
};

const LEGACY_ROLES = {
  1: { className: "badge-warning", label: "Super Admin" },
  2: { className: "badge-accent", label: "Admin Condo" },
  3: { className: "badge-success", label: "Propietario" },
  4: { className: "badge-neutral", label: "Seguridad" },
};

const RoleBadge = ({ roleId, role, labels }) => {
  if (role) {
    const className = ROLE_STYLE[role] || "badge-neutral";
    const label = labels?.[role] || ROLE_LABEL[role] || role;
    return <span className={`badge ${className}`}>{label}</span>;
  }

  const legacy = LEGACY_ROLES[roleId] || { className: "badge-neutral", label: "Usuario" };
  return <span className={`badge ${legacy.className}`}>{legacy.label}</span>;
};

export default RoleBadge;
