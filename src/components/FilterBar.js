import React from "react";
const companies = [
      "HXG",
      "HOMIE",
      "GDB",
      "Vietfurniture",
      "NEW"
      ];


function FilterBar({
  searchText,
  setSearchText,
  companyFilter,
  setCompanyFilter,
}) {
  return (
    <div className="filter">
      <input
        placeholder="Tìm kiếm tài sản..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <select
        value={companyFilter}
        onChange={(e) => setCompanyFilter(e.target.value)}
      >
        <option value="">Tất cả công ty</option>

        {companies.map(company => (
          <option key={company} value={company}>
            {company}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterBar;