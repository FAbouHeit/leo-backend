import User from "../Models/UserModel/User.Model.js";
import bcrypt from "bcrypt";

import { v4 as uuidv4 } from "uuid";
import { generateToken } from "../Utils/Jwt.js";
import { authenticationErrorHandler } from "../Utils/ErrorHandler.js";
import { generateActivationToken } from "../Utils/ActivationToken.js";
import { send2FACode, sendActivationEmail, sendPasswordChangedEmail } from "../Utils/Mailer.js";
import { passwordRegex } from "../Utils/Regex.js";

import {
  ACCOUNT_ACTIVATION_TIME_LIMIT,
  TWO_FACTOR_AUTH_TIME_LIMIT,
} from "../Configuration/constants.js";
import { compareTwoTimes } from "../Helper/compareTime.js";
import { create2FACode } from "../Helper/codeGenerator.js";

export const signIn = async (req, res) => {
  const { userName, email, password } = req.body;

  if (!email && !userName) {
    return authenticationErrorHandler(res, 400, "signin_missing_fields");
  }
  if (!password) {
    return authenticationErrorHandler(res, 400, "signin_missing_password");
  }

  try {
    const userField = userName ? { userName } : { email };
    let user = await User.findOne(userField);

    if (!user) {
      return authenticationErrorHandler(res, 401, "signin_user_not_found");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return authenticationErrorHandler(res, 401, "signin_invalid_credentials");
    }

    if (!user.isActivated) {
      let withinActivation = compareTwoTimes(
        ACCOUNT_ACTIVATION_TIME_LIMIT,
        user.activationCodeCreatedAt
      );

      if (
        user.activationCode == null ||
        (user.activationCode && !withinActivation)
      ) {
        try {
          const activationCode = generateActivationToken();
          user.activationCode = activationCode;
          user.activationCodeCreatedAt = new Date();
          await user.save();
          await sendActivationEmail(user, activationCode);
          return res
            .status(200)
            .json({ message: "Activation Code sent successfully." });
        } catch (err) {
          return res.status(500).json({
            error: "Error: Internal Server Error!",
            errorMessage: err.message,
            errCode: 1,
          });
        }
      } else {
        return res.status(200).json({
          message: "Please check your email, or request a new activation code.",
        });
      }
    }
    const deviceId = req.cookies.leo_device_id;
    if (!deviceId || deviceId == undefined) {
      if (!user.tfaCode) {
        try {
          let twoFactorAuthCode = create2FACode();
          const salt = 12;
          const hashedTFA = await bcrypt.hash(twoFactorAuthCode, salt);
          user.tfaCode = hashedTFA;
          user.tfaCodeCreatedAt = new Date();
          await user.save();

          await send2FACode(user, twoFactorAuthCode);
          return res
            .status(200)
            .json({ message: "2FA Code created and sent Successfully." });
        } catch (err) {
          return res.status(500).json({
            error: "Error: Internal Server Error!",
            errorMessage: err.message,
            errCode: 1,
          });
        }
      } else {
        return res
          .status(200)
          .json({
            message:
              "Please enter your Two-Factor Authorization Code to proceed.",
          });
      }
    }

    const token = generateToken(user);

    return res
      .cookie("leo_access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 3600000, // 1 hour.
        path: "/", // Limits the cookie to a specific path
        domain: process.env.CLIENT_PATH, // Specifies the domain to which the cookie belongs (optional).
      })
      .status(200)
      .json({ message: "Login successful" });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 1,
    });
  }
};

export const validate2FA = async (req, res) => {
  const { email, twoFactorAuthCode } = req.body;

  if (!email || !twoFactorAuthCode) {
    return authenticationErrorHandler(res, 400, "signup_user_doesnt_exist");
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return authenticationErrorHandler(res, 400, "signup_user_doesnt_exist");
    }


    const isValidCode = bcrypt.compare(twoFactorAuthCode, user.tfaCode);
    const withinTimeLimit = compareTwoTimes(
      TWO_FACTOR_AUTH_TIME_LIMIT,
      user.tfaCodeCreatedAt
    );

    if (!isValidCode || !withinTimeLimit) {
      user.tfaAttemptNumber += 1;
      if (user.tfaAttemptNumber >= 3) {
        user.isDisabled = true;
      }
      await user.save();
      return authenticationErrorHandler(res, 400, "signup_user_doesnt_exist");
    } else {
      const deviceId = uuidv4();
      res.cookie("leo_device_id", deviceId, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
        secure: true,
      }); // 1 year
      user.tfaCode = null;
      user.tfaCodeCreatedAt = null;
      user.tfaAttemptNumber = 0;
      user.tfaSent = 0;
      await user.save();
      return res
        .status(200)
        .json({ message: "Two-factor Authorization Code accepted." });
    }
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 1,
    });
  }
};

export const requestNewTFA = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return authenticationErrorHandler(res, 400, "tfa_email_not_provided");
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return authenticationErrorHandler(res, 400, "tfa_user_doesnt_exist");
    }

    const withinTimeLimit = compareTwoTimes(
      TWO_FACTOR_AUTH_TIME_LIMIT,
      user.tfaCodeCreatedAt
    );

    if (!withinTimeLimit) {
      if (user.tfaSent >= 3) {
        user.isDisabled = true;
        user.tfaCode = null;
        user.tfaCodeCreatedAt = null;
        await user.save();
        return authenticationErrorHandler(res, 400, "tfa_exceed_limit");
      }

      let twoFactorAuthCode = create2FACode();
      const salt = 12;
      const hashedTFA = await bcrypt.hash(twoFactorAuthCode, salt);
      user.tfaCode = hashedTFA;
      user.tfaCodeCreatedAt = new Date();
      user.tfaSent += 1;
      await user.save();

      await send2FACode(user, twoFactorAuthCode);
      return res
        .status(200)
        .json({ message: "2FA Code created and sent Successfully." });
    } else {
      return authenticationErrorHandler(res, 401, "tfa_cant_request_anymore");
    }
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 1,
    });
  }
};

export const activateAccount = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ activationCode: token });

    if (!user) {
      return authenticationErrorHandler(
        res,
        400,
        "signup_invalid_activation_token"
      );
    }

    let canActivate = compareTwoTimes(
      ACCOUNT_ACTIVATION_TIME_LIMIT,
      user.activationCodeCreatedAt
    );
    if (canActivate) {
      user.isActivated = true;
      await user.save();

      return res
        .status(200)
        .json({ message: "Account is activated successfully." });
    } else {
      console.log("too late!");
      return res
        .status(400)
        .json({ message: "Please request a new activation code." });
    }
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 2,
    });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("leo_access_token");
    res.clearCookie("leo_device_id");
    return res.status(200).json({ message: "Signed out successfully." });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 2,
    });
  }
};

export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return authenticationErrorHandler(res, 400, "signin_missing_fields");
  }

  if (oldPassword == newPassword) {
    return authenticationErrorHandler(res, 400, "signin_missing_fields");
  }

  if (!passwordRegex(newPassword)) {
    return authenticationErrorHandler(res, 400, "signin_missing_fields");
  }

  try {
    let user = await User.findOne({email});

    if (!user) {
      return authenticationErrorHandler(res, 401, "signin_user_not_found");
    }

    const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidOldPassword) {
      return authenticationErrorHandler(res, 401, "signin_invalid_credentials");
    }

    const salt = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    user.isOTP = false;

    await user.save();
    await sendPasswordChangedEmail(user);

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 2,
    });
  }
};

//refresh token?
