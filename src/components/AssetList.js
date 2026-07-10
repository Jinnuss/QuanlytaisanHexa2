import React from "react";

function AssetList({
  assets,
  onEdit,
  onDelete,
  onSelect,
  onShowQR,
}) {
  return (
    <table>
      <colgroup>
        <col className="col-code" />
        <col className="col-name" />
        <col className="col-company" />
        <col className="col-user" />
        <col className="col-price" />
        <col className="col-note" />
        <col className="col-status" />
        <col className="col-action" />
      </colgroup>
      <thead>
        <tr className="bg">
          <th>Mã</th>
          <th>Tên</th>
          <th>Công ty</th>
          <th>Người dùng</th>
          <th>Giá tiền</th>
          <th>Ghi chú</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>

      <tbody>
        {assets.map((asset) => (
          <tr key={asset.firebaseId}>
            <td>{asset.code}</td>
            <td>{asset.name}</td>
            <td>{asset.company}</td>
            <td>{asset.user}</td>
            <td>
              {Number(asset.price).toLocaleString("vi-VN")} ₫
            </td>
            <td className="note-column" title={asset.note}>{asset.note}</td>

            <td>
              <span
                className={
                  asset.status === "Kho"
                    ? "stock"
                    : "using"
                }
              >
                {asset.status}
              </span>
            </td>

            <td className="action-cell">
              <div className="action-buttons">
                <button
                  className="detail-btn"
                  onClick={() => onSelect(asset)}
                  title="Chi tiết"
                >
                  🔍
                </button>

                <button className=" icon-btn edit-btn" onClick={() => onEdit(asset)}>
                  ✏️
                </button>

                <button className="icon-btn delete-btn"
                  onClick={() => {
                    console.log(asset);
                    console.log(asset.firebaseId);
                    onDelete(asset.firebaseId)
                  }}
                >

                  🗑️
                </button>
                <button
                  type="button"
                  className="icon-btn qr-btn"
                  onClick={() => onShowQR(asset)}
                  title="QR Code"
                >
                  ▦
                </button>
              </div>

            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AssetList;