import React, { useEffect, useState } from "react";

function AssetForm({ onSubmit, editingAsset }) {
  const [form, setForm] = useState({
    firebaseId: "",
    code: "",
    name: "",
    company: "",
    user: "",
    price: "",
    note: "",
    status: "Kho",
  });

  useEffect(() => {
    if (editingAsset) {
      setForm(editingAsset);
    }
  }, [editingAsset]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(form);

    setForm({
      firebaseId: "",
      code: "",
      name: "",
      company: "",
      user: "",
      price: "",
      note: "",
      status: "Kho",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input
        name="code"
        placeholder="Mã tài sản"
        value={form.code}
        onChange={handleChange}
        required
      />

      <input
        name="name"
        placeholder="Tên tài sản"
        value={form.name}
        onChange={handleChange}
        required
      />

      <input
        name="company"
        placeholder="Công ty"
        value={form.company}
        onChange={handleChange}
      />

      <input
        name="user"
        placeholder="Người sử dụng"
        value={form.user}
        onChange={handleChange}
      />

      <input
        name="price"
        type="number"
        placeholder="Giá tiền"
        value={form.price}
        onChange={handleChange}
      />

      <textarea
        name="note"
        placeholder="Ghi chú"
        value={form.note}
        onChange={handleChange}
      />

      <select
        name="status"
        value={form.status}
        onChange={handleChange}
      >
        <option>Kho</option>
        <option>Đang cấp phát</option>
      </select>

      <button type="submit">
        {editingAsset ? "Cập nhật" : "Thêm"}
      </button>
    </form>
  );
}

export default AssetForm;