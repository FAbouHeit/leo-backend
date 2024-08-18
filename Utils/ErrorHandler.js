export const authenticationErrorHandler = (res, status, error_description) => {
  switch (error_description) {
    case "signin_missing_fields":
      return res.status(status).json({
        error: "Error: All Fields Are Required!",
        errCode: 101,
      });
    case "signin_missing_password":
      return res.status(status).json({
        error: "Error: Password Is Required!",
        errCode: 102,
      });
    case "signin_user_not_found":
      return res.status(status).json({
        error: "Error: User Not Found!",
        errCode: 103,
      });
    case "signin_invalid_credentials":
      return res.status(status).json({
        error: "Error: Invalid Credentials!",
        errCode: 104,
      });
    default:
      return res.status(status).json({
        error: "Error: Internal Server Error!",
        errCode: 999,
      });
  }
};
