import admin from "firebase-admin";

function getPrivateKey() {
  const value = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!value) {
    throw new Error(
      "Thiếu FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  return value.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:
        process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail:
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    }),

    databaseURL:
      "https://quanlytaisan-235e5-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.database();
export async function requireAdmin(req) {
  const authorization =
    req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const idToken = authorization.slice(7);

  const decodedToken =
    await adminAuth.verifyIdToken(idToken);

  const profileSnapshot = await adminDb
    .ref(`users/${decodedToken.uid}`)
    .once("value");

  const profile = profileSnapshot.val();

  if (!profile || profile.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return {
    uid: decodedToken.uid,
    profile,
  };
}