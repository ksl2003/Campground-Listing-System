const Review = require("../models/review.js");
const Campground = require("../models/campground.js");

module.exports.newReviewCreate = async (req, res) => {
  // res.send(req.params.id);
  const newReview = new Review(req.body);
  newReview.author = req.user._id;
  const { id } = req.params;
  const findEle = await Campground.findById(id);
  findEle.reviews.push(newReview);
  // console.log(newReview);
  await newReview.save();
  await findEle.save();
  req.flash("success", "Review Creation Successful");
  res.redirect(`/campgrounds/${findEle._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewID } = req.params;
  const findReview = await Review.findByIdAndDelete(reviewID);
  const findCamp = await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewID },
    new: true,
  });
  // console.log(findCamp);
  req.flash("success", `Review is deleted`);
  res.redirect(`/campgrounds/${findCamp._id}`);
};
