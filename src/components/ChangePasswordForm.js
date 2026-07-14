import React, { useState } from "react";
import {
  changeEmployeePassword,
} from "../accountService";

function ChangePasswordForm({
  account,
  onSuccess,
}) {
  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        "Mật khẩu xác nhận không khớp."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await changeEmployeePassword(
        account.uid,
        newPassword
      );

      alert(
        "Đổi mật khẩu thành công."
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="account-form"
      onSubmit={handleSubmit}
    >
      <p>
        Tài khoản:{" "}
        <strong>
          {account.email}
        </strong>
      </p>

      <div className="form-group">
        <label>Mật khẩu mới</label>

        <input
          type="password"
          value={newPassword}
          onChange={(event) =>
            setNewPassword(
              event.target.value
            )
          }
          minLength={6}
          required
        />
      </div>

      <div className="form-group">
        <label>
          Xác nhận mật khẩu mới
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(
              event.target.value
            )
          }
          minLength={6}
          required
        />
      </div>

      {error && (
        <div className="account-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Đang cập nhật..."
          : "Đổi mật khẩu"}
      </button>
    </form>
  );
}

export default ChangePasswordForm;