import { db } from "./firebase";

import {
  ref,
  push,
  update,
  remove,
  onValue,
  query,
  orderByChild,
  equalTo,
  get,
  set
} from "firebase/database";

// Đọc realtime
const createPublicAsset = (asset) => ({
  code: asset.code || "",
  name: asset.name || "",
  company: asset.company || "",
  user: asset.user || "",
  status: asset.status || "Kho",
  note: asset.note || "",
  createdDate: asset.createdDate || "",

  logs: Array.isArray(asset.logs)
    ? asset.logs
    : [],
});
export const getAssets = (
  userProfile,
  callback
) => {
  if (!userProfile) {
    callback([]);
    return () => { };
  }

  const assetsSource =
    userProfile.role === "admin"
      ? ref(db, "assets")
      : query(
        ref(db, "assets"),
        orderByChild("company"),
        equalTo(userProfile.company)
      );

  return onValue(
    assetsSource,
    (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        callback([]);
        return;
      }

      const assets = Object.entries(data).map(
        ([key, value]) => ({
          ...value,
          firebaseId: key,
        })
      );

      callback(assets);
    },
    (error) => {
      console.error(
        "Lỗi đọc tài sản:",
        error
      );

      callback([]);
    }
  );
};

// Thêm
// export const addAsset = async (asset) => {
//   await push(ref(db, "assets"), asset);
// };
export const addAsset = async (asset) => {
  const newRef = push(ref(db, "assets"));
  const firebaseId = newRef.key;

  if (!firebaseId) {
    throw new Error("Không thể tạo Firebase ID.");
  }

  const assetData = {
    ...asset,
    firebaseId,
  };

  await update(ref(db), {
    [`assets/${firebaseId}`]: assetData,
    [`publicAssets/${firebaseId}`]: createPublicAsset(assetData),
  });

  return firebaseId;
};
// Cập nhật
export const updateAsset = async (asset) => {
  if (!asset.firebaseId) {
    throw new Error("Tài sản không có Firebase ID.");
  }

  const assetData = {
    ...asset,
  };

  await update(ref(db), {
    [`assets/${asset.firebaseId}`]: assetData,
    [`publicAssets/${asset.firebaseId}`]:
      createPublicAsset(assetData),
  });
};

// Xóa
export const deleteAsset = async (firebaseId) => {
  if (!firebaseId) {
    throw new Error("Firebase ID không hợp lệ.");
  }

  await update(ref(db), {
    [`assets/${firebaseId}`]: null,
    [`publicAssets/${firebaseId}`]: null,
  });
};

// Import thêm
export const importAssets = async (assets) => {
  for (const asset of assets) {
    await push(ref(db, "assets"), asset);
  }
};
export const getPublicAsset = async (firebaseId) => {
  if (!firebaseId) {
    throw new Error("Firebase ID không hợp lệ.");
  }

  const snapshot = await get(
    ref(db, `publicAssets/${firebaseId}`)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    firebaseId,
    ...snapshot.val(),
  };
};
export const syncPublicAssets = async () => {
  const snapshot = await get(ref(db, "assets"));

  if (!snapshot.exists()) {
    throw new Error("Không có tài sản để đồng bộ.");
  }

  const assets = snapshot.val();
  const updates = {};

  Object.entries(assets).forEach(([firebaseId, asset]) => {
    updates[`publicAssets/${firebaseId}`] =
      createPublicAsset(asset);
  });

  await update(ref(db), updates);
};

// Ghi đè toàn bộ dữ liệu
export const replaceAllAssets = async (assets) => {
  const result = {};

  assets.forEach((asset) => {
    result[crypto.randomUUID()] = asset;
  });

  await set(ref(db, "assets"), result);
};

// Xóa toàn bộ
export const clearAssets = async () => {
  await remove(ref(db, "assets"));
};

export const getNextAssetNumber = async (prefix) => {

  const snapshot = await get(ref(db, "assets"));

  if (!snapshot.exists()) return 1;

  const data = Object.values(snapshot.val());

  let max = 0;

  data.forEach(asset => {

    if (!asset.code) return;

    if (asset.code.startsWith(prefix)) {

      const number = parseInt(
        asset.code.substring(prefix.length),
        10
      );

      if (!isNaN(number) && number > max) {
        max = number;
      }

    }

  });

  return max + 1;

};