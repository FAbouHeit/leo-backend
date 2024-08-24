import express from "express";
import { authenticate } from "../Middleware/Auth";

import {
  signIn,
  signUp,
  activateAccount,
  signOut,
  // refreshHandler,
} from "../Controllers/Authentication.Controller.js";
  
  const userRouter = express.Router();
  
  userRouter.post("/sign-in", signIn);
  userRouter.post("/sign-up", signUp);
  userRouter.get("/activate/:token", activateAccount);
  userRouter.get("/sign-out", signOut);
  // userRouter.post("/refresh", refreshHandler);
  
  export default userRouter;
  
  
  