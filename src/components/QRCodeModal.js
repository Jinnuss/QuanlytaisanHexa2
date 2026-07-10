import React, { useRef } from "react";
import QRCode from "react-qr-code";

function QRCodeModal({ asset, onClose }) {
  const qrWrapperRef = useRef(null);

  if (!asset) return null;

  const baseUrl = window.location.origin;

  const assetUrl =
    `${baseUrl}/asset/${encodeURIComponent(asset.firebaseId)}`;

  const downloadQRCode = () => {
    const svg = qrWrapperRef.current?.querySelector("svg");

    if (!svg) {
      alert("Không tìm thấy QR Code.");
      return;
    }

    const serializer = new XMLSerializer();
    const svgSource = serializer.serializeToString(svg);

    const svgBlob = new Blob([svgSource], {
      type: "image/svg+xml;charset=utf-8",
    });

    const objectUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const padding = 40;
      const qrSize = 320;

      const canvas = document.createElement("canvas");
      canvas.width = qrSize + padding * 2;
      canvas.height = qrSize + 125;

      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      // Nền trắng
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // QR Code
      context.drawImage(
        image,
        padding,
        padding,
        qrSize,
        qrSize
      );

      // Tên thương hiệu
      context.fillStyle = "#0f3d5e";
      context.font = "bold 22px Arial";
      context.textAlign = "center";
      context.fillText(
        "HEXAGROUP",
        canvas.width / 2,
        qrSize + 75
      );

      // Mã tài sản
      context.fillStyle = "#0f172a";
      context.font = "bold 18px Arial";
      context.fillText(
        asset.code || "Tài sản",
        canvas.width / 2,
        qrSize + 105
      );

      const pngUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `QR-${asset.code || asset.firebaseId}.png`;
      link.click();

      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      alert("Không thể tạo ảnh QR.");
    };

    image.src = objectUrl;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="qr-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="qr-close-button"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>

        <div className="qr-brand">
          <div className="qr-brand-logo">⬢</div>

          <div>
            <span>HEXAGROUP</span>
            <p>Asset Management</p>
          </div>
        </div>

        <h2>QR tài sản</h2>

        <div className="qr-wrapper" ref={qrWrapperRef}>
          <QRCode
            value={assetUrl}
            size={220}
            bgColor="#ffffff"
            fgColor="#0f3d5e"
            level="H"
          />
        </div>

        <h3>{asset.code}</h3>

        <p className="qr-asset-name">
          {asset.name}
        </p>

        <p className="qr-description">
          Quét mã để xem thông tin và lịch sử tài sản.
        </p>

        <div className="qr-actions">
          <button
            type="button"
            className="qr-download-button"
            onClick={downloadQRCode}
          >
            Tải QR PNG
          </button>

          <button
            type="button"
            className="qr-close-secondary"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRCodeModal;