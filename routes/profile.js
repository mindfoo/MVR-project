const express = require("express");
const User = require("../models/user");
const Song = require("../models/song");

const router = express.Router();

//profile route
router.get("/profile", (req, res, next) => {
	try {
		res.render("profile/profile");
	} catch (e) {
		next(e);
	}
});


module.exports = router;
