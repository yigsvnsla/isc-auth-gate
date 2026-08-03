import { describe, test, expect } from "bun:test";
import { auth } from "./auth";

describe("Auth server", async () => {
  const ctx = await auth.$context;
  const testUtils = ctx.test;

  test("create user defined", async () => {
    const user = testUtils.createUser();
    const userCreated = await testUtils.saveUser(user);
    await testUtils.deleteUser(userCreated.id);
    expect(userCreated).toBeDefined();
  });

  test("sends verification email", async () => {
    const userCreated = testUtils.createUser({ emailVerified: false });

    expect(userCreated).toBeDefined();
    expect(userCreated.emailVerified).toBe(false);
  });
});
