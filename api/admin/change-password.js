import {
  adminAuth,
  requireAdmin,
} from "../_firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed.",
    });
  }

  try {
    await requireAdmin(req);

    const {
      uid,
      newPassword,
    } = req.body || {};

    if (!uid) {
      return res.status(400).json({
        message: "Thiếu UID tài khoản.",
      });
    }

    if (
      !newPassword ||
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message:
          "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    return res.status(200).json({
      message:
        "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    if (error.message === "UNAUTHORIZED") {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập.",
      });
    }

    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        message:
          "Chỉ Admin được đổi mật khẩu.",
      });
    }

    if (
      error.code === "auth/user-not-found"
    ) {
      return res.status(404).json({
        message:
          "Không tìm thấy tài khoản.",
      });
    }

    return res.status(500).json({
      message:
        "Không thể đổi mật khẩu.",
    });
  }
}