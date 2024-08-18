import User from "../Models/UserModel/User.Model.js";
import bcrypt from "bcrypt";

import { generateToken } from "../Utils/Jwt.js";
import { authenticationErrorHandler } from "../Utils/ErrorHandler.js";
import { nameRegex, emailRegex, passwordRegex } from "../Utils/Regex.js";
import { removeNonAlpha } from "../Helper/removeNonAlpha.js";
import { createActivationCode } from "../Helper/createActivationCode.js";

export const signIn = async (req, res) => {
  const { userName, email, password } = req.body;

  if (!email || !userName) {
    return authenticationErrorHandler(res, 400, "signin_missing_fields");
  }
  if (!password) {
    return authenticationErrorHandler(res, 400, "signin_missing_password");
  }

  try {
    const userField = userName || email;
    const user = await User.findOne({ userField });

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
        sameSite: "None",
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
  const activationCode = createActivationCode();

  //send code.
  try {
    await User.create({
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

    user.isActivated = true;
    await user.save();

    return res
      .status(200)
      .json({ message: "Account is activated successfully." });
  } catch (error) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 2,
    });
  }
};
