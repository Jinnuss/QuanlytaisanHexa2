import React from "react";

function TrashModal({
    assets,
    onRestore,
    onPermanentDelete,
    onClearTrash,
    onClose,
}) {
    return (
        <div
            className="trash-overlay"
            onClick={onClose}
        >
            <div
                className="trash-modal"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="trash-header">
                    <div>
                        <h2>Thùng rác</h2>
                        <p>
                            {assets.length} tài sản đã xóa
                        </p>
                    </div>

                    <button
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {assets.length === 0 ? (
                    <div className="trash-empty">
                        <div className="trash-empty-icon">
                            🗑️
                        </div>

                        <h3>Thùng rác đang trống</h3>

                        <p>
                            Các tài sản bị xóa sẽ xuất hiện tại đây.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="trash-toolbar">
                            <span>
                                Có thể khôi phục hoặc xóa vĩnh viễn từng tài sản.
                            </span>

                            <button
                                className="clear-trash-btn"
                                onClick={onClearTrash}
                            >
                                Xóa toàn bộ thùng rác
                            </button>
                        </div>

                        <div className="trash-list">
                            {assets.map((asset) => (
                                <div
                                    className="trash-item"
                                    key={asset.firebaseId}
                                >
                                    <div className="trash-item-info">
                                        <div className="trash-code">
                                            {asset.code}
                                        </div>

                                        <div className="trash-name">
                                            {asset.name}
                                        </div>

                                        <div className="trash-meta">
                                            <span>
                                                Công ty:{" "}
                                                {asset.company || "—"}
                                            </span>

                                            <span>
                                                Đã xóa:{" "}
                                                {asset.deletedAt
                                                    ? new Date(
                                                        asset.deletedAt
                                                    ).toLocaleString(
                                                        "vi-VN"
                                                    )
                                                    : "—"}
                                            </span>

                                            <span>
                                                Người xóa:{" "}
                                                {asset.deletedBy || "—"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="trash-actions">
                                        <button
                                            className="restore-btn"
                                            onClick={() =>
                                                onRestore(asset)
                                            }
                                        >
                                            Khôi phục
                                        </button>

                                        <button
                                            className="permanent-delete-btn"
                                            onClick={() =>
                                                onPermanentDelete(asset)
                                            }
                                        >
                                            Xóa vĩnh viễn
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default TrashModal;