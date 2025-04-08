# 🌲 Campground Listing System

A full-stack web application that allows users to create, view, edit, and review campground listings. Built with the **MERN stack** principles (MongoDB, Express, Node.js) and EJS for server-side rendering, the platform integrates authentication, image uploads, and map location features to deliver a complete CRUD experience.

---

## 🚀 Features

- ✅ User authentication and authorization (Register/Login/Logout)
- 📝 Full CRUD operations on campground listings
- 🖼️ Image upload functionality via Cloudinary
- 📍 Geocoding and maps integration using Mapbox
- 💬 Review system with ratings and user ownership control
- 🔒 Secure session management and input validation
- 🧰 Modular code structure with MVC architecture

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Templating**: EJS, EJS-Mate
- **Authentication**: Passport.js (Local Strategy), express-session
- **Image Uploads**: Multer, Cloudinary
- **Geocoding**: Mapbox API
- **Validation & Security**: Joi, Helmet
- **Others**: Connect-flash, Method-Override

---

## 📸 Screenshots

> _[Insert relevant screenshots of UI, forms, listing views, etc.]_

---

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ksl2003/Campground-Listing-System.git
   cd Campground-Listing-System
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   - Create a `.env` file and add the following:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_KEY=your_api_key
   CLOUDINARY_SECRET=your_api_secret
   MAPBOX_TOKEN=your_mapbox_token
   DB_URL=your_mongodb_connection_url
   SECRET=session_secret
   ```
4. **Run the App**
   ```bash
   npm start
   ```

---

## Deployment

- This Project is deployed and hosted via Render.com
