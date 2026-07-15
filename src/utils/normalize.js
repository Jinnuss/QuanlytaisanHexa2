export const normalizeAssetCode = (value = "") => {
  return String(value)
    .trim()
    .toUpperCase();
};

export const normalizeIpAddress = (value = "") => {
  return String(value).trim();
};