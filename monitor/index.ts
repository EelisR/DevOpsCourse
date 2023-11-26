import { env, sleepSync } from "bun";
import express from "express";
import { execSync } from "child_process";
import ampq from "amqplib";

const PORT = env.PORT ?? (8087 as const);
const MQ_ADDRESS = env.MQ_ADDRESS ?? ("localhost" as const);
const MQ_PORT = env.MQ_PORT ?? (5672 as const);

const log_messages: string[] = [];

waitForMQ();

await listenToMq();

startServer();

async function listenToMq() {
  const connection = await ampq.connect(`amqp://${MQ_ADDRESS}:${MQ_PORT}`);
  const channel = await connection.createChannel();

  await channel.consume("log", (msg) => {
    if (msg) {
      const message = msg.content.toString();
      log_messages.push(message);
    }
  });
}

function startServer() {
  const app = express();
  app.use(express.json());
  app.get("/", (_, res) => {
    res.send(log_messages.join("\n"));
    res.contentType("text/plain");
    res.end();
  });
  app.get(
    "/shutdown",
    (__, _, next) => {
      console.log("Received shutdown request");
      next();
      process.exit(0);
    },
    (_, res) => {
      res.status(200);
      res.send("OK");
    }
  );

  app.listen(PORT);
  console.log("Server is running on port", PORT);

  return app;
}

function waitForMQ() {
  console.log("Waiting for MQ to be ready...");
  execSync(`./wait-for-it/wait-for-it.sh ${MQ_ADDRESS}:${MQ_PORT} -t 120`);
  console.log("MQ is ready!");
  console.log("Waiting couple of secs for queue inits");
  sleepSync(3000);
}
