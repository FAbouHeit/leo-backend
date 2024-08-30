import { createOneTimePassword } from "../Helper/codeGenerator.js";
import removeNonAlpha from "../Helper/removeNonAlpha.js";
import User from "../Models/UserModel/User.Model.js";
import { emailRegex, nameRegex } from "../Utils/Regex.js";
import bcrypt from "bcrypt";

export const createAdmin = async (req, res) => {
  const { firstName, lastName, email, isSuper } = req.body;

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
    {
      value: email,
      error: "signup_invalid_password",
      regex: emailRegex(email),
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

  const otp = createOneTimePassword();
  const salt = 12;
  const hashedPassword = await bcrypt.hash(otp, salt);
  const userName = removeNonAlpha(firstName) + "." + removeNonAlpha(lastName);

  //send code.
  try {
    await User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      isOTP: true,
      activationCode: null,
      activationCodeCreatedAt: null, // Use new Date() to get the current date and time
      role: isSuper ? "super" : "admin",
      isActivated: false,
      isDisabled: false,
      tfaCode: null,
      tfaCodeCreatedAt: null,
      tfaAttemptNumber: 0,
      tfaSent: 0
    });
    return res.status(200).json({
      message: "User created successfully.",
      userName,
      otp,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 2,
    });
  }
};

export const changeRole = async (req,res) => {
    const { email, isSuper } = req.body;

    if (!email || !isSuper) {
        return authenticationErrorHandler(res, 400, "signup_user_already_exists");
      }
    
      try{
        let user = await User.findOne({ email });

        if (!user) {
          return authenticationErrorHandler(res, 400, "signup_user_already_exists");
        }

        user.role = isSuper ? "super" : "admin"
        await user.save()
        return res.status(200).json({
            message: isSuper ? "User has been made an admin successfully." : "Super privileges revoked successfully.",
          });

      } catch (err){
        return res.status(500).json({
            error: "Error: Internal Server Error!",
            errorMessage: err.message,
            errCode: 2,
          });
      }
}

export const regenerateOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return authenticationErrorHandler(res, 400, "signup_user_already_exists");
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return authenticationErrorHandler(res, 400, "signup_user_already_exists");
    }

    const otp = createOneTimePassword();
    const salt = 12;
    const hashedNewOTP = await bcrypt.hash(otp, salt);

    user.isOTP = true;
    user.password = hashedNewOTP;
    await user.save();

    return res.status(200).json({
      message: "OTP regenerated successfully.",
      userName,
      otp,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 2,
    });
  }
};

export const disableAccount = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return authenticationErrorHandler(res, 400, "signup_user_already_exists");
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return authenticationErrorHandler(res, 400, "signup_user_already_exists");
    }

    if (user.isDisabled) {
      return authenticationErrorHandler(res, 400, "signup_user_already_exists");
    }

    user.isDisabled = true;
    await user.save();

    return res.status(200).json({
      message: "Account has been locked successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 2,
    });
  }
};

export const enableAccount = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return authenticationErrorHandler(res, 400, "signup_user_already_exists");
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return authenticationErrorHandler(res, 400, "signup_user_already_exists");
    }

    if (!user.isDisabled) {
      return authenticationErrorHandler(res, 400, "signup_user_already_exists");
    }

    user.isDisabled = false;
    await user.save();

    return res.status(200).json({
      message: "Account has been unlocked successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 2,
    });
  }
};

export const deleteAccount = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return authenticationErrorHandler(res, 400, "email_not_provided");
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return authenticationErrorHandler(res, 400, "user_not_found");
    }

    await User.deleteOne({ email });

    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      error: "Error: Internal Server Error!",
      errorMessage: err.message,
      errCode: 2,
    });
  }
};

