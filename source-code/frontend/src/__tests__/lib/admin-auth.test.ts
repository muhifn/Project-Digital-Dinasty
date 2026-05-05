import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the auth function for admin-auth tests
const mockAuth = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("next/navigation", () => ({
	redirect: (...args: unknown[]) => {
		mockRedirect(...args);
		throw new Error("NEXT_REDIRECT"); // simulate redirect throwing
	},
}));

// Import after mocks
const { requireAdminSession, isAdminSession } = await import(
  "@/lib/admin-auth"
);

describe("requireAdminSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns session when user is admin", async () => {
    const session = { user: { id: "1", role: "admin", email: "admin@planetmotorbmw.com" } };
    mockAuth.mockResolvedValueOnce(session);
    const result = await requireAdminSession();
    expect(result).toEqual(session);
  });

  it("redirects to login when no session", async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(requireAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login")
    );
  });

  it("redirects to error when role is not admin", async () => {
    const session = { user: { id: "2", role: "customer", email: "user@test.com" } };
    mockAuth.mockResolvedValueOnce(session);
    await expect(requireAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/auth/error")
    );
  });

  it("uses custom callbackUrl", async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(
      requireAdminSession({ callbackUrl: "/admin/products" })
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("callbackUrl=%2Fadmin%2Fproducts")
    );
  });
});

describe("isAdminSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for admin session", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: "1", role: "admin" },
    });
    const result = await isAdminSession();
    expect(result).toBe(true);
  });

  it("returns false for customer session", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: "2", role: "customer" },
    });
    const result = await isAdminSession();
    expect(result).toBe(false);
  });

  it("returns false when no session", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const result = await isAdminSession();
    expect(result).toBe(false);
  });
});
