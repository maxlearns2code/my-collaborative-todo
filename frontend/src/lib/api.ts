export async function apiRequest(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body: unknown,
  token: string
) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) throw new Error("NEXT_PUBLIC_API_URL not set");
  const res = await fetch(`${apiBase}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}
