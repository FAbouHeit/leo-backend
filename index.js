import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import {
  connectToMongoDB,
  closeMongoDBConnection,
  isConnectedToDB,
} from "./Configuration/mongo.config.js";

import authenticationRoutes from "./Routes/Authentication.Route.js";

const corsOption = {
  origin: [process.env.CLIENT_PATH, "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));

app.use("/authenticate", authenticationRoutes);

/*
 * Activate the server. Takes in a port as a parameter.
 */
const attemptPortListening = (port) => {
  app
    .listen(port, async () => {
      console.log("Server Started successfully!");
      await connectToMongoDB();
    })
    .on("error", async (err) => {
      console.log("Error! Terminated attempt to listen to port.");
      if (isConnectedToDB) {
        await closeMongoDBConnection();
      }
    });
};
attemptPortListening(PORT);

/**
 * Adds signal listeners to the process
 */
process.on("SIGINT", async () => {
  console.log("\n\nReceived SIGINT signal, closing Mongoose connection...");
  if (isConnectedToDB) {
    await closeMongoDBConnection();
    console.log("Mongoose connection closed due to app termination.");
  }
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("\n\nReceived SIGTERM signal, closing Mongoose connection...");
  if (isConnectedToDB) {
    await closeMongoDBConnection();
    console.log("Mongoose connection closed due to app termination.");
  }
  process.exit(0);
});
