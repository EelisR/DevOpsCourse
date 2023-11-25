import { env, sleepSync } from "bun";
import express from "express";
import { execSync } from "child_process";

const PORT = env.PORT ?? 8083;

const SERVICE_1_ADDRESS = env.SERVICE_1_ADDRESS ?? "10.0.1.3:4001";
const SERVICE_2_ADDRESS = env.SERVICE_2_ADDRESS ?? "10.0.1.4.4002";
const MONITOR_ADDRESS = env.MONITOR_ADDRESS ?? "10.0.1.5:8087";
const MQ_ADDRESS = env.MQ_ADDRESS ?? "10.1.2.2:5672";
const MQ_MONITOR_ADDRESS = env.MQ_MONITOR_ADDRESS ?? "10.1.2.2:15672";

await waitForServices();

type State = "INIT" | "RUNNING" | "PAUSED" | "SHUTDOWN";

const appState = {
  state: "INIT" as State,
  runlog: [] as string[],
};

startServer();

function startServer() {
  const app = express();
  app.use(express.text({ type: "*/*" }));

  app.get("/healthcheck", (_, res) => {
    res.status(200);
    res.send("OK");
  });

  app.get("/messages", async (_, res) => {
    try {
      const messageResponse = await fetch(`http://${MONITOR_ADDRESS}`);
      const text = await messageResponse.text();
      res.type("text/plain; charset=utf-8");
      res.send(text);
    } catch (e) {
      console.log(e);
      res.status(500);
      res.send("Internal server error");
    }
  });

  app.put(
    "/state",
    async (req, _, next) => {
      const state = req.body;
      console.log("Received state", state);
      next();
      console.log("After next");
      if (isState(state) && state == "SHUTDOWN") {
        console.log("Sending shutdown to monitor");
        await shutdown(MONITOR_ADDRESS);
        console.log("Sending shutdown to service 2");
        await shutdown(SERVICE_2_ADDRESS);
        console.log("Sending shutdown to service 1");
        await shutdown(SERVICE_1_ADDRESS);
        process.exit();
      }
    },
    async (req, res) => {
      try {
        const state = req.body;

        if (!isState(state)) {
          res.status(400);
          res.send("Invalid state");
          return;
        }

        const response = await fetch(
          `http://${SERVICE_1_ADDRESS}/state/${state}`,
          {
            method: "PUT",
          }
        );

        const newState = await response.text();
        if (!isState(newState)) {
          res.status(500);
          res.send("Received invalid state from service 1");
          return;
        }

        const logEntry = `${new Date().toISOString()}: ${
          appState.state
        }->${newState}`;

        appState.runlog.push(logEntry);
        appState.state = newState;

        res.type("text/plain; charset=utf-8");
        res.send(newState);
      } catch (e) {
        console.log(e);
        res.status(500);
        res.send("Internal server error");
      }
    }
  );

  app.get("/state", async (_, res) => {
    res.type("text/plain; charset=utf-8");
    const stateRes = await fetch(`http://${SERVICE_1_ADDRESS}/state`);
    const state = await stateRes.text();
    if (!isState(state)) {
      res.status(500);
      res.send("Received invalid state from service 1");
      return;
    }

    if (state != appState.state) {
      const logEntry = `${new Date().toISOString()}: ${
        appState.state
      }->${state}`;

      appState.runlog.push(logEntry);
      appState.state = state;
    }

    res.send(state);
  });

  app.get("/mqstatistic", express.json(), async (_, res) => {
    try {
    } catch (e) {
      console.log(e);
      res.status(500);
      res.send("Internal server error");
    }
  });

  app.get("/run-log", (_, res) => {
    res.type("text/plain; charset=utf-8");
    res.send(appState.runlog.join("\n"));
  });

  app.listen(PORT);
  console.log("Server is running on port", PORT);

  return app;
}

function isState(state: string): state is State {
  return ["INIT", "RUNNING", "PAUSED", "SHUTDOWN"].includes(state);
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
  console.log(`Waiting for service ${service} to be ready...`);
  execSync(`./wait-for-it/wait-for-it.sh ${service} -t 60`);
  console.log(`Service ${service} is ready!`);
  sleepSync(1000);
}

async function shutdown(service: string) {
  try {
    await fetch(`http://${service}/shutdown`);
  } catch (e) {
    console.log(`Service shutdown since connection shutdown ${service}`);
  }
}
