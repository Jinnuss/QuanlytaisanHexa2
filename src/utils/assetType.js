export const ASSET_TYPES = [
  "LAPTOP",
  "PC",
  "LPK",
  "MÀN HÌNH",
];

export function getAssetTypeFromCode(code) {
    const value = String(code || "")
        .trim()
        .toUpperCase();

    if (value.includes("LPK")) {
        return "LPK";
    }

    if (value.includes("PC")) {
        return "PC";
    }

    if (value.includes("LT")) {
        return "LAPTOP";
    }

    if (value.includes("MH")) {
        return "MÀN HÌNH";
    }

    return "";
}