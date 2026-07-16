import {
  getAdminServices,
  requireAdmin,
} from "../_firebaseAdmin.js";

const ALLOWED_COMPANIES = [
  "HXG",
  "HOMIE",
  "GDB",
  "Vietfurniture",
  "NEW",
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed.",
    });
  }

  try {
    const adminUser = await requireAdmin(req);

    const { uid, company } = req.body || {};

    if (!uid) {
      return res.status(400).json({
        message: "Thiếu UID tài khoản.",
      });
    }

    if (
      !ALLOWED_COMPANIES.includes(company)
    ) {
      return res.status(400).json({
        message: "Công ty không hợp lệ.",
      });
    }

    const { adminDb } =
      await getAdminServices();

    const profileSnapshot = await adminDb
      .ref(`users/${uid}`)
      .once("value");

    const profile = profileSnapshot.val();

    if (!profile) {
      return res.status(404).json({
        message:
          "Không tìm thấy hồ sơ tài khoản.",
      });
    }

    if (profile.role === "admin") {
      return res.status(400).json({
        message:
          "Không thay đổi công ty giới hạn cho tài khoản Admin.",
      });
    }

    await adminDb
      .ref(`users/${uid}`)
      .update({
        company,
        updatedAt:
          new Date().toISOString(),
        updatedBy: adminUser.uid,
      });

    return res.status(200).json({
      message:
        "Đã cập nhật công ty tài khoản.",
    });
  } catch (error) {
    console.error(
      "UPDATE_USER_COMPANY_ERROR",
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
          "Chỉ Admin được thay đổi công ty.",
      });
    }

    return res.status(500).json({
      message:
        "Không thể cập nhật công ty.",
    });
  }
}