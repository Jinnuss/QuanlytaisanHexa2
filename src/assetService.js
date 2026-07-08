import { db } from "./firebase";

import {
  ref,
  push,
  update,
  remove,
  onValue,
  set,
} from "firebase/database";

// Đọc realtime
export const getAssets = (callback) => {
  const assetsRef = ref(db, "assets");

  onValue(assetsRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      callback([]);
      return;
    }

    const assets = Object.entries(data).map(([key, value]) => ({
      firebaseId: key,
      ...value,
    }));

    callback(assets);
  });
};

// Thêm
export const addAsset = async (asset) => {
  await push(ref(db, "assets"), asset);
};

// Cập nhật
export const updateAsset = async (asset) => {
  await update(
    ref(db, `assets/${asset.firebaseId}`),
    asset
  );
};

// Xóa
export const deleteAsset = async (firebaseId) => {
  await remove(ref(db, `assets/${firebaseId}`));
};

// Import thêm
export const importAssets = async (assets) => {
  for (const asset of assets) {
    await push(ref(db, "assets"), asset);
  }
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