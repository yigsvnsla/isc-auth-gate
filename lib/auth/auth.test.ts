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
});

describe("Auth server", async () => {
  // const ctx = await auth.$context;
  // const testUtils = ctx.test;
  // test("create oauth client", async () => {
  //   const oauthClient = testUtils.createOauthClient();
  //   const oauthClientCreated = await testUtils.saveOauthClient(oauthClient);
  //   await testUtils.deleteOauthClient(oauthClientCreated.id);
  //   expect(oauthClientCreated).toBeDefined();
  // });
});
