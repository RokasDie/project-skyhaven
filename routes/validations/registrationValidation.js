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

// register validation
const registerValidation = data => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(40)
      .required()
      .error(error => {
        return registrationErrorHandler(error);
      }),
    email: Joi.string()
      .min(6)
      .required()
      .email()
      .error(error => {
        return registrationErrorHandler(error);
      }),
    password1: Joi.string()
      .pattern(passwordCheckRegex)
      .error(error => {
        return registrationErrorHandler(error);
      }),
    password2: Joi.valid(Joi.ref("password1")).error(error => {
      return registrationErrorHandler(error);
    })
  });

  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
