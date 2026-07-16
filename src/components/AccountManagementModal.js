import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAccounts,
  toggleAccountStatus,
  updateAccountCompany,
} from "../accountService";

import ChangePasswordForm from "./ChangePasswordForm";

import {
  showConfirm,
  showError,
  showToast,
} from "../utils/alert";

const COMPANIES = [
  "HXG",
  "HOMIE",
  "GDB",
  "Vietfurniture",
  "NEW",
];

function AccountManagementModal({
  currentUserUid,
  onClose,
}) {
  const [accounts, setAccounts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchText, setSearchText] =
    useState("");

  const [companyFilter, setCompanyFilter] =
    useState("");

  const [
    passwordAccount,
    setPasswordAccount,
  ] = useState(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const result = await getAccounts();

      setAccounts(result.users || []);
    } catch (error) {
      console.error(
        "Lỗi tải tài khoản:",
        error
      );

      await showError(
        "Không thể tải tài khoản",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    const keyword = searchText
      .trim()
      .toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !keyword ||
        account.name
          ?.toLowerCase()
          .includes(keyword) ||
        account.email
          ?.toLowerCase()
          .includes(keyword);

      const matchesCompany =
        !companyFilter ||
        account.company === companyFilter;

      return matchesSearch && matchesCompany;
    });
  }, [
    accounts,
    searchText,
    companyFilter,
  ]);

  const handleToggleStatus = async (
    account
  ) => {
    const nextEnabled = !account.enabled;

    const result = await showConfirm({
      title: nextEnabled
        ? "Mở khóa tài khoản"
        : "Khóa tài khoản",
      text: nextEnabled
        ? `Cho phép ${account.email} đăng nhập lại?`
        : `${account.email} sẽ không thể đăng nhập.`,
      confirmText: nextEnabled
        ? "Mở khóa"
        : "Khóa tài khoản",
      cancelText: "Hủy",
      icon: "warning",
      danger: !nextEnabled,
    });

    if (!result.isConfirmed) return;

    try {
      await toggleAccountStatus(
        account.uid,
        nextEnabled
      );

      showToast(
        "success",
        nextEnabled
          ? "Đã mở khóa tài khoản"
          : "Đã khóa tài khoản"
      );

      await loadAccounts();
    } catch (error) {
      await showError(
        "Không thể cập nhật tài khoản",
        error.message
      );
    }
  };

  const handleCompanyChange = async (
    account,
    company
  ) => {
    try {
      await updateAccountCompany(
        account.uid,
        company
      );

      showToast(
        "success",
        "Đã cập nhật công ty"
      );

      await loadAccounts();
    } catch (error) {
      await showError(
        "Không thể đổi công ty",
        error.message
      );
    }
  };

  return (
    <div
      className="account-management-overlay"
      onClick={onClose}
    >
      <div
        className="account-management-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="account-management-header">
          <div>
            <h2>Quản lý tài khoản</h2>

            <p>
              {accounts.length} tài khoản
            </p>
          </div>

          <button
            className="account-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="account-management-toolbar">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
          />

          <select
            value={companyFilter}
            onChange={(event) =>
              setCompanyFilter(
                event.target.value
              )
            }
          >
            <option value="">
              Tất cả công ty
            </option>

            {COMPANIES.map((company) => (
              <option
                key={company}
                value={company}
              >
                {company}
              </option>
            ))}
          </select>
        </div>

        <div className="account-table-wrapper">
          {loading ? (
            <div className="account-loading">
              Đang tải tài khoản...
            </div>
          ) : (
            <table className="account-table">
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Công ty</th>
                  <th>Quyền</th>
                  <th>Trạng thái</th>
                  <th>Đăng nhập cuối</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredAccounts.map(
                  (account) => (
                    <tr key={account.uid}>
                      <td>
                        <div className="account-identity">
                          <div className="account-avatar">
                            {(
                              account.name ||
                              account.email ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {account.name ||
                                "Chưa có tên"}
                            </strong>

                            <span>
                              {account.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {account.role ===
                        "admin" ? (
                          <span>
                            Toàn hệ thống
                          </span>
                        ) : (
                          <select
                            className="account-company-select"
                            value={
                              account.company ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              handleCompanyChange(
                                account,
                                event.target
                                  .value
                              )
                            }
                          >
                            {COMPANIES.map(
                              (company) => (
                                <option
                                  key={
                                    company
                                  }
                                  value={
                                    company
                                  }
                                >
                                  {company}
                                </option>
                              )
                            )}
                          </select>
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            account.role ===
                            "admin"
                              ? "account-role admin"
                              : "account-role user"
                          }
                        >
                          {account.role ===
                          "admin"
                            ? "Admin"
                            : "Nhân viên"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            account.enabled
                              ? "account-status active"
                              : "account-status locked"
                          }
                        >
                          {account.enabled
                            ? "Hoạt động"
                            : "Đã khóa"}
                        </span>
                      </td>

                      <td>
                        {account.lastLoginAt
                          ? new Date(
                              account.lastLoginAt
                            ).toLocaleString(
                              "vi-VN"
                            )
                          : "Chưa đăng nhập"}
                      </td>

                      <td>
                        <div className="account-actions">
                          <button
                            className="account-password-btn"
                            onClick={() =>
                              setPasswordAccount(
                                account
                              )
                            }
                          >
                            Đổi mật khẩu
                          </button>

                          {account.uid !==
                            currentUserUid && (
                            <button
                              className={
                                account.enabled
                                  ? "account-lock-btn"
                                  : "account-unlock-btn"
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  account
                                )
                              }
                            >
                              {account.enabled
                                ? "Khóa"
                                : "Mở khóa"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>

        {passwordAccount && (
          <div
            className="password-submodal-overlay"
            onClick={() =>
              setPasswordAccount(null)
            }
          >
            <div
              className="password-submodal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="password-submodal-header">
                <h3>Đổi mật khẩu</h3>

                <button
                  onClick={() =>
                    setPasswordAccount(null)
                  }
                >
                  ×
                </button>
              </div>

              <ChangePasswordForm
                account={passwordAccount}
                onSuccess={() => {
                  setPasswordAccount(null);
                  loadAccounts();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountManagementModal;