import React, { useState } from "react";
import { login } from "../authService";

function Login({ authError = "" }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const credential = await login(
                email.trim(),
                password
            );

            console.log("Đăng nhập thành công:", {
                uid: credential.user.uid,
                email: credential.user.email,
            });
        } catch (error) {
            console.error("LOGIN_ERROR:", {
                code: error.code,
                message: error.message,
            });

            setError("Email hoặc mật khẩu không đúng.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <div className="login-brand-icon">
                        ⬢
                    </div>

                    <div>
                        <h1>HEXAGROUP</h1>
                    </div>
                </div>

                <div className="login-heading">
                    <h2>Đăng nhập</h2>
                    <p>
                        Sử dụng tài khoản được Admin cấp
                    </p>
                </div>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="login-field">
                        <label htmlFor="login-email">
                            Email
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            placeholder="name@hexagroup.vn"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-password">
                            Mật khẩu
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {(error || authError) && (
                        <div className="login-error">
                            {error || authError}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-submit-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Đang đăng nhập..."
                            : "Đăng nhập"}
                    </button>
                </form>

                <div className="login-footer">
                    Chỉ dành cho tài khoản nội bộ HEXAGROUP
                </div>
            </div>
        </div>
    );
}

export default Login;