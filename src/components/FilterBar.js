import React from "react";

import {
  ASSET_TYPES,
} from "../utils/assetType";

const companies = [
  "HXG",
  "HOMIE",
  "GDB",
  "Vietfurniture",
  "NEW",
];

function FilterBar({
  searchText,
  setSearchText,

  companyFilter,
  setCompanyFilter,

  statusFilter,
  setStatusFilter,

  assetTypeFilter,
  setAssetTypeFilter,
}) {
  const hasFilter =
    searchText ||
    companyFilter ||
    statusFilter ||
    assetTypeFilter;

  const clearFilters = () => {
    setSearchText("");
    setCompanyFilter("");
    setStatusFilter("");
    setAssetTypeFilter("");
  };

  return (
    <div className="filter-bar">
      <div className="filter-search">
        <span className="filter-search-icon">
          🔍
        </span>

        <input
          type="text"
          placeholder="Tìm mã, tên, người dùng, ghi chú..."
          value={searchText}
          onChange={(event) =>
            setSearchText(event.target.value)
          }
        />

        {searchText && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setSearchText("")}
            title="Xóa từ khóa"
          >
            ×
          </button>
        )}
      </div>

      <div className="filter-select-wrapper">
        <span>🏢</span>

        <select
          value={companyFilter}
          onChange={(event) =>
            setCompanyFilter(
              event.target.value
            )
          }
        >
          <option value="">
            Tất cả công ty
          </option>

          {companies.map((company) => (
            <option
              key={company}
              value={company}
            >
              {company}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-select-wrapper">
        <span>📦</span>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="">
            Tất cả trạng thái
          </option>

          <option value="Kho">
            Kho
          </option>

          <option value="Đang cấp phát">
            Đang cấp phát
          </option>
        </select>
      </div>

      <div className="filter-select-wrapper">
        <span>🖥</span>

        <select
          value={assetTypeFilter}
          onChange={(event) =>
            setAssetTypeFilter(
              event.target.value
            )
          }
        >
          <option value="">
            Tất cả loại
          </option>

          {ASSET_TYPES.map((type) => (
            <option
              key={type}
              value={type}
            >
              {type}
            </option>
          ))}
        </select>
      </div>

      {hasFilter && (
        <button
          type="button"
          className="clear-filter-btn"
          onClick={clearFilters}
        >
          Đặt lại
        </button>
      )}
    </div>
  );
}

export default FilterBar;