import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

function getPrivateKey() {
  const privateKey =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      "Thiếu biến FIREBASE_ADMIN_PRIVATE_KEY"
    );
  }

  return privateKey.replace(/\\n/g, "\n");
}

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId:
            process.env.FIREBASE_ADMIN_PROJECT_ID,

          clientEmail:
            process.env.FIREBASE_ADMIN_CLIENT_EMAIL,

          privateKey: getPrivateKey(),
        }),

        databaseURL:
          "https://quanlytaisan-235e5-default-rtdb.asia-southeast1.firebasedatabase.app",
      });

export const adminAuth = getAuth(adminApp);
export const adminDb = getDatabase(adminApp);

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