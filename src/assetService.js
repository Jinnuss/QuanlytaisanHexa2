import { db } from "./firebase";

import {
  ref,
  push,
  update,
  onValue,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";
import {
  normalizeAssetCode,
  normalizeIpAddress,
} from "./utils/normalize";

// Đọc realtime
const createPublicAsset = (asset) => ({
  code: asset.code || "",
  name: asset.name || "",
  company: asset.company || "",
  user: asset.user || "",
  status: asset.status || "Kho",
  note: asset.note || "",
  createdDate: asset.createdDate || "",
  ipAddress: asset.ipAddress || "",
  logs: Array.isArray(asset.logs)
    ? asset.logs
    : [],
});
export const findAssetByCode = async (code) => {
  const normalizedCode = normalizeAssetCode(code);

  if (!normalizedCode) {
    return null;
  }

  const snapshot = await get(ref(db, "assets"));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.val();

  const foundEntry = Object.entries(data).find(
    ([, asset]) =>
      normalizeAssetCode(asset.code) === normalizedCode
  );

  if (!foundEntry) {
    return null;
  }

  const [firebaseId, asset] = foundEntry;

  return {
    firebaseId,
    ...asset,
  };
};

export const findAssetByIp = async (ipAddress) => {
  const normalizedIp = normalizeIpAddress(ipAddress);

  // Không nhập IP thì không kiểm tra trùng
  if (!normalizedIp) {
    return null;
  }

  const snapshot = await get(ref(db, "assets"));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.val();

  const foundEntry = Object.entries(data).find(
    ([, asset]) =>
      normalizeIpAddress(asset.ipAddress) === normalizedIp
  );

  if (!foundEntry) {
    return null;
  }

  const [firebaseId, asset] = foundEntry;

  return {
    firebaseId,
    ...asset,
  };
};
export const validateAssetDuplicates = async (
  asset,
  currentFirebaseId = null
) => {
  const duplicateCode = await findAssetByCode(asset.code);

  if (
    duplicateCode &&
    duplicateCode.firebaseId !== currentFirebaseId
  ) {
    return {
      valid: false,
      field: "code",
      message: `Mã tài sản "${asset.code}" đã tồn tại.`,
      duplicateAsset: duplicateCode,
    };
  }

  const normalizedIp = normalizeIpAddress(
    asset.ipAddress
  );

  if (normalizedIp) {
    const duplicateIp = await findAssetByIp(
      normalizedIp
    );

    if (
      duplicateIp &&
      duplicateIp.firebaseId !== currentFirebaseId
    ) {
      return {
        valid: false,
        field: "ipAddress",
        message:
          `Địa chỉ IP "${normalizedIp}" đang được sử dụng bởi ` +
          `${duplicateIp.code || "một tài sản khác"}.`,
        duplicateAsset: duplicateIp,
      };
    }
  }

  return {
    valid: true,
  };
};
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
    code: normalizeAssetCode(asset.code),
    ipAddress: normalizeIpAddress(
      asset.ipAddress
    ),
  };

  await update(ref(db), {
    [`assets/${firebaseId}`]: assetData,
    [`publicAssets/${firebaseId}`]:
      createPublicAsset(assetData),
  });

  return firebaseId;
};
// Cập nhật
export const updateAsset = async (asset) => {
  if (!asset.firebaseId) {
    throw new Error(
      "Tài sản không có Firebase ID."
    );
  }

  const assetData = {
    ...asset,
    code: normalizeAssetCode(asset.code),
    ipAddress: normalizeIpAddress(
      asset.ipAddress
    ),
  };

  await update(ref(db), {
    [`assets/${asset.firebaseId}`]:
      assetData,

    [`publicAssets/${asset.firebaseId}`]:
      createPublicAsset(assetData),
  });
};

// Xóa
// export const deleteAsset = async (firebaseId) => {
//   if (!firebaseId) {
//     throw new Error("Firebase ID không hợp lệ.");
//   }

//   await update(ref(db), {
//     [`assets/${firebaseId}`]: null,
//     [`publicAssets/${firebaseId}`]: null,
//   });
// };
export const moveAssetToTrash = async ({
  asset,
  deletedBy,
}) => {
  if (!asset?.firebaseId) {
    throw new Error("Tài sản không có Firebase ID.");
  }

  const firebaseId = asset.firebaseId;

  const trashData = {
    ...asset,
    deletedAt: new Date().toISOString(),
    deletedBy: deletedBy || "",
  };

  await update(ref(db), {
    [`assets/${firebaseId}`]: null,
    [`publicAssets/${firebaseId}`]: null,
    [`trash/${firebaseId}`]: trashData,
  });
};
export const getTrashAssets = (callback) => {
  const trashRef = ref(db, "trash");

  return onValue(trashRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      callback([]);
      return;
    }

    const trashAssets = Object.entries(data).map(
      ([firebaseId, value]) => ({
        ...value,
        firebaseId,
      })
    );

    callback(trashAssets);
  });
};
export const restoreAsset = async (asset) => {
  if (!asset?.firebaseId) {
    throw new Error("Tài sản không có Firebase ID.");
  }

  const {
    deletedAt,
    deletedBy,
    ...restoredAsset
  } = asset;

  await update(ref(db), {
    [`trash/${asset.firebaseId}`]: null,
    [`assets/${asset.firebaseId}`]: restoredAsset,
    [`publicAssets/${asset.firebaseId}`]:
      createPublicAsset(restoredAsset),
  });
};
export const permanentlyDeleteAsset = async (
  firebaseId
) => {
  if (!firebaseId) {
    throw new Error("Firebase ID không hợp lệ.");
  }

  await update(ref(db), {
    [`trash/${firebaseId}`]: null,
  });
};
export const clearTrash = async () => {
  await update(ref(db), {
    trash: null,
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
  const assetsResult = {};
  const publicAssetsResult = {};

  assets.forEach((asset) => {
    const firebaseId = crypto.randomUUID();

    const assetData = {
      ...asset,
      firebaseId,
      logs: Array.isArray(asset.logs) ? asset.logs : [],
    };

    assetsResult[firebaseId] = assetData;
    publicAssetsResult[firebaseId] =
      createPublicAsset(assetData);
  });

  await update(ref(db), {
    assets: assetsResult,
    publicAssets: publicAssetsResult,
  });
};

// Xóa toàn bộ
export const clearAssets = async () => {
  await update(ref(db), {
    assets: null,
    publicAssets: null,
  });
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