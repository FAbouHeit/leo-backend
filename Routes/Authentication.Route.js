import express from "express";
import { authenticate } from "../Middleware/Auth.js";

import {
  signIn,
  activateAccount,
  validate2FA,
  signOut,
  requestNewTFA,
  changePassword,
  // refreshHandler,
} from "../Controllers/Authentication.Controller.js";
  
  const authRouter = express.Router();
  
  authRouter.post("/sign-in", signIn);
  authRouter.get("/activate/:token", activateAccount);
  authRouter.post("/activate/two-factor-authentication", validate2FA);
  authRouter.post("/request/two-factor-authentication", requestNewTFA);
  authRouter.get("/sign-out", signOut);
  authRouter.post("/change-password", changePassword);
  // userRouter.post("/refresh", refreshHandler);
  
  export default authRouter;
  
  
  