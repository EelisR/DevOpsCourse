import { env, sleepSync } from "bun";
import { test, expect, beforeAll, beforeEach } from "bun:test";
import { execSync } from "child_process";

const API = env.API_ADDRESS ?? ("localhost:8087" as const);

beforeAll(() => {
  console.log("API_ADDRESS:", API);
  console.log("Waiting for API gateway to be ready...");
  execSync(`./wait-for-it/wait-for-it.sh ${API} -t 60`);
  console.log("API is ready!");
  sleepSync(3000);
});

beforeEach(async () => {
  sleepSync(2000);
});

// Basic test
test("should hello world", () => {
  const hello = "hello world";
  expect(hello).toBe("hello world");
});

// API Running
test("API should respond with 200 to healthcheck", async () => {
  const res = await fetch(`http://${API}/healthcheck`);
  expect(res.status).toBe(200);
});

// Messages endpoint tests
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

// State endpoint tests
test("API should respond with 200 to state", async () => {
  const command = "RUNNING";
  const res = await fetch(`http://${API}/state`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: command,
  });

  const responseState = await res.text();
  expect(res.status).toBe(200);
  expect(responseState).toBe(command);
});

test("API should respond with state RUNNING after INIT", async () => {
  const res = await fetch(`http://${API}/state`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: "INIT",
  });

  const responseState = await res.text();
  expect(res.status).toBe(200);
  expect(responseState).toBe("RUNNING");
});

test("API should respond with state PAUSED after PAUSED", async () => {
  const res = await fetch(`http://${API}/state`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: "PAUSED",
  });

  const responseState = await res.text();
  expect(res.status).toBe(200);
  expect(responseState).toBe("PAUSED");
});

test("API should return current state", async () => {
  const res = await fetch(`http://${API}/state`);
  const responseState = await res.text();
  expect(res.status).toBe(200);
  expect(responseState).toBeString();

  expect(
    ["INIT", "RUNNING", "PAUSED", "SHUTDOWN"].includes(responseState)
  ).toBeTrue();
});

test("API should return the running log", async () => {
  const res = await fetch(`http://${API}/run-log`);
  const log = await res.text();
  expect(res.status).toBe(200);
  expect(log).toBeString();
  expect(log.split("\n").length).toBeGreaterThan(1);
});

test("API should return the MQ statistics", async () => {
  const res = await fetch(`http://${API}/mqstatistics`, {
    headers: {
      "Content-type": "application/json; charset=utf-8",
    },
  });

  const statistics = await res.json();
  expect(res.status).toBe(200);
  expect(statistics).toHaveProperty("overview");
  expect(statistics).toHaveProperty("queues");
});

// This last because it shuts down the API
test("API should not respond anymore after SHUTDOWN", async () => {
  await fetch(`http://${API}/state`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: "SHUTDOWN",
  });

  sleepSync(5000);

  expect(async () => await fetch(`http://${API}/healthcheck`)).toThrow();
});
