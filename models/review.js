const mongoose = require("mongoose");
const User = require("./user");

const reviewSchema = mongoose.Schema({
  text: String,
  rating: Number,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
});

const Review = mongoose.model("review", reviewSchema);

module.exports = Review;
