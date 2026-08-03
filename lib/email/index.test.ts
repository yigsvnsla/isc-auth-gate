import { expect, test, describe } from "bun:test";

import { email } from "./index";

describe("Email sending", () => {
  test("sends the welcome email", async () => {
    const response = await email.send({
      from: "Acme <hello@acme.com>",
      to: "user@example.com",
      subject: "Fallback",
      text: "Hello",
    });

    console.log("Email response:", response);

    // expect(response.provider).toBe("backup");
    expect(response.accepted).toHaveLength(1);
  });
});
