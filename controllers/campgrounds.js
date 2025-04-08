const Campground = require("../models/campground");
const keys = Campground.schema.obj;
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
// const ExpressError = require("../utils/expressError");
const { cloudinary } = require("../cloudinary/config.js");
module.exports.allCampgrounds = async (req, res) => {
  let campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds, title: "All Campgrounds" });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new", { keys, title: "New Campground Form" });
};

module.exports.newFormPost = async (req, res) => {
  req.body["author"] = res.locals.currentUser;
  const geodata = await maptilerClient.geocoding.forward(req.body.location, {
    limit: 1,
  });
  const newEle = new Campground(req.body);
  newEle.geometry = geodata.features[0].geometry;
  newEle.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  await newEle.save();
  req.flash("success", "Successfully created the campground");
  res.redirect(`/campgrounds/${newEle._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const remEle = await Campground.findByIdAndDelete(id);
  if (remEle.images) {
    for (let file of remEle.images) {
      await cloudinary.uploader.destroy(file.filename);
    }
  }
  req.flash("success", "Successfully deleted the campground");
  res.redirect("/campgrounds");
};

module.exports.getEditForm = async (req, res) => {
  const { id } = req.params;
  const findElement = await Campground.findById(id);
  if (!findElement) {
    req.flash("error", "Not possible to get the Element");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", {
    findElement,
    title: "Editing Campground",
  });
};

module.exports.editCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const changes = req.body;
  const updatedObj = await Campground.findByIdAndUpdate(id, changes, {
    run_validators: true,
    new: true,
  });
  const geoData = await maptilerClient.geocoding.forward(req.body.location, {
    limit: 1,
  });
  updatedObj.geometry = geoData.features[0].geometry;
  let imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  updatedObj.images.push(...imgs);
  if (req.body.deleteImgs) {
    for (let filename of req.body.deleteImgs) {
      await cloudinary.uploader.destroy(filename);
    }
    await updatedObj.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImgs } } },
    });
  }
  await updatedObj.save();
  req.flash("success", "Successfully updated the content");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.getSingleCampground = async (req, res) => {
  const { id } = req.params;
  let findElement = await Campground.findById(id);
  if (!findElement) {
    req.flash("error", "Not possible to get the Element");
    res.redirect("/campgrounds");
  }
  findElement = await findElement.populate({
    path: "reviews",
    populate: { path: "author" },
  });
  findElement = await findElement.populate("author");
  res.render("campgrounds/show", {
    findElement,
    keys,
    title: `Campground Details`,
  });
};
