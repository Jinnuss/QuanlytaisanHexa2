import {
  adminAuth,
  adminDb,
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

    const {
      name,
      email,
      password,
      company,
    } = req.body || {};

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Vui lòng nhập tên tài khoản.",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Vui lòng nhập email.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        message:
          "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    if (!company) {
      return res.status(400).json({
        message: "Vui lòng chọn công ty.",
      });
    }

    const newUser =
      await adminAuth.createUser({
        email: email.trim().toLowerCase(),
        password,
        displayName: name.trim(),
        disabled: false,
      });

    await adminDb
      .ref(`users/${newUser.uid}`)
      .set({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "user",
        company,
        enabled: true,
        createdAt:
          new Date().toISOString(),
        createdBy: adminUser.uid,
      });

    return res.status(201).json({
      uid: newUser.uid,
      message: "Tạo tài khoản thành công.",
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.message === "UNAUTHORIZED") {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập.",
      });
    }

    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        message:
          "Chỉ Admin được tạo tài khoản.",
      });
    }

    if (
      error.code === "auth/email-already-exists"
    ) {
      return res.status(409).json({
        message: "Email này đã tồn tại.",
      });
    }

    return res.status(500).json({
      message:
        "Không thể tạo tài khoản.",
    });
  }
}