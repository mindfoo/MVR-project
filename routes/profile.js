const express = require("express");
const User = require("../models/user");
const uploadCloud = require("../config/cloudinary.js");
const router = express.Router();

//profile route
router.get("/profile", (req, res, next) => {
	try {
		const currentUser = req.session.currentUser;
		User.findById(currentUser._id).then((theUser) => {
			res.render("profile/profile", { theUser });
		});
	} catch (e) {
		next(e);
	}
});

// CHECK if the user is logged in and send to secret
router.use((req, res, next) => {
	if (req.session.currentUser) {
		next();
	} else {
		res.redirect("/login");
	}
});

//user edit route
router.get("/profile/edit", (req, res) => {
	const userId = req.query.user_id;
	User.findById(userId)
		.then((theUser) => {
			res.render("profile/profile-edit", { user: theUser });
		})
		.catch((error) => {
			next(error);
		});
});

//user edit post
router.post("/profile/edit", uploadCloud.single("photo"), (req, res) => {
	const userId = req.query.user_id;
	const imgPath = req.file.url;
	const imgName = req.file.originalname;
	const { firstName, lastName, username, email } = req.body;
	User.update(
		{ _id: userId },
		{ $set: { firstName, lastName, username, email, imgPath, imgName } }
	)
		.then(() => {
			res.redirect("/profile", {errorMessage: "can't upload"});
		})
		.catch((error) => {
			next(error);
		});
});

module.exports = router;
