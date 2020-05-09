const express = require("express");
const User = require("../models/user");

const router = express.Router();

//profile route
router.get("/profile", (req, res, next) => {
	try {
		const currentUser = req.session.currentUser;
		res.render("profile/profile", { currentUser });
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
router.post("/profile/edit", (req, res) => {
	const userId = req.query.user_id;
	const { firstName, lastName, username, email } = req.body;
	User.update(
		{ _id: userId },
		{ $set: { firstName, lastName, username, email } }
	)
		.then(() => {
			res.redirect("/profile");
		})
		.catch((error) => {
			next(error);
		});
});

module.exports = router;
