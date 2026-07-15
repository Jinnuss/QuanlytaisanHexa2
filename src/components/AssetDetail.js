import React from "react";
import AuditLog from "./AuditLog";

function AssetDetail({ asset }) {
  return (
    <div className="detail">

      <h2>Chi tiết tài sản</h2>

      <p>
        <strong>Mã:</strong> {asset.code}
      </p>

      <p>
        <strong>Tên:</strong> {asset.name}
      </p>

      <p>
        <strong>Công ty:</strong> {asset.company}
      </p>

      <p>
        <strong>Người sử dụng:</strong>{" "}
        {asset.user || "Chưa cấp phát"}
      </p>

      <p>
        <strong>Trạng thái:</strong> {asset.status}
      </p>

      <p>
        <strong>Ghi chú:</strong> {asset.note}
      </p>
      <p>
        <strong>Địa chỉ IP:</strong>{" "}
        {asset.ipAddress || "Chưa có"}
      </p>

      <AuditLog logs={asset.logs || []} />

    </div>
  );
}

export default AssetDetail;