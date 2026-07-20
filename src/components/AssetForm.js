import React, {
  useEffect,
  useState,
} from "react";

import {
  ASSET_TYPES,
  getAssetTypeFromCode,
} from "../utils/assetType";

const initialForm = {
  firebaseId: "",
  code: "",
  assetType: "",
  name: "",
  company: "HXG",
  user: "",
  price: "",
  note: "",
  status: "Kho",
  ipAddress: "",
  createdDate: "",
};

function AssetForm({
  onSubmit,
  editingAsset,
}) {
  const [form, setForm] =
    useState(initialForm);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (editingAsset) {
      setForm({
        ...initialForm,
        ...editingAsset,

        assetType:
          editingAsset.assetType ||
          getAssetTypeFromCode(
            editingAsset.code
          ),

        ipAddress:
          editingAsset.ipAddress || "",

        createdDate:
          editingAsset.createdDate || "",
      });

      return;
    }

    setForm(initialForm);
  }, [editingAsset]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previousForm) => {
      const nextForm = {
        ...previousForm,
        [name]: value,
      };

      /*
       * Khi người dùng nhập mã tài sản,
       * loại tài sản sẽ tự động thay đổi.
       *
       * HXGPC...  → PC
       * HXGLT...  → LAPTOP
       * HXGLPK... → LPK
       */
      if (name === "code") {
        const detectedType =
          getAssetTypeFromCode(value);

        if (detectedType) {
          nextForm.assetType =
            detectedType;
        }
      }

      /*
       * Nếu người dùng nhập người sử dụng,
       * tự chuyển trạng thái sang đang cấp phát.
       */
      if (name === "user") {
        nextForm.status =
          value.trim()
            ? "Đang cấp phát"
            : "Kho";
      }

      return nextForm;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const detectedType =
      getAssetTypeFromCode(form.code);

    const submittedData = {
      ...form,

      code: form.code
        .trim()
        .toUpperCase(),

      assetType:
        form.assetType ||
        detectedType,

      name: form.name.trim(),
      company: form.company.trim(),
      user: form.user.trim(),
      note: form.note.trim(),
      ipAddress:
        form.ipAddress.trim(),

      price:
        Number(form.price) || 0,
    };

    try {
      setSubmitting(true);

      await onSubmit(submittedData);

      if (!editingAsset) {
        setForm(initialForm);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="asset-form"
      onSubmit={handleSubmit}
    >
      <div className="asset-form-header">
        <div className="asset-form-icon">
          {editingAsset ? "✏️" : "➕"}
        </div>

        <div>
          <h3>
            {editingAsset
              ? "Cập nhật tài sản"
              : "Thông tin tài sản"}
          </h3>

          <p>
            Nhập đầy đủ thông tin tài sản
            bên dưới.
          </p>
        </div>
      </div>

      <div className="asset-form-grid">
        <div className="form-field form-field-wide">
          <label htmlFor="code">
            Mã tài sản
            <span className="required-mark">
              *
            </span>
          </label>

          <input
            id="code"
            name="code"
            placeholder="Ví dụ: HXGPC0925001"
            value={form.code}
            onChange={handleChange}
            autoComplete="off"
            required
          />

          <small>
            Loại tài sản sẽ tự nhận diện
            theo mã.
          </small>
        </div>

        <div className="form-field">
          <label htmlFor="assetType">
            Loại tài sản
            <span className="required-mark">
              *
            </span>
          </label>

          <select
            id="assetType"
            name="assetType"
            value={form.assetType}
            onChange={handleChange}
            required
          >
            <option value="">
              Chọn loại tài sản
            </option>

            {ASSET_TYPES.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type === "PC" &&
                  "🖥 PC"}

                {type === "LAPTOP" &&
                  "💻 LAPTOP"}

                {type === "LPK" &&
                  "⌨ LPK"}
                {type === "MH" &&
                  "MÀN HÌNH"}
              </option>
            ))}
          </select>

          {form.assetType && (
            <small className="detected-type">
              Đã nhận diện:{" "}
              <strong>
                {form.assetType}
              </strong>
            </small>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="company">
            Công ty
            <span className="required-mark">
              *
            </span>
          </label>

          <select
            id="company"
            name="company"
            value={form.company}
            onChange={handleChange}
            required
          >
            <option value="">
              Chọn công ty
            </option>

            <option value="HXG">
              HXG
            </option>

            <option value="HOMIE">
              HOMIE
            </option>

            <option value="GDB">
              GDB
            </option>

            <option value="Vietfurniture">
              Vietfurniture
            </option>

            <option value="NEW">
              NEW
            </option>
          </select>
        </div>

        <div className="form-field form-field-wide">
          <label htmlFor="name">
            Tên tài sản
            <span className="required-mark">
              *
            </span>
          </label>

          <input
            id="name"
            name="name"
            placeholder="Ví dụ: Máy tính để bàn Dell"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="user">
            Người sử dụng
          </label>

          <input
            id="user"
            name="user"
            placeholder="Chưa cấp phát"
            value={form.user}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="status">
            Trạng thái
          </label>

          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Kho">
              Kho
            </option>

            <option value="Đang cấp phát">
              Đang cấp phát
            </option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="ipAddress">
            Địa chỉ IP
          </label>

          <input
            id="ipAddress"
            name="ipAddress"
            placeholder="192.168.1.100"
            value={form.ipAddress}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="price">
            Giá tiền
          </label>

          <input
            id="price"
            name="price"
            type="number"
            min="0"
            placeholder="0"
            value={form.price}
            onChange={handleChange}
          />
        </div>

        <div className="form-field form-field-full">
          <label htmlFor="note">
            Ghi chú
          </label>

          <textarea
            id="note"
            name="note"
            rows="4"
            placeholder="Nhập thông tin ghi chú..."
            value={form.note}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="asset-form-actions">
        <button
          type="submit"
          className="save-asset-btn"
          disabled={submitting}
        >
          {submitting
            ? "Đang lưu..."
            : editingAsset
              ? "✓ Cập nhật tài sản"
              : "＋ Thêm tài sản"}
        </button>
      </div>
    </form>
  );
}

export default AssetForm;