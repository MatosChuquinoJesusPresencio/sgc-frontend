const StatCard = ({ label, value, icon: Icon, colorClass = "accent" }) => {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${colorClass}`}>
                {Icon && <Icon size={20} />}
            </div>
            <div className="stat-content">
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
            </div>
        </div>
    );
};

export default StatCard;
