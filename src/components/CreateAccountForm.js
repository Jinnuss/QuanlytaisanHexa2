import React, { useState } from "react";
import {
    createEmployeeAccount,
} from "../accountService";
import {
    closeAlert,
    showError,
    showLoading,
    showSuccess,
} from "../utils/alert";
const COMPANIES = [
    "HXG",
    "HOMIE",
    "GDB",
    "Vietfurniture",
    "NEW",
];

const initialForm = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
};

function CreateAccountForm({
    onSuccess,
}) {
    const [form, setForm] =
        useState(initialForm);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleChange = (event) => {
        setForm((previous) => ({
            ...previous,
            [event.target.name]:
                event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            form.password !==
            form.confirmPassword
        ) {
            setError(
                "Mật khẩu xác nhận không khớp."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            showLoading("Đang tạo tài khoản...");

            await createEmployeeAccount({
                name: form.name,
                email: form.email,
                password: form.password,
                company: form.company,
            });

            closeAlert();

            await showSuccess(
                "Tạo tài khoản thành công",
                `${form.email} đã có thể đăng nhập hệ thống.`
            );

            setForm(initialForm);

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            closeAlert();

            setError(err.message);

            await showError(
                "Không thể tạo tài khoản",
                err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="account-form"
            onSubmit={handleSubmit}
        >
            <div className="account-form-grid">
                <div className="account-field">
                    <label htmlFor="account-name">
                        Họ tên
                    </label>

                    <input
                        id="account-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Nhập họ tên nhân viên"
                        required
                    />
                </div>

                <div className="account-field">
                    <label htmlFor="account-email">
                        Email đăng nhập
                    </label>

                    <input
                        id="account-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="name@hexagroup.vn"
                        required
                    />
                </div>

                <div className="account-field">
                    <label htmlFor="account-company">
                        Công ty
                    </label>

                    <select
                        id="account-company"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            -- Chọn công ty --
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

                <div className="account-field">
                    <label htmlFor="account-password">
                        Mật khẩu
                    </label>

                    <input
                        id="account-password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Tối thiểu 6 ký tự"
                        minLength={6}
                        required
                    />
                </div>

                <div className="account-field account-field-full">
                    <label htmlFor="account-confirm-password">
                        Xác nhận mật khẩu
                    </label>

                    <input
                        id="account-confirm-password"
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        minLength={6}
                        required
                    />
                </div>
            </div>

            {error && (
                <div className="account-error">
                    {error}
                </div>
            )}

            <div className="account-form-actions">
                <button
                    type="submit"
                    className="account-submit-btn"
                    disabled={loading}
                >
                    {loading
                        ? "Đang tạo tài khoản..."
                        : "Tạo tài khoản"}
                </button>
            </div>
        </form>
    );
}

export default CreateAccountForm;