import { test, expect } from "bun:test";

test("should hello world", () => {
  const hello = "hello world";
  expect(hello).toBe("hello world");
});
