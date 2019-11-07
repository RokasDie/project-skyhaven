const Joi = require("@hapi/joi");

const newPostValidation = data => {
  console.log(data);
  const schema = Joi.object({
    postTitle: Joi.string()
      .required()
      .min(5)
      .error(error => {
        const errorCode = error[0].code;
        switch (errorCode) {
          case "string.empty":
            return new Error("Please provide a title");
            break;
          case "string.min":
            return new Error(
              `Title should be at least ${error[0].local.limit} characters`
            );
            break;
          default:
            break;
        }
      }),
    postText: Joi.string().error(error => {
      console.error(error);
    }),
    postSubtitle: Joi.string()
      .allow("")
      .error(error => {
        console.error(error);
      }),
    postGame: Joi.number().error(error => {
      console.error(error);
    })
  });
  return schema.validate(data);
};

module.exports.newPostValidation = newPostValidation;
