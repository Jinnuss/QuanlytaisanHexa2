import {
  getAdminServices,
  requireAdmin,
} from "../_firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Change-password API đang hoạt động.",
      nodeVersion: process.version,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed.",
    });
  }

  try {
    const currentAdmin = await requireAdmin(req);

    const { uid, newPassword } = req.body || {};

    if (!uid || typeof uid !== "string") {
      return res.status(400).json({
        message: "Thiếu UID tài khoản.",
      });
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({
        message: "Mật khẩu mới quá dài.",
      });
    }

    const { adminAuth, adminDb } =
      await getAdminServices();

    const targetUser = await adminAuth.getUser(uid);

    const profileSnapshot = await adminDb
      .ref(`users/${uid}`)
      .once("value");

    const targetProfile = profileSnapshot.val();

    if (!targetProfile) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin tài khoản.",
      });
    }

    // Không cho Admin này đổi mật khẩu một Admin khác
    if (
      targetProfile.role === "admin" &&
      uid !== currentAdmin.uid
    ) {
      return res.status(403).json({
        message:
          "Không được thay đổi mật khẩu của tài khoản Admin khác.",
      });
    }

    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    await adminDb
      .ref(`users/${uid}`)
      .update({
        passwordUpdatedAt: new Date().toISOString(),
        passwordUpdatedBy: currentAdmin.uid,
      });

    return res.status(200).json({
      message: `Đã đổi mật khẩu cho ${targetUser.email || "tài khoản"}.`,
    });
  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });

    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập.",
      });
    }

    if (error?.message === "FORBIDDEN") {
      return res.status(403).json({
        message: "Chỉ Admin được đổi mật khẩu.",
      });
    }

    if (error?.code === "auth/user-not-found") {
      return res.status(404).json({
        message: "Tài khoản không còn tồn tại.",
      });
    }

    if (error?.code === "auth/invalid-password") {
      return res.status(400).json({
        message:
          "Mật khẩu không hợp lệ. Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    return res.status(500).json({
      message: "Không thể đổi mật khẩu.",
      errorCode: error?.code || "UNKNOWN_ERROR",
    });
  }
}