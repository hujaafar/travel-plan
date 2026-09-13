let csrf = "";
export const setCsrf = (value: string) => {
  csrf = value;
};
export async function api<T = void>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({
      message: "The service is temporarily unavailable. Please try again.",
    }));
    if (response.status === 401 && !path.includes("login"))
      window.dispatchEvent(new Event("session-expired"));
    throw new Error(data.message || "Request failed");
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
