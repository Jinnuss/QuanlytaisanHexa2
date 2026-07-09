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
  codeSearch,
  setCodeSearch,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="filter">
      {/* <input
        placeholder="Tìm theo mã..."
        value={codeSearch}
        onChange={(e) => setCodeSearch(e.target.value)}
      />
      <input
        placeholder="Tìm kiếm tài sản..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      /> */}
      <input
        placeholder="Tìm kiếm"
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
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="Kho">Kho</option>
        <option value="Đang cấp phát">Đang cấp phát</option>
      </select>
    </div>
  );
}

export default FilterBar;