import User from "../Models/UserModel/User.Model.js";
import bcrypt from "bcrypt";

import { generateToken } from "../Utils/Jwt.js";
import { authenticationErrorHandler } from "../Utils/ErrorHandler.js";
import { generateActivationToken } from "../Utils/ActivationToken.js";
import { sendActivationEmail } from "../Utils/Mailer.js";
import { nameRegex, emailRegex, passwordRegex } from "../Utils/Regex.js";
import { removeNonAlpha } from "../Helper/removeNonAlpha.js";

import { ACCOUNT_ACTIVATION_TIME_LIMIT } from "../Configuration/constants.js";
import { compareTwoTimes } from "../Helper/compareTime.js";

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
    const user = await User.findOne(userField);

    if (!user) {
      return authenticationErrorHandler(res, 401, "signin_user_not_found");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return authenticationErrorHandler(res, 401, "signin_invalid_credentials");
    }
    const token = generateToken(user);

    return res
      .cookie("access_token", token, {
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

export const signUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const validations = [
    {
      value: firstName,
      error: "signup_invalid_password",
      regex: nameRegex(firstName),
    },
    {
      value: lastName,
      error: "signup_invalid_password",
      regex: nameRegex(lastName),
    },
    { value: email, error: "signup_invalid_email", regex: emailRegex(email) },
    {
      value: password,
      error: "signup_invalid_password",
      regex: passwordRegex(password),
    },
  ];

  for (const { value, error, regex } of validations) {
    if (!value || !regex) {
      return authenticationErrorHandler(res, 401, error);
    }
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return authenticationErrorHandler(res, 400, "signup_user_already_exists");
  }

  const salt = 12;
  const hashedPassword = await bcrypt.hash(password, salt);
  const userName = removeNonAlpha(firstName) + "." + removeNonAlpha(lastName);
  const activationCode = generateActivationToken();

  //send code.
  try {
    let user = await User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      activationCode,
      activationCodeCreatedAt: new Date(), // Use new Date() to get the current date and time
      role: "admin",
      isActivated: false,
    });
    sendActivationEmail(user, activationCode);
    return res.status(200).json({ message: "User created successfully." });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 2,
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
