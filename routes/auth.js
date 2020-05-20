const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

const bcrypt = require("bcryptjs");
const bcryptSalt = 10;

//Google Auth Route
router.get(
	"/auth/google",
	passport.authenticate("google", {
		scope: [
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		],
	})
);
router.get(
	"/auth/google/callback",
	passport.authenticate("google", {
		successRedirect: "/",
		failureRedirect: "/login", // here you would redirect to the login page using traditional login approach
	})
);

//signup route
router.get("/signup", (req, res, next) => {
	try {
		res.render("auth/signup");
	} catch (e) {
		next(e);
	}
});

//login route
router.get("/login", (req, res, next) => {
	try {
		res.render("auth/login");
	} catch (e) {
		next(e);
	}
});

//login POST
router.post("/login", (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;

	//TODO add fallbacks
	if (!username || !password) {
		res
			.render("auth/login", {
				errorMessage: "Indicate a username and password",
			})
			.catch((error) => {
				next(error);
			});
		return;
	}

	User.findOne({ username: username }).then((user) => {
		//TODO check if the user exists
		if (!user) {
			res.render("auth/login", {
				errorMessage: "The username doesn't exist",
			});
		}
		if (bcrypt.compareSync(password, user.password)) {
			req.session.currentUser = user;
			res.redirect("/");
		} else {
			res.render("auth/login", {
				errorMessage: "Incorrect password",
			});
		}
	});
});

// signup POST
router.post("/signup", (req, res, next) => {
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
	const imgPath =
		"https://res.cloudinary.com/dohdiqnba/image/upload/v1589745964/Profile%20Image/img_avatar2_jz0i0o.png";
	const salt = bcrypt.genSaltSync(bcryptSalt);
	const hashPass = bcrypt.hashSync(password, salt);

	//Making sure all the fields are fill
	if (
		firstName === "" ||
		lastName === "" ||
		username === "" ||
		email === "" ||
		password === ""
	) {
		res
			.render("auth/signup", {
				errorMessage: "Pls fill all the fields",
			})
			.catch((error) => {
				next(error);
			});
		return;
	}

	//Making sure the email is valid
	function validateEmail(email) {
		const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		return mailFormat.test(email);
	}

	if (email != "") {
		if (validateEmail(email) === false) {
			res
				.render("auth/signup", {
					errorMessage: "Pls enter a valid email",
				})
				.catch((error) => {
					next(error);
				});
			return;
		}
	}

	//Making sure that user doesn't exist already
	User.findOne({ username: username }).then((user) => {
		if (user !== null) {
			res
				.render("auth/signup", {
					errorMessage: "The username already exists",
				})
				.catch((error) => {
					next(error);
				});
			return;
		}
		User.create({
			firstName,
			lastName,
			username,
			email,
			password: hashPass,
			imgPath,
		})
			.then(() => {
				res.redirect("/");
			})
			.catch((error) => {
				next(error);
			});
	});
});

//Logout route
router.get("/logout", (req, res, next) => {
	if (req.session.passport) {
		req.logout()
		res.redirect("/");
	}
	else {
		req.session.destroy(() => {
			res.redirect("/");
		})
	}
	
});

module.exports = router;
