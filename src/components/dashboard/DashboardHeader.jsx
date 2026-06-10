const DashboardHeader = ({
  title,
  badgeText,
  welcomeText,
  children,
}) => {
  return (
    <div className="page-header">
      <div className="flex items-center justify-between gap-3">
        <h1 className="page-header-title" style={{ margin: 0 }}>{title}</h1>
        {children}
      </div>
      <div className="page-header-sub">
        {badgeText && <span className="page-header-badge">{badgeText}</span>}
        {welcomeText && <span className="page-header-welcome">{welcomeText}</span>}
      </div>
    </div>
  );
};

export default DashboardHeader;
