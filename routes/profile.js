const express = require("express");
const User = require("../models/user");
const uploadCloud = require("../config/cloudinary.js");
const router = express.Router();

//profile route
router.get("/profile", (req, res, next) => {
	try {
		if (req.session.passport) {
			let currentUser = req.session.passport.user;
			User.findById(currentUser._id).then((theUser) => {
				console.log(theUser);
				res.render("profile/profile", { theUser });
			});
		} else {
			const currentUser = req.session.currentUser;
			User.findById(currentUser._id).then((theUser) => {
				console.log(theUser);
				res.render("profile/profile", { theUser });
			});
		}
	} catch (e) {
		console.log(e);
	}
});

// CHECK if the user is logged in and send to secret
router.use((req, res, next) => {
	if (req.session.currentUser || req.session.passport.user) {
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
			console.log(theUser);
			res.render("profile/profile-edit", { user: theUser });
		})
		.catch((error) => {
			console.log(e);
		});
});

//user edit post
router.post("/profile/edit", uploadCloud.single("photo"), (req, res) => {
	const userId = req.query.user_id;
	const { firstName, lastName, username, email } = req.body;
	if (!req.file) {
		User.update(
			{ _id: userId },
			{ $set: { firstName, lastName, username, email } }
		)
			.then(() => {
				res.redirect("/profile");
			})
			.catch((error) => {
				console.log(error);
			});
	} else {
		let imgPath = req.file.url;
		let imgName = req.file.originalname;
		User.update(
			{ _id: userId },
			{ $set: { firstName, lastName, username, email, imgPath, imgName } }
		)
			.then(() => {
				res.redirect("/profile");
			})
			.catch((error) => {
				console.log(error);
			});
	}
});

module.exports = router;
