import { auth } from "./firebase";

async function getAuthorizationHeader() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error(
      "Bạn chưa đăng nhập."
    );
  }

  const idToken =
    await currentUser.getIdToken();

  return {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  };
}

async function parseResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();

    console.error("API trả về không phải JSON:", text);

    throw new Error(
      "API quản lý tài khoản không hoạt động đúng."
    );
  }

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(
      result.message || "Yêu cầu không thành công."
    );

    error.status = response.status;
    error.code = result.errorCode;

    throw error;
  }

  return result;
}

export async function createEmployeeAccount(
  data
) {
  const headers =
    await getAuthorizationHeader();

  const response = await fetch(
    "/api/admin/create-user",
    {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    }
  );

  return parseResponse(response);
}

export async function changeEmployeePassword(
  uid,
  email,
  newPassword
) {
  const headers =
    await getAuthorizationHeader();

  const response = await fetch(
    "/api/admin/change-password",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        uid,
        email,
        newPassword,
      }),
    }
  );

  return parseResponse(response);
}
export async function getAccounts() {
  const headers =
    await getAuthorizationHeader();

  const response = await fetch(
    "/api/admin/list-users",
    {
      method: "GET",
      headers,
    }
  );

  return parseResponse(response);
}

export async function toggleAccountStatus(
  uid,
  enabled
) {
  const headers =
    await getAuthorizationHeader();

  const response = await fetch(
    "/api/admin/toggle-user-status",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        uid,
        enabled,
      }),
    }
  );

  return parseResponse(response);
}

export async function updateAccountCompany(
  uid,
  company
) {
  const headers =
    await getAuthorizationHeader();

  const response = await fetch(
    "/api/admin/update-user-company",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        uid,
        company,
      }),
    }
  );

  return parseResponse(response);
}