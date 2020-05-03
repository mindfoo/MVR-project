const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const router = express.Router();
const bcryptSalt = 10;

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

//Logout route
router.get("/logout", (req, res, next) => {
	req.session.destroy(() => {
		res.redirect("/");
	});
});

// signup POST
router.post("/signup", (req, res, next) => {
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
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
		res.render("auth/signup", {
			errorMessage: "Pls fill all the fields",
		});
		return;
	}
	//Making sure that user doesn't exist already
	User.findOne({ username: username }).then((user) => {
		if (user !== null) {
			res.render("auth/signup", {
				errorMessage: "The username already exists",
			});
			return;
		}
		
		User.create({ firstName, lastName, username, email, password: hashPass })
			.then(() => {
				res.redirect("/");
			})
			.catch((error) => {
				next(error);
			});
	});
});

//login POST
router.post("/login", (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;

	//TODO add fallbacks
	if (!username || !password) {
		res.render("auth/login", {
			errorMessage: "Indicate a username and password",
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
			res.redirect("/");
		} else {
			res.render("auth/login", {
				errorMessage: "Incorrect password",
			});
		}
	});
});

module.exports = router;
