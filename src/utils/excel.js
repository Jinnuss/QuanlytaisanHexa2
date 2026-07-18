import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  normalizeAssetCode,
  normalizeIpAddress,
} from "./normalize";

const normalizeHeader = (value) =>
  String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeRowHeaders = (row) => {
  const normalizedRow = {};

  Object.entries(row).forEach(([key, value]) => {
    normalizedRow[normalizeHeader(key)] = value;
  });

  return normalizedRow;
};

const parsePrice = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value ?? "")
    .replace(/\s/g, "")
    .replace(/[^0-9-]/g, "");

  const price = Number(normalized);
  return Number.isFinite(price) ? price : 0;
};

export const exportAssetsToExcel = (assets) => {
  const data = assets.map((asset) => ({
    "Mã tài sản": asset.code || "",
    "Tên tài sản": asset.name || "",
    "Công ty": asset.company || "",
    "Người sử dụng": asset.user || "",
    "Giá tiền": Number(asset.price) || 0,
    "Ghi chú": asset.note || "",
    "Địa chỉ IP": asset.ipAddress || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(file, "DanhSachTaiSan.xlsx");
};

export const importAssetsFromExcel = (file, callback) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Vui lòng chọn file Excel."));
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          throw new Error("File Excel không có sheet dữ liệu.");
        }

        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: true,
        });

        if (rows.length === 0) {
          throw new Error("File Excel không có dữ liệu.");
        }

        const invalidRows = [];
        const duplicateInFile = [];
        const seenCodes = new Set();
        const seenIps = new Set();
        const assets = [];

        rows.forEach((rawRow, index) => {
          const row = normalizeRowHeaders(rawRow);
          const excelRow = index + 2;

          const code = String(row["Mã tài sản"] || "").trim();
          const name = String(row["Tên tài sản"] || "").trim();
          const company = String(row["Công ty"] || "").trim();
          const user = String(row["Người sử dụng"] || "").trim();
          const note = String(row["Ghi chú"] || "").trim();
          const ipAddress = normalizeIpAddress(
            row["Địa chỉ IP"] || row.IP || ""
          );

          if (!code || !name) {
            invalidRows.push({
              row: excelRow,
              code,
              reason: !code
                ? "Thiếu mã tài sản"
                : "Thiếu tên tài sản",
            });
            return;
          }

          const normalizedCode = normalizeAssetCode(code);
          const normalizedIp = normalizeIpAddress(ipAddress);

          if (seenCodes.has(normalizedCode)) {
            duplicateInFile.push({
              row: excelRow,
              code,
              reason: "Trùng mã tài sản trong file Excel",
            });
            return;
          }

          if (normalizedIp && seenIps.has(normalizedIp)) {
            duplicateInFile.push({
              row: excelRow,
              code,
              reason: "Trùng địa chỉ IP trong file Excel",
            });
            return;
          }

          seenCodes.add(normalizedCode);
          if (normalizedIp) seenIps.add(normalizedIp);

          assets.push({
            id: crypto.randomUUID(),
            code,
            name,
            company,
            user,
            price: parsePrice(row["Giá tiền"]),
            note,
            ipAddress: normalizedIp,
            status: user ? "Đang cấp phát" : "Kho",
            excelRow,
          });
        });

        if (assets.length === 0) {
          throw new Error("Không có tài sản hợp lệ để import.");
        }

        const excelResult = {
          totalRows: rows.length,
          validRows: assets.length,
          skippedInFile:
            invalidRows.length + duplicateInFile.length,
          invalidRows,
          duplicateInFile,
        };

        await callback(assets, excelResult);
        resolve(excelResult);
      } catch (error) {
        console.error("Lỗi import Excel:", error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Không thể đọc file Excel đã chọn."));
    };

    reader.readAsArrayBuffer(file);
  });
