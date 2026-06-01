import { Search } from "lucide-react";

const SearchBar = ({
  searchTerm,
  onSearchChange,
  placeholder = "Buscar...",
  filterValue,
  onFilterChange,
  filterOptions = [],
}) => {
  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {filterOptions.length > 0 && (
        <select
          className="form-select"
          style={{ width: "auto", minWidth: 160 }}
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default SearchBar;
