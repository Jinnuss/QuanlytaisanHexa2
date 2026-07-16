let servicesPromise = null;

function readRequiredEnvironmentVariable(name) {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`MISSING_ENVIRONMENT_VARIABLE:${name}`);
  }

  return value.trim();
}

function normalizePrivateKey(value) {
  let privateKey = value.trim();

  // Trường hợp giá trị bị bọc thêm dấu "
  if (
    privateKey.startsWith('"') &&
    privateKey.endsWith('"')
  ) {
    privateKey = privateKey.slice(1, -1);
  }

  // Hỗ trợ cả \n dạng text và xuống dòng thật
  return privateKey.replace(/\\n/g, "\n");
}

export async function getAdminServices() {
  if (!servicesPromise) {
    servicesPromise = (async () => {
      const projectId =
        readRequiredEnvironmentVariable(
          "FIREBASE_ADMIN_PROJECT_ID"
        );

      const clientEmail =
        readRequiredEnvironmentVariable(
          "FIREBASE_ADMIN_CLIENT_EMAIL"
        );

      const privateKey = normalizePrivateKey(
        readRequiredEnvironmentVariable(
          "FIREBASE_ADMIN_PRIVATE_KEY"
        )
      );

      const [
        firebaseAdminApp,
        firebaseAdminAuth,
        firebaseAdminDatabase,
      ] = await Promise.all([
        import("firebase-admin/app"),
        import("firebase-admin/auth"),
        import("firebase-admin/database"),
      ]);

      const {
        cert,
        getApps,
        initializeApp,
      } = firebaseAdminApp;

      const { getAuth } = firebaseAdminAuth;
      const { getDatabase } =
        firebaseAdminDatabase;

      const existingApps = getApps();

      const adminApp =
        existingApps.length > 0
          ? existingApps[0]
          : initializeApp({
              credential: cert({
                projectId,
                clientEmail,
                privateKey,
              }),

              databaseURL:
                "https://quanlytaisan-235e5-default-rtdb.asia-southeast1.firebasedatabase.app",
            });

      return {
        adminAuth: getAuth(adminApp),
        adminDb: getDatabase(adminApp),
      };
    })().catch((error) => {
      // Cho phép request sau thử khởi tạo lại
      servicesPromise = null;
      throw error;
    });
  }

  return servicesPromise;
}

export async function requireAdmin(req) {
  const authorization =
    req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const idToken = authorization
    .slice("Bearer ".length)
    .trim();

  if (!idToken) {
    throw new Error("UNAUTHORIZED");
  }

  const { adminAuth, adminDb } =
    await getAdminServices();

  const decodedToken =
    await adminAuth.verifyIdToken(
      idToken,
      true
    );

  const snapshot = await adminDb
    .ref(`users/${decodedToken.uid}`)
    .once("value");

  const profile = snapshot.val();

  if (!profile || profile.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return {
    uid: decodedToken.uid,
    profile,
  };
}