const mongoose = require("mongoose");
const Review = require("./review.js");
const User = require("./user.js");
const { required } = require("joi");
const { coordinates } = require("@maptiler/client");
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new mongoose.Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const campGrSchema = new mongoose.Schema(
  {
    title: String,
    price: Number,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: String,
    location: String,
    images: [ImageSchema],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Review,
      },
    ],
  },
  opts
);

campGrSchema.virtual("properties.popUp").get(function () {
  return `<strong><a href = /campgrounds/${this._id}>${this.title}</a></strong>
  <p> ${this.description.substring(0, 35)}....`;
});

campGrSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    let allReviews = doc.reviews;
    for (let rev of allReviews) {
      await Review.findByIdAndDelete(rev);
    }
  }
});

const Campground = mongoose.model("Campground", campGrSchema);
module.exports = Campground;
