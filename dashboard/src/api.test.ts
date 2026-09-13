import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, setCsrf } from "./api";

const dispatchEvent = vi.fn();
const unauthorized = () =>
  new Response(JSON.stringify({ message: "Please sign in again" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => {
  dispatchEvent.mockClear();
  vi.stubGlobal("window", { dispatchEvent });
  setCsrf("old-session-token");
});

afterEach(() => {
  setCsrf("");
  vi.unstubAllGlobals();
});

describe("session expiration responses", () => {
  it("does not expire a new session when an old pending request returns 401", async () => {
    let finish!: (response: Response) => void;
    const fetch = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetch);
    const pending = api("/travels");
    const rejection = expect(pending).rejects.toThrow("Please sign in again");
    expect(fetch).toHaveBeenCalledWith(
      "/api/travels",
      expect.objectContaining({
        credentials: "same-origin",
        headers: expect.objectContaining({
          "X-CSRF-Token": "old-session-token",
        }),
      }),
    );
    setCsrf("new-session-token");
    finish(unauthorized());
    await rejection;
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it("expires the current session when its own authenticated request returns 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(unauthorized()));
    await expect(api("/travels")).rejects.toThrow("Please sign in again");
    expect(dispatchEvent).toHaveBeenCalledOnce();
    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "session-expired" }),
    );
  });

  it("keeps rejected sign-in credentials as a form error without expiring another session", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(unauthorized()));
    await expect(
      api("/auth/login", "POST", { password: "wrong" }),
    ).rejects.toThrow("Please sign in again");
    expect(dispatchEvent).not.toHaveBeenCalled();
  });
});
