import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AuditLog from "../components/AuditLog";
import { getPublicAsset } from "../assetService";

function PublicAssetDetail() {
  const { firebaseId } = useParams();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAsset = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Firebase ID từ QR:", firebaseId);

        const result = await getPublicAsset(firebaseId);

        console.log("Dữ liệu QR nhận được:", result);

        if (!result) {
          setError(
            "Không tìm thấy dữ liệu công khai của tài sản này."
          );
          return;
        }

        setAsset(result);
      } catch (error) {
        console.error("Lỗi tải tài sản QR:", error);

        if (
          error.code === "PERMISSION_DENIED" ||
          error.message?.includes("Permission denied")
        ) {
          setError(
            "Firebase đang chặn quyền xem thông tin QR."
          );
        } else {
          setError(
            error.message ||
            "Không thể tải thông tin tài sản."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [firebaseId]);

  if (loading) {
    return (
      <div className="public-asset-page">
        <div className="public-message">
          Đang tải thông tin tài sản...
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="public-asset-page">
        <div className="public-message error-message">
          {error || "Không tìm thấy tài sản."}
        </div>
      </div>
    );
  }

  const price = Number(asset.price || 0).toLocaleString("vi-VN");

  return (
    <div className="public-asset-page">
      <div className="public-asset-card">
        <div className="public-asset-header">
          <div className="public-logo">⬢</div>

          <div>
            <p className="public-brand">HEXAGROUP</p>
            <h1>Thông tin tài sản</h1>
          </div>
        </div>

        <div className="public-asset-code">
          {asset.code}
        </div>

        <div className="public-information-grid">
          <div className="public-field">
            <span>Tên tài sản</span>
            <strong>{asset.name || "—"}</strong>
          </div>

          <div className="public-field">
            <span>Công ty</span>
            <strong>{asset.company || "—"}</strong>
          </div>
          <div className="public-field">
            <span>Địa chỉ IP</span>
            <strong>{asset.ipAddress || "Chưa có"}</strong>
          </div>
          <div className="public-field">
            <span>Người sử dụng</span>
            <strong>{asset.user || "Chưa cấp phát"}</strong>
          </div>

          <div className="public-field">
            <span>Giá tiền</span>
            <strong>{price} ₫</strong>
          </div>

          <div className="public-field">
            <span>Trạng thái</span>

            <strong
              className={
                asset.status === "Kho"
                  ? "public-status stock"
                  : "public-status using"
              }
            >
              {asset.status || "—"}
            </strong>
          </div>

          <div className="public-field">
            <span>Ghi chú</span>
            <strong>{asset.note || "Không có"}</strong>
          </div>
        </div>

        <AuditLog logs={asset.logs || []} />
      </div>
    </div>
  );
}

export default PublicAssetDetail;