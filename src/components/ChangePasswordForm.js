import React, { useState } from "react";
import {
  changeEmployeePassword,
} from "../accountService";
import { showSuccess } from "../utils/alert";

function ChangePasswordForm({
  account,
  onSuccess,
  onClose
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
    console.log("CLICK CHANGE PASSWORD");

    console.log("Before changeEmployeePassword");

    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Hai mật khẩu không khớp.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Đang đổi mật khẩu cho:", {
        uid: account.uid,
        email: account.email,
      });

      const result = await changeEmployeePassword(
        account.uid,
        account.email,
        newPassword
      );
      if (
        result.updatedEmail?.toLowerCase() !==
        account.email?.toLowerCase()
      ) {
        throw new Error(
          "API đã cập nhật nhầm tài khoản."
        );
      }

      console.log("API đổi mật khẩu trả về:", result);

      await showSuccess(
        "Đổi mật khẩu thành công",
        `Mật khẩu của ${account.email} đã được cập nhật.`
      );

      setNewPassword("");
      setConfirmPassword("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);

      setError(
        error.message || "Không thể đổi mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (

    <div
      className="password-modal-overlay"
      onClick={onClose}
    >
      <form
        className="password-modal"
        onSubmit={handleSubmit}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="password-modal-header">
          <div className="password-title-group">
            <div className="password-icon">
              🔑
            </div>

            <div>
              <h2>Đổi mật khẩu</h2>
              <p>
                Đặt mật khẩu đăng nhập mới cho nhân viên
              </p>
            </div>
          </div>

          <button
            type="button"
            className="password-close-button"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="password-modal-body">
          <div className="password-account-card">
            <span>Tài khoản</span>
            <strong>{account.email}</strong>
          </div>

          <div className="password-field">
            <label htmlFor="new-password">
              Mật khẩu mới
            </label>

            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="password-field">
            <label htmlFor="confirm-new-password">
              Xác nhận mật khẩu mới
            </label>

            <input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="password-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="password-modal-footer">
          <button
            type="button"
            className="password-cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            type="submit"
            className="password-submit-button"
            disabled={loading}
          >
            {loading
              ? "Đang cập nhật..."
              : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </div>

  );
}

export default ChangePasswordForm;