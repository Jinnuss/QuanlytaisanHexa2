import React from "react";
import {
  getAssetTypeFromCode,
} from "../utils/assetType";

function AssetList({
  assets,
  onEdit,
  onDelete,
  onSelect,
  onShowQR,
  canEdit,
  canDelete,
}) {
  const getAssetType = (asset) =>
    asset.assetType ||
    getAssetTypeFromCode(asset.code);

  const getTypeLabel = (type) => {
    switch (type) {
      case "PC":
        return "🖥 PC";

      case "LAPTOP":
        return "💻 LAPTOP";

      case "LPK":
        return "⌨ LPK";

      case "MÀN HÌNH":
        return "MÀN HÌNH";

      default:
        return "Chưa xác định";
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case "PC":
        return "asset-type-pc";

      case "LAPTOP":
        return "asset-type-laptop";

      case "LPK":
        return "asset-type-lpk";
      case "MH":
        return "asset-type-lpk";

      default:
        return "asset-type-unknown";
    }
  };

  if (assets.length === 0) {
    return (
      <div className="empty-assets">
        <div className="empty-assets-icon">📦</div>

        <h3>Không tìm thấy tài sản</h3>

        <p>
          Hãy thay đổi từ khóa hoặc điều kiện lọc.
        </p>
      </div>
    );
  }

  return (
    <table className="asset-table">
      <colgroup>
        <col className="col-code" />
        <col className="col-type" />
        <col className="col-name" />
        <col className="col-company" />
        <col className="col-user" />
        <col className="col-ip" />
        <col className="col-note" />
        <col className="col-status" />
        <col className="col-action" />
      </colgroup>

      <thead>
        <tr>
          <th>Mã tài sản</th>
          <th>Loại</th>
          <th>Tên tài sản</th>
          <th>Công ty</th>
          <th>Người sử dụng</th>
          <th>Địa chỉ IP</th>
          <th>Ghi chú</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>

      <tbody>
        {assets.map((asset) => {
          const assetType = getAssetType(asset);

          return (
            <tr
              key={asset.firebaseId}
              className="asset-row"
            >
              <td>
                <button
                  type="button"
                  className="asset-code-btn"
                  onClick={() => onSelect(asset)}
                  title="Xem chi tiết"
                >
                  {asset.code}
                </button>
              </td>

              <td>
                <span
                  className={`asset-type-badge ${getTypeClass(
                    assetType
                  )}`}
                >
                  {getTypeLabel(assetType)}
                </span>
              </td>

              <td>
                <div
                  className="asset-name"
                  title={asset.name}
                >
                  {asset.name}
                </div>
              </td>

              <td>
                <span className="company-badge">
                  {asset.company || "Chưa có"}
                </span>
              </td>

              <td>
                <div
                  className="asset-user"
                  title={asset.user}
                >
                  {asset.user || "Chưa cấp phát"}
                </div>
              </td>

              <td>
                <span
                  className={
                    asset.ipAddress
                      ? "ip-badge"
                      : "ip-empty"
                  }
                >
                  {asset.ipAddress || "Chưa có IP"}
                </span>
              </td>

              <td>
                <div
                  className="note-column"
                  title={asset.note}
                >
                  {asset.note || "—"}
                </div>
              </td>

              <td>
                <span
                  className={
                    asset.status === "Kho"
                      ? "status-badge status-stock"
                      : "status-badge status-using"
                  }
                >
                  <span className="status-dot" />

                  {asset.status}
                </span>
              </td>

              <td>
                <div className="action-buttons">
                  {/* <button
                    type="button"
                    className="table-icon-btn detail-btn"
                    onClick={() => onSelect(asset)}
                    title="Xem chi tiết"
                  >
                    🔍
                  </button> */}

                  {canEdit && (
                    <button
                      type="button"
                      className="table-icon-btn edit-btn"
                      onClick={() => onEdit(asset)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      className="table-icon-btn delete-btn"
                      onClick={() =>
                        onDelete(asset.firebaseId)
                      }
                      title="Chuyển vào thùng rác"
                    >
                      🗑️
                    </button>
                  )}

                  <button
                    type="button"
                    className="table-icon-btn qr-btn"
                    onClick={() => onShowQR(asset)}
                    title="Xem mã QR"
                  >
                    ▦
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default AssetList;