import {
  getAdminServices,
  requireAdmin,
} from "../_firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed.",
    });
  }

  try {
    const adminUser = await requireAdmin(req);

    const { uid, enabled } = req.body || {};

    if (!uid) {
      return res.status(400).json({
        message: "Thiếu UID tài khoản.",
      });
    }

    if (uid === adminUser.uid) {
      return res.status(400).json({
        message:
          "Bạn không thể khóa chính tài khoản đang đăng nhập.",
      });
    }

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        message:
          "Trạng thái tài khoản không hợp lệ.",
      });
    }

    const { adminAuth, adminDb } =
      await getAdminServices();

    await adminAuth.updateUser(uid, {
      disabled: !enabled,
    });

    await adminDb
      .ref(`users/${uid}`)
      .update({
        enabled,
        updatedAt:
          new Date().toISOString(),
        updatedBy: adminUser.uid,
      });

    return res.status(200).json({
      message: enabled
        ? "Đã mở khóa tài khoản."
        : "Đã khóa tài khoản.",
    });
  } catch (error) {
    console.error(
      "TOGGLE_USER_STATUS_ERROR",
      error
    );

    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập.",
      });
    }

    if (error?.message === "FORBIDDEN") {
      return res.status(403).json({
        message:
          "Chỉ Admin được thay đổi trạng thái tài khoản.",
      });
    }

    return res.status(500).json({
      message:
        "Không thể cập nhật trạng thái tài khoản.",
    });
  }
}