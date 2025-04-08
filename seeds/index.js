// This file is used to preload the data.
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Campground = require("../models/campground.js");
const cities = require("./cities.js");
const { descriptors, places } = require("./seedHelpers.js");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelpCampProj")
  .then(() => {
    console.log("Connection Succeded...");
  })
  .catch((err) => {
    console.log("Oh No!!! Error Occured");
    console.log(err);
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seed = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const randomPrice = Math.floor(Math.random() * 50) + 10;
    const newCG = new Campground({
      author: "67e7cd623364ab8286642b13",
      title: `${sample(descriptors)}, ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dsrzwtd4v/image/upload/v1743621731/cld-sample-3.jpg",
          filename: "YelpCampProj/cld-sample-3",
        },
        {
          url: "https://res.cloudinary.com/dsrzwtd4v/image/upload/v1743621731/cld-sample-4.jpg",
          filename: "YelpCampProj/cld-sample-4",
        },
        {
          url: "https://res.cloudinary.com/dsrzwtd4v/image/upload/v1743621731/cld-sample-5.jpg",
          filename: "YelpCampProj/cld-sample-5",
        },
        {
          url: "https://res.cloudinary.com/dsrzwtd4v/image/upload/v1743621730/cld-sample.jpg",
          filename: "YelpCampProj/cld-sample",
        },
        {
          url: "https://res.cloudinary.com/dsrzwtd4v/image/upload/v1743621731/cld-sample-2.jpg",
          filename: "YelpCampProj/cld-sample-2",
        },
        {
          url: "https://res.cloudinary.com/dsrzwtd4v/image/upload/v1743621730/samples/cup-on-a-table.jpg",
          filename: "YelpCampProj/cup-on-a-table",
        },
        {
          url: "https://res.cloudinary.com/dsrzwtd4v/image/upload/v1743621729/samples/coffee.jpg",
          filename: "YelpCampProj/coffee",
        },
        {
          url: "https://res.cloudinary.com/dsrzwtd4v/image/upload/v1743621728/samples/balloons.jpg",
          filename: "YelpCampProj/balloons",
        },
        {
          url: "https://res.cloudinary.com/dsrzwtd4v/image/upload/v1743621722/samples/landscapes/nature-mountains.jpg",
          filename: "YelpCampProj/nature-mountains",
        },
      ],
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quod accusamus modi, quaerat et optio deleniti distinctio officia tempore cumque omnis ipsa reprehenderit atque alias dolor nostrum sequi, quibusdam in odio!",
      price: randomPrice,
    });
    await newCG.save();
  }
};

seed().then(() => {
  mongoose.connection.close();
});
