import { env, sleepSync } from "bun";
import express from "express";
import { exec } from "child_process";

const PORT = env.PORT ?? 8083;

const SERVICE_1_ADDRESS = env.SERVICE_1_ADDRESS ?? "10.0.1.3:4001";
const MONITOR_ADDRESS = env.MONITOR_ADDRESS ?? "10.0.1.5:8087";
const MQ_ADDRESS = env.MQ_ADDRESS ?? "10.1.2.2:5672";

await waitForServices();

startServer();

function startServer() {
  const app = express();
  app.use(express.json());

  app.get("/healthcheck", (_, res) => {
    res.status(200);
    res.send("OK");
  });

  app.get("/messages", async (_, res) => {
    try {
      const messageResponse = await fetch(
        `http://${SERVICE_1_ADDRESS}/messages`
      );
      const text = await messageResponse.text();
      res.type("text/plain; charset=utf-8");
      res.send(text);
    } catch (e) {
      res.status(500);
      res.send("Internal server error");
    }
  });

  app.listen(PORT);
  console.log("Server is running on port", PORT);

  return app;
}

async function waitForServices() {
  const promises = [
    waitForService(SERVICE_1_ADDRESS),
    waitForService(MONITOR_ADDRESS),
    waitForService(MQ_ADDRESS),
  ];

  await Promise.all(promises);
}

async function waitForService(service: string) {
  console.log("Waiting for service to be ready...");
  exec(`./wait-for-it/wait-for-it.sh ${service}`);
  console.log("Service is ready!");
  sleepSync(1000);
}
