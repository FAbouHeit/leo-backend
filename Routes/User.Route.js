import express from "express";
import { authenticate } from "../Middleware/Auth.js";

import {
  createAdmin, 
  deleteAccount,
  //change email
} from '../Controllers/User.Controller.js';
  
  const userRouter = express.Router();
  
  userRouter.post("/create-admin", createAdmin);
  userRouter.delete("/delete/one", deleteAccount);
  // userRouter.post("/refresh", refreshHandler);
  
  export default userRouter;
  
  
  