import { env, sleepSync } from "bun";
import { test, expect, beforeAll } from "bun:test";
import { execSync } from "child_process";

const API = env.API_ADDRESS ?? ("localhost:8087" as const);

beforeAll(() => {
  console.log("API_ADDRESS:", API);
  console.log("Waiting for API gateway to be ready...");
  execSync(`./wait-for-it/wait-for-it.sh ${API} -t 60`);
  console.log("API is ready!");
  sleepSync(3000);
});

test("should hello world", () => {
  const hello = "hello world";
  expect(hello).toBe("hello world");
});

test("API should respond with 200 to healthcheck", async () => {
  const res = await fetch(`http://${API}/healthcheck`);
  expect(res.status).toBe(200);
});

test("Messages should return with a text/plain content type", async () => {
  const res = await fetch(`http://${API}/messages`);
  expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
});

test("Messages should return with a 200 status code", async () => {
  const res = await fetch(`http://${API}/messages`);
  expect(res.status).toBe(200);
});

test("Messages should contain multiple lines of text", async () => {
  const res = await fetch(`http://${API}/messages`);
  const text = await res.text();
  console.log(text);
  expect(text.split("\n").length).toBeGreaterThan(1);
});
