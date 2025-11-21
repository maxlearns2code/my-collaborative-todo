export async function apiRequest(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body: unknown,
  token: string
) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}
