const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is missing");
}

export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function logout() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/logout`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  try {
    return await res.json();
  } catch {
    return { result: res.ok };
  }
}
