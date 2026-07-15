import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
    normalizeAssetCode,
    normalizeIpAddress,
} from "./normalize";
export const exportAssetsToExcel = (assets) => {
    const data = assets.map(asset => ({
        "Mã tài sản": asset.code,
        "Tên tài sản": asset.name,
        "Công ty": asset.company,
        "Người sử dụng": asset.user,
        "Giá tiền": asset.price,
        "Ghi chú": asset.note
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Assets");

    const excelBuffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array"
    });

    const file = new Blob([excelBuffer], {
        type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    });

    saveAs(file, "DanhSachTaiSan.xlsx");
};

export const importAssetsFromExcel = (file, callback) => {

    const reader = new FileReader();

    reader.onload = (e) => {

        const data = new Uint8Array(e.target.result);

        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const json = XLSX.utils.sheet_to_json(sheet);

        Object.keys(json[0]).forEach((key) => {
            console.log(`[${key}]`, key.length);
        });
        const assets = json.map(item => ({
            id: crypto.randomUUID(),
            code: item["Mẫ tài sản"] || "",
            name: item["Tên tài sản "] || "",
            company: item["Công ty"] || "",
            user: item["Người sử dụng"] || "",
            price: Number(item["Giá tiền"]) || 0,
            note: item["Ghi chú"] || "",
            ipAddress: normalizeIpAddress(
                item["Địa chỉ IP"] ||
                item["IP"] ||
                ""
            ),
            status: item["Người sử dụng"] ? "Đang cấp phát" : "Kho",
            logs: []
        }));
        const duplicateCodes = new Set();
        const duplicateIps = new Set();

        const seenCodes = new Set();
        const seenIps = new Set();

        assets.forEach((asset) => {
            const code = normalizeAssetCode(
                asset.code
            );

            const ip = normalizeIpAddress(
                asset.ipAddress
            );

            if (seenCodes.has(code)) {
                duplicateCodes.add(code);
            } else {
                seenCodes.add(code);
            }

            if (ip) {
                if (seenIps.has(ip)) {
                    duplicateIps.add(ip);
                } else {
                    seenIps.add(ip);
                }
            }
        });

        if (duplicateCodes.size > 0) {
            throw new Error(
                `File Excel có mã tài sản bị trùng: ${[
                    ...duplicateCodes,
                ].join(", ")}`
            );
        }

        if (duplicateIps.size > 0) {
            throw new Error(
                `File Excel có địa chỉ IP bị trùng: ${[
                    ...duplicateIps,
                ].join(", ")}`
            );
        }

        callback(assets);


    };

    reader.readAsArrayBuffer(file);

};