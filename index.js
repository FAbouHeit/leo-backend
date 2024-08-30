import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fs from 'fs'
import rateLimit from "express-rate-limit";
dotenv.config();

import {
  connectToMongoDB,
  closeMongoDBConnection,
  isConnectedToDB,
} from "./Configuration/mongo.config.js";

import authenticationRoutes from "./Routes/Authentication.Route.js";
import userRouter from "./Routes/User.Route.js";

const corsOption = {
  origin: [process.env.CLIENT_PATH, "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));
app.use(cookieParser());
app.use(limiter)

app.use("/authenticate", authenticationRoutes);
app.use("/super", userRouter);
app.get('/crash', (req, res) => {
  res.send("Server will crash in a few seconds...");
  // Delay before crashing to allow the response to be sent
  // setTimeout(() => {
  //   console.log("Crashing the server now...");
  //   process.exit(1); // Exit with a failure code to indicate a crash
  // }, 5000); // Adjust delay as needed

  let x = 0
  while (true){
    x++
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      console.log(`Memory Usage: RSS: ${memoryUsage.rss / 1024 / 1024} MB, Heap Total: ${memoryUsage.heapTotal / 1024 / 1024} MB, Heap Used: ${memoryUsage.heapUsed / 1024 / 1024} MB`);
    }, 5000); // Log every minute
    
  }

});
let x = 0

app.get('/test', (req,res)=> {
  console.log("OK" + x)
  x++;
  res.status(200).send("OK")
})

/*
 * Activate the server. Takes in a port as a parameter.
 */
const attemptPortListening = (port) => {
  app
    .listen(port, async () => {
      console.log("Server Started successfully!");
      // await connectToMongoDB();
    })
    .on("error", async (err) => {
      console.log("Error! Terminated attempt to listen to port.");
      if (isConnectedToDB) {
        await closeMongoDBConnection();
      }
        reject(err);
      });
};

(() => {
  try {
    const server = attemptPortListening(PORT);
    // Server started successfully, continue with other logic if needed
  } catch (err) {
    const logger = fs.createWriteStream('error.log', { flags: 'a' });
    logger.write(`${new Date().toISOString()}: ${err.message}\n`);
    logger.write(`${err.stack}\n\n`);
    logger.end();

    console.log("Failed to start server:", err.message);
  }
})();

/**
 * Adds signal listeners to the process
 */
process.on("SIGINT", async () => {
  console.log("\n\nReceived SIGINT signal.");
  if (isConnectedToDB) {
    console.log("Closing Mongoose connection...")
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

process.once('SIGUSR2', async () => {
  if (isConnectedToDB) {
  await closeMongoDBConnection();
  process.kill(process.pid, 'SIGUSR2'); // Let Nodemon restart the process
  }
});
