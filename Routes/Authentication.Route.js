import express from "express";
// import { authenticate } from "../Middleware/Auth.js";

import {
  signIn,
  signUp,
  activateAccount,
  // logout,
  // refreshHandler,
} from "../Controllers/Authentication.Controller.js";
  
  const userRouter = express.Router();
  
  userRouter.post("/sign-in", signIn);
  userRouter.post("/sign-up", signUp);
  userRouter.get("/activate/:token", activateAccount);
  // userRouter.get("/log-out", logout);
  // userRouter.post("/refresh", refreshHandler);
  
  export default userRouter;
  
  
  