import {
  getAdminServices,
  requireAdmin,
} from "../_firebaseAdmin.js";

export default async function handler(req, res) {
  // GET dùng để kiểm tra Function đã chạy được chưa
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Create-user API đang hoạt động.",
      nodeVersion: process.version,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed.",
    });
  }

  try {
    const adminUser = await requireAdmin(req);

    const { adminAuth, adminDb } =
      await getAdminServices();

    const {
      name,
      email,
      password,
      company,
    } = req.body || {};

    const normalizedName =
      typeof name === "string"
        ? name.trim()
        : "";

    const normalizedEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    if (!normalizedName) {
      return res.status(400).json({
        message:
          "Vui lòng nhập tên tài khoản.",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "Vui lòng nhập email.",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 6
    ) {
      return res.status(400).json({
        message:
          "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    if (!company) {
      return res.status(400).json({
        message:
          "Vui lòng chọn công ty.",
      });
    }
    try {
      await adminAuth.getUserByEmail(
        normalizedEmail
      );

      return res.status(409).json({
        message:
          "Email này đã được sử dụng bởi một tài khoản khác.",
      });
    } catch (lookupError) {
      if (
        lookupError?.code !==
        "auth/user-not-found"
      ) {
        throw lookupError;
      }
    }

    const newUser =
      await adminAuth.createUser({
        email: normalizedEmail,
        password,
        displayName: normalizedName,
        disabled: false,
      });

    try {
      await adminDb
        .ref(`users/${newUser.uid}`)
        .set({
          name: normalizedName,
          email: normalizedEmail,
          role: "user",
          company,
          enabled: true,
          createdAt:
            new Date().toISOString(),
          createdBy: adminUser.uid,
        });
    } catch (databaseError) {
      // Tránh tạo Auth user nhưng không có profile
      await adminAuth
        .deleteUser(newUser.uid)
        .catch((rollbackError) => {
          console.error(
            "Không thể rollback Auth user:",
            rollbackError
          );
        });

      throw databaseError;
    }

    return res.status(201).json({
      uid: newUser.uid,
      message:
        "Tạo tài khoản thành công.",
    });
  } catch (error) {
    console.error("CREATE_USER_ERROR", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      nodeVersion: process.version,
      hasProjectId: Boolean(
        process.env.FIREBASE_ADMIN_PROJECT_ID
      ),
      hasClientEmail: Boolean(
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL
      ),
      hasPrivateKey: Boolean(
        process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ),
    });

    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập.",
      });
    }

    if (error?.message === "FORBIDDEN") {
      return res.status(403).json({
        message:
          "Chỉ Admin được tạo tài khoản.",
      });
    }

    if (
      error?.code ===
      "auth/email-already-exists"
    ) {
      return res.status(409).json({
        message:
          "Email này đã tồn tại.",
      });
    }

    if (
      error?.message?.startsWith(
        "MISSING_ENVIRONMENT_VARIABLE:"
      )
    ) {
      return res.status(500).json({
        message:
          "Server đang thiếu biến môi trường Firebase Admin.",
      });
    }

    if (
      error?.code ===
      "app/invalid-credential"
    ) {
      return res.status(500).json({
        message:
          "Firebase Admin credential không hợp lệ. Kiểm tra client email và private key.",
      });
    }

    return res.status(500).json({
      message:
        "Không thể tạo tài khoản.",
      errorCode:
        error?.code || "UNKNOWN_ERROR",
    });
  }
}