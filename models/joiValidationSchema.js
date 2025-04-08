const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const joi = BaseJoi.extend(extension);

const campGroundSchema = joi.object({
  title: joi.string().required().escapeHTML(),
  price: joi.number().required().min(0),
  description: joi.string().required().escapeHTML(),
  location: joi.string().required().escapeHTML(),
  // image: joi.string().required(),
  deleteImgs: joi.array(),
});

const reviewSchema = joi.object({
  text: joi.string().required().escapeHTML(),
  rating: joi.number().min(1).max(5).required(),
});

module.exports.campGroundSchema = campGroundSchema;
module.exports.reviewSchema = reviewSchema;
