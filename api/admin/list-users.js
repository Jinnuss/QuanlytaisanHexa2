import {
    getAdminServices,
    requireAdmin,
} from "../_firebaseAdmin.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            message: "Method not allowed.",
        });
    }

    try {
        await requireAdmin(req);

        const { adminAuth, adminDb } =
            await getAdminServices();

        const authResult =
            await adminAuth.listUsers(1000);

        const profileSnapshot = await adminDb
            .ref("users")
            .once("value");

        const profiles =
            profileSnapshot.val() || {};

        const users = authResult.users.map(
            (userRecord) => {
                const profile =
                    profiles[userRecord.uid] || {};

                return {
                    uid: userRecord.uid,
                    name:
                        profile.name ||
                        userRecord.displayName ||
                        "",
                    email: userRecord.email || "",
                    company: profile.company || "",
                    role: profile.role || "user",
                    enabled:
                        profile.enabled !== false &&
                        userRecord.disabled !== true,
                    disabled:
                        userRecord.disabled === true,
                    createdAt:
                        profile.createdAt ||
                        userRecord.metadata.creationTime ||
                        "",
                    lastLoginAt:
                        userRecord.metadata
                            .lastSignInTime || "",
                };
            }
        );

        return res.status(200).json({
            users,
        });
    } catch (error) {
        console.error("LIST_USERS_ERROR", error);

        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({
                message: "Bạn chưa đăng nhập.",
            });
        }

        if (error?.message === "FORBIDDEN") {
            return res.status(403).json({
                message:
                    "Chỉ Admin được xem tài khoản.",
            });
        }

        return res.status(500).json({
            message:
                "Không thể tải danh sách tài khoản.",
        });
    }
}