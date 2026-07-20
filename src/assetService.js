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
import {
  getAssetTypeFromCode,
} from "./utils/assetType";
// Đọc realtime
const createPublicAsset = (asset) => ({
  code: asset.code || "",
  assetType:
    asset.assetType ||
    getAssetTypeFromCode(asset.code),
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
    assetType:
      asset.assetType ||
      getAssetTypeFromCode(asset.code),
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
    assetType:
      asset.assetType ||
      getAssetTypeFromCode(asset.code),
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

  const restoredAssetData = {
    ...restoredAsset,

    assetType:
      restoredAsset.assetType ||
      getAssetTypeFromCode(restoredAsset.code),
  };

  await update(ref(db), {
    [`trash/${asset.firebaseId}`]: null,
    [`assets/${asset.firebaseId}`]: restoredAssetData,

    [`publicAssets/${asset.firebaseId}`]:
      createPublicAsset(restoredAssetData),
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

// Import Excel: thêm mới, cập nhật và bỏ qua dữ liệu không đổi
const normalizeText = (value) =>
  String(value ?? "").trim();

const normalizePrice = (value) => {
  const price = Number(value);
  return Number.isFinite(price) ? price : 0;
};

const getChangedFields = (oldAsset, newAsset) => {
  const changedFields = [];

  if (normalizeText(oldAsset.name) !== normalizeText(newAsset.name)) {
    changedFields.push("Tên tài sản");
  }

  if (
    normalizeText(oldAsset.company) !==
    normalizeText(newAsset.company)
  ) {
    changedFields.push("Công ty");
  }

  if (normalizeText(oldAsset.user) !== normalizeText(newAsset.user)) {
    changedFields.push("Người sử dụng");
  }

  if (normalizePrice(oldAsset.price) !== normalizePrice(newAsset.price)) {
    changedFields.push("Giá tiền");
  }

  if (normalizeText(oldAsset.note) !== normalizeText(newAsset.note)) {
    changedFields.push("Ghi chú");
  }

  if (
    normalizeIpAddress(oldAsset.ipAddress) !==
    normalizeIpAddress(newAsset.ipAddress)
  ) {
    changedFields.push("Địa chỉ IP");
  }

  if (
    normalizeText(oldAsset.status) !==
    normalizeText(newAsset.status)
  ) {
    changedFields.push("Trạng thái");
  }
  if (
    normalizeText(
      oldAsset.assetType ||
      getAssetTypeFromCode(oldAsset.code)
    ) !==
    normalizeText(
      newAsset.assetType ||
      getAssetTypeFromCode(newAsset.code)
    )
  ) {
    changedFields.push("Loại tài sản");
  }

  return changedFields;
};

export const importAssets = async (importedAssets) => {
  if (!Array.isArray(importedAssets)) {
    throw new Error("Dữ liệu import không hợp lệ.");
  }

  const snapshot = await get(ref(db, "assets"));
  const databaseAssets = snapshot.exists()
    ? snapshot.val()
    : {};

  const assetsByCode = new Map();
  const ipOwners = new Map();

  Object.entries(databaseAssets).forEach(
    ([firebaseId, asset]) => {
      const code = normalizeAssetCode(asset.code);
      const ip = normalizeIpAddress(asset.ipAddress);

      if (code) {
        assetsByCode.set(code, {
          firebaseId,
          asset,
        });
      }

      if (ip) {
        ipOwners.set(ip, firebaseId);
      }
    }
  );

  const firebaseUpdates = {};
  const processedCodes = new Set();

  const addedItems = [];
  const updatedItems = [];
  const unchangedItems = [];
  const skippedItems = [];

  for (const importedAsset of importedAssets) {
    const normalizedCode = normalizeAssetCode(
      importedAsset.code
    );
    const normalizedIp = normalizeIpAddress(
      importedAsset.ipAddress
    );

    if (!normalizedCode) {
      skippedItems.push({
        row: importedAsset.excelRow,
        code: importedAsset.code || "",
        reason: "Thiếu mã tài sản",
      });
      continue;
    }

    if (processedCodes.has(normalizedCode)) {
      skippedItems.push({
        row: importedAsset.excelRow,
        code: importedAsset.code,
        reason: "Trùng mã tài sản trong file Excel",
      });
      continue;
    }

    processedCodes.add(normalizedCode);

    const existingRecord = assetsByCode.get(normalizedCode);

    if (!existingRecord) {
      if (normalizedIp && ipOwners.has(normalizedIp)) {
        skippedItems.push({
          row: importedAsset.excelRow,
          code: importedAsset.code,
          reason: "Địa chỉ IP đang thuộc tài sản khác",
        });
        continue;
      }

      const newAssetRef = push(ref(db, "assets"));
      const firebaseId = newAssetRef.key;

      if (!firebaseId) {
        skippedItems.push({
          row: importedAsset.excelRow,
          code: importedAsset.code,
          reason: "Không thể tạo Firebase ID",
        });
        continue;
      }

      const now = new Date().toISOString();
      const newAssetData = {
        id: importedAsset.id || crypto.randomUUID(),
        firebaseId,
        code: normalizedCode,
        assetType:
          importedAsset.assetType ||
          getAssetTypeFromCode(normalizedCode),
        name: normalizeText(importedAsset.name),
        company: normalizeText(importedAsset.company),
        user: normalizeText(importedAsset.user),
        price: normalizePrice(importedAsset.price),
        note: normalizeText(importedAsset.note),
        ipAddress: normalizedIp,
        status: importedAsset.user
          ? "Đang cấp phát"
          : "Kho",
        createdDate:
          importedAsset.createdDate ||
          now.split("T")[0],
        logs: [
          {
            action: "Import tài sản từ Excel",
            date: now,
          },
        ],
      };

      firebaseUpdates[`assets/${firebaseId}`] = newAssetData;
      firebaseUpdates[`publicAssets/${firebaseId}`] =
        createPublicAsset(newAssetData);

      addedItems.push({
        row: importedAsset.excelRow,
        code: newAssetData.code,
      });

      assetsByCode.set(normalizedCode, {
        firebaseId,
        asset: newAssetData,
      });

      if (normalizedIp) {
        ipOwners.set(normalizedIp, firebaseId);
      }

      continue;
    }

    const { firebaseId, asset: oldAsset } = existingRecord;
    const ipOwner = normalizedIp
      ? ipOwners.get(normalizedIp)
      : null;

    if (ipOwner && ipOwner !== firebaseId) {
      skippedItems.push({
        row: importedAsset.excelRow,
        code: importedAsset.code,
        reason: "Địa chỉ IP đang thuộc tài sản khác",
      });
      continue;
    }

    const nextAsset = {
      ...oldAsset,
      firebaseId,
      code: normalizedCode,
      assetType:
        importedAsset.assetType ||
        getAssetTypeFromCode(normalizedCode),
      name: normalizeText(importedAsset.name),
      company: normalizeText(importedAsset.company),
      user: normalizeText(importedAsset.user),
      price: normalizePrice(importedAsset.price),
      note: normalizeText(importedAsset.note),
      ipAddress: normalizedIp,
      status: importedAsset.user
        ? "Đang cấp phát"
        : "Kho",
    };

    const changedFields = getChangedFields(oldAsset, nextAsset);

    if (changedFields.length === 0) {
      unchangedItems.push({
        row: importedAsset.excelRow,
        code: importedAsset.code,
      });
      continue;
    }

    const oldIp = normalizeIpAddress(oldAsset.ipAddress);
    const oldLogs = Array.isArray(oldAsset.logs)
      ? oldAsset.logs
      : [];

    const updatedAssetData = {
      ...nextAsset,
      logs: [
        ...oldLogs,
        {
          action: `Cập nhật từ Excel: ${changedFields.join(", ")}`,
          date: new Date().toISOString(),
        },
      ],
    };

    firebaseUpdates[`assets/${firebaseId}`] = updatedAssetData;
    firebaseUpdates[`publicAssets/${firebaseId}`] =
      createPublicAsset(updatedAssetData);

    updatedItems.push({
      row: importedAsset.excelRow,
      code: importedAsset.code,
      changedFields,
    });

    if (oldIp && oldIp !== normalizedIp) {
      ipOwners.delete(oldIp);
    }

    if (normalizedIp) {
      ipOwners.set(normalizedIp, firebaseId);
    }

    assetsByCode.set(normalizedCode, {
      firebaseId,
      asset: updatedAssetData,
    });
  }

  if (Object.keys(firebaseUpdates).length > 0) {
    await update(ref(db), firebaseUpdates);
  }

  return {
    total: importedAssets.length,
    added: addedItems.length,
    updated: updatedItems.length,
    unchanged: unchangedItems.length,
    skipped: skippedItems.length,
    addedItems,
    updatedItems,
    unchangedItems,
    skippedItems,
  };
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

    const normalizedCode =
      normalizeAssetCode(asset.code);

    const assetData = {
      ...asset,

      firebaseId,

      code: normalizedCode,

      assetType:
        asset.assetType ||
        getAssetTypeFromCode(normalizedCode),

      ipAddress:
        normalizeIpAddress(asset.ipAddress),

      logs:
        Array.isArray(asset.logs)
          ? asset.logs
          : [],
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