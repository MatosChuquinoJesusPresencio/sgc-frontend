const RoleBadge = ({ roleId }) => {
  const roles = {
    1: { className: "badge-warning", label: "Super Admin" },
    2: { className: "badge-accent", label: "Admin Condo" },
    3: { className: "badge-success", label: "Propietario" },
    4: { className: "badge-neutral", label: "Seguridad" },
  };

  const role = roles[roleId] || { className: "badge-neutral", label: "Usuario" };

  return (
    <span className={`badge ${role.className}`}>
      {role.label}
    </span>
  );
};

export default RoleBadge;
