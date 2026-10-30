import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

let server;
let shuttingDown = false;
const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function keepDatabaseConnected() {
  while (!shuttingDown) {
    try {
      await connectDatabase();
      console.log("TalentBridge MongoDB connection established.");
      return;
    } catch (error) {
      console.error("MongoDB Connection Error:", error);
      await wait(5000);
    }
  }
}

async function start() {
  const app = createApp();
  server = app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`TalentBridge API listening on port ${env.PORT}`);
  });
  void keepDatabaseConnected();
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}; shutting down TalentBridge API.`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase().catch(() => undefined);
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

await start();
