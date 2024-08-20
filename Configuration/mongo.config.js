import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { 
  DB_CONNECTION_ATTEMPTS,
  DB_ATTEMPT_DELAY
} from "./constants.js";

const MONGODB_URI = process.env.MONGODB_URI;
export let isConnectedToDB = false;

/**
 * Connects to the MongoDB database
 */
const connectToMongoDB = async () => {
  console.log("Attempting to connect to DB...");

  for (let i = 0; i < DB_CONNECTION_ATTEMPTS; i++) {
    try {
      await mongoose.connect(MONGODB_URI);
      isConnectedToDB = true;
      console.log("Connection to MongoDB Established Successfully!");
      return;
    } catch (error) {
      console.error(
        `Error connecting to MongoDB (attempt ${i + 1}):\n\n`,
        error.message
      );
      if (i < DB_CONNECTION_ATTEMPTS) {
        console.log(`Retrying in ${DB_ATTEMPT_DELAY / 1000} seconds...\n`);
        await new Promise((resolve) => setTimeout(resolve, DB_ATTEMPT_DELAY));
      } else {
        console.log("Error: Cannot resolve connecting to port.")
      }
    }
  }
  console.error(`Failed to connect to MongoDB after, ${DB_CONNECTION_ATTEMPTS}, attempts!`);

  /*
  * Re-attempt connection every hour if it fails.
  */
  console.error(`\n\nAttempting to reconnect after an hour.\n`);
};

/*
* Disconnect from Mongo DB. 
*/
const closeMongoDBConnection = async () => {
  await mongoose.connection.close();
  isConnectedToDB = false;
}

export{ connectToMongoDB,  closeMongoDBConnection };