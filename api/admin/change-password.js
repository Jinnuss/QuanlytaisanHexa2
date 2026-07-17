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
    const currentAdmin = await requireAdmin(req);

    const { uid, email, newPassword } = req.body || {};

    if (!uid) {
      return res.status(400).json({
        message: "Thiếu UID tài khoản.",
      });
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    const { adminAuth, adminDb } =
      await getAdminServices();

    const targetUser = await adminAuth.getUser(uid);

    console.log("CHANGE_PASSWORD_TARGET", {
      requestedUid: uid,
      requestedEmail: email || "",
      actualUid: targetUser.uid,
      actualEmail: targetUser.email || "",
      changedBy: currentAdmin.uid,
    });

    if (
      email &&
      targetUser.email?.toLowerCase() !==
        email.trim().toLowerCase()
    ) {
      return res.status(409).json({
        message:
          "UID và email không cùng một tài khoản. Vui lòng tải lại danh sách tài khoản.",
      });
    }

    const updatedUser = await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    await adminAuth.revokeRefreshTokens(uid);

    await adminDb.ref(`users/${uid}`).update({
      passwordUpdatedAt: new Date().toISOString(),
      passwordUpdatedBy: currentAdmin.uid,
    });

    return res.status(200).json({
      message: "Đổi mật khẩu thành công.",
      updatedUid: updatedUser.uid,
      updatedEmail: updatedUser.email || "",
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
        message: "Không tìm thấy tài khoản Authentication.",
      });
    }

    return res.status(500).json({
      message:
        error?.message || "Không thể đổi mật khẩu.",
      errorCode: error?.code || "UNKNOWN_ERROR",
    });
  }
}