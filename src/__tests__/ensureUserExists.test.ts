import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Prisma ──────────────────────────────────────────────────────────────
// vi.mock() is hoisted to the top of the file, so mock functions must be
// defined with vi.hoisted() to be accessible inside the factory.

const { mockFindUnique, mockCreate, mockTransaction } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
    $transaction: mockTransaction,
  },
}));

import { ensureUserExists } from "@/lib/ensure-user-exists";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const SUPABASE_ID = "supabase-uuid-001";
const OLD_ID = "old-prisma-uuid-999";
const EMAIL = "alice@example.com";
const NAME = "Alice";

const existingUser = { id: SUPABASE_ID, email: EMAIL, name: NAME };
const legacyUser = { id: OLD_ID, email: EMAIL, name: "Alice (legacy)" };

// ─────────────────────────────────────────────────────────────────────────────

describe("ensureUserExists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Chemin rapide ───────────────────────────────────────────────────────────

  it("retourne l'utilisateur existant sans appeler $transaction ni create", async () => {
    mockFindUnique.mockResolvedValueOnce(existingUser); // findUnique({ where: { id } })

    const result = await ensureUserExists(SUPABASE_ID, EMAIL, NAME);

    expect(result).toEqual(existingUser);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("ne fait qu'un seul findUnique quand l'UUID est correct", async () => {
    mockFindUnique.mockResolvedValueOnce(existingUser);

    await ensureUserExists(SUPABASE_ID, EMAIL, NAME);

    expect(mockFindUnique).toHaveBeenCalledTimes(1);
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: SUPABASE_ID } });
  });

  // ── Chemin lent : migration UUID ────────────────────────────────────────────

  it("appelle $transaction quand l'email existe sous un autre UUID", async () => {
    mockFindUnique
      .mockResolvedValueOnce(null)        // by id  → not found
      .mockResolvedValueOnce(legacyUser); // by email → found (legacy)

    const newUser = { id: SUPABASE_ID, email: EMAIL, name: NAME };
    mockTransaction.mockResolvedValueOnce(newUser);

    const result = await ensureUserExists(SUPABASE_ID, EMAIL, NAME);

    expect(result).toEqual(newUser);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("la transaction reçoit bien une fonction (interactive transaction)", async () => {
    mockFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(legacyUser);

    mockTransaction.mockResolvedValueOnce({ id: SUPABASE_ID, email: EMAIL, name: NAME });

    await ensureUserExists(SUPABASE_ID, EMAIL, NAME);

    const txArg = mockTransaction.mock.calls[0][0];
    expect(typeof txArg).toBe("function");
  });

  it("exécute les 4 étapes dans le bon ordre à l'intérieur de la transaction", async () => {
    mockFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: OLD_ID, email: EMAIL, name: null });

    const newUser = { id: SUPABASE_ID, email: EMAIL, name: NAME };
    const calls: string[] = [];

    mockTransaction.mockImplementationOnce(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        user: {
          update: vi.fn().mockImplementation(() => { calls.push("rename"); return Promise.resolve({}); }),
          create: vi.fn().mockImplementation(() => { calls.push("create"); return Promise.resolve(newUser); }),
          delete: vi.fn().mockImplementation(() => { calls.push("delete"); return Promise.resolve({}); }),
        },
        projectMember: { updateMany: vi.fn().mockResolvedValue({}) },
        project: { updateMany: vi.fn().mockResolvedValue({}) },
        story: { updateMany: vi.fn().mockResolvedValue({}) },
        task: { updateMany: vi.fn().mockResolvedValue({}) },
        comment: { updateMany: vi.fn().mockResolvedValue({}) },
        taskComment: { updateMany: vi.fn().mockResolvedValue({}) },
        notification: { updateMany: vi.fn().mockResolvedValue({}) },
        invitation: { updateMany: vi.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });

    const result = await ensureUserExists(SUPABASE_ID, EMAIL, NAME);

    expect(result).toEqual(newUser);
    // rename must happen before create, create before delete
    expect(calls[0]).toBe("rename");
    expect(calls[1]).toBe("create");
    expect(calls[calls.length - 1]).toBe("delete");
  });

  it("tombe en fallback sur email.split('@')[0] si pas de nom ni de nom legacy", async () => {
    mockFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: OLD_ID, email: EMAIL, name: null });

    let capturedName: string | undefined;

    mockTransaction.mockImplementationOnce(async (fn: (tx: unknown) => Promise<unknown>) => {
      const createdUser = { id: SUPABASE_ID, email: EMAIL, name: "alice" };
      const tx = {
        user: {
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockImplementation(({ data }: { data: { name: string } }) => {
            capturedName = data.name;
            return Promise.resolve(createdUser);
          }),
          delete: vi.fn().mockResolvedValue({}),
        },
        projectMember: { updateMany: vi.fn().mockResolvedValue({}) },
        project: { updateMany: vi.fn().mockResolvedValue({}) },
        story: { updateMany: vi.fn().mockResolvedValue({}) },
        task: { updateMany: vi.fn().mockResolvedValue({}) },
        comment: { updateMany: vi.fn().mockResolvedValue({}) },
        taskComment: { updateMany: vi.fn().mockResolvedValue({}) },
        notification: { updateMany: vi.fn().mockResolvedValue({}) },
        invitation: { updateMany: vi.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });

    await ensureUserExists(SUPABASE_ID, EMAIL, undefined); // no name param

    expect(capturedName).toBe("alice"); // email.split("@")[0]
  });

  // ── Chemin création simple ──────────────────────────────────────────────────

  it("crée un nouvel utilisateur quand aucun n'existe", async () => {
    mockFindUnique
      .mockResolvedValueOnce(null) // by id
      .mockResolvedValueOnce(null); // by email

    const createdUser = { id: SUPABASE_ID, email: EMAIL, name: NAME };
    mockCreate.mockResolvedValueOnce(createdUser);

    const result = await ensureUserExists(SUPABASE_ID, EMAIL, NAME);

    expect(result).toEqual(createdUser);
    expect(mockCreate).toHaveBeenCalledWith({
      data: { id: SUPABASE_ID, email: EMAIL, name: NAME },
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("utilise email.split('@')[0] comme nom par défaut à la création", async () => {
    mockFindUnique.mockResolvedValue(null);

    const createdUser = { id: SUPABASE_ID, email: EMAIL, name: "alice" };
    mockCreate.mockResolvedValueOnce(createdUser);

    await ensureUserExists(SUPABASE_ID, EMAIL, undefined);

    expect(mockCreate).toHaveBeenCalledWith({
      data: { id: SUPABASE_ID, email: EMAIL, name: "alice" },
    });
  });
});
