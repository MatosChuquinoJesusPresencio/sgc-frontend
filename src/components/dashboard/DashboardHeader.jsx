const DashboardHeader = ({
  title,
  badgeText,
  welcomeText,
  children,
}) => {
  return (
    <div className="page-header">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="page-header-title">{title}</h1>
      </div>
      <div className="page-header-sub">
        {badgeText && <span className="page-header-badge">{badgeText}</span>}
        {welcomeText && <span className="page-header-welcome">{welcomeText}</span>}
      </div>
      {children && (
        <div style={{ marginTop: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
