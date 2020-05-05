const express = require("express");
const router = express.Router();

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

// 1. Setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
});

// 2. Retrieve an access token
spotifyApi
	.clientCredentialsGrant()
	.then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
	.catch((error) =>
		console.log("Something went wrong when retrieving an access token", error)
	);

/* 0. GET home page */
router.get("/", (req, res, next) => {
	const currentUser = req.session.currentUser;
	res.render("index", {currentUser});
});

router.use((req, res, next) => {
	if (req.session.currentUser) {
		next(); // --------------------
	} else {
		// |
		res.redirect("/login"); // |
	} // |
});       

// 1. GET artist search route

router.get("/create-top", (req, res, next) => {
	res.render("playlist/create-top");
});

router.get("/create-top", (req, res, next) => {
	// console.log(artist.artistName);
	// req.query = {artist :'SEARCH'}
	const artistName = req.query.artist;

	spotifyApi
		.searchArtists(artistName)
		.then((data) => {
			const result = data.body.artists.items;
			console.log("The received data from the API: ", artistName);

			res.render("playlist/create-top", { result, artistName });
		})
		.catch((err) =>
			console.log("The error while searching artists occurred: ", err)
		);
});

// 2. GET songs search route -> after artist is found

// 3. POST chosen songs to Database

module.exports = router;
