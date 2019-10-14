const Joi = require("@hapi/joi");

// password check pattern
const passwordCheckRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

// function which stores different error codes from validation
// then transforms them to messages which can be sent to front end
// the new Error creates error.message parameter with the created string
const registrationErrorHandler = error => {
  const errorCode = error[0].code;
  console.log(errorCode);
  switch (errorCode) {
    case "string.empty":
      return new Error("Please provide username");
      break;
    case "string.email":
      return new Error("Please enter valid email");
      break;
    case "string.min":
      return new Error(
        `Username should be at least ${error[0].local.limit} characters`
      );
      break;
    case "string.max":
      return new Error(
        `Username should be less than ${error[0].local.limit} characters`
      );
      break;
    case "any.only":
      return new Error("Passwords need to match");
      break;
    default:
      break;
  }
};

const loginValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
      .min(6)
      .required()
      .email()
      .error(error => {
        return registrationErrorHandler(error);
      }),
    password: Joi.string().error(error => {
      return registrationErrorHandler(error);
    })
  });

  return schema.validate(data);
};
module.exports.loginValidation = loginValidation;
