import React from "react";

function AssetList({
  assets,
  onEdit,
  onDelete,
  onSelect,
}) {
  return (
    <table>
      <thead>
        <tr>
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
              {Number(asset.price).toLocaleString()}
            </td>
            <td className="note-column" title={asset.note}>{asset.note}</td>

            <td>{asset.status}</td>

            <td>
              {/* <button onClick={() => onSelect(asset)}>
                Chi tiết
              </button> */}

              <button onClick={() => onEdit(asset)}>
                Sửa
              </button>

              <button
                onClick={() => {
                  console.log(asset);
                  console.log(asset.firebaseId);
                  onDelete(asset.firebaseId)
                }}
              >
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AssetList;