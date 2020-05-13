const express = require("express");
const router = express.Router();
const Song = require("../models/song");
const Playlist = require("../models/playlist");

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

let artistname; //  we need the artist name (artname) in the router.post (/add-playlist) so we are making it global.
// It is declared here and initialized in router.get(/artist-search)

// Our routes go here:
/* GET home page */
router.get("/", (req, res, next) => {
	let currentUser;
	//Getting username from basic auth
	if (req.session.currentUser) {
		currentUser = req.session.currentUser.username;
	}
	//Getting username from passport
	if (req.session.passport) {
		currentUser = req.session.passport.user.username;
	}
	res.render("index", { currentUser });
});
// CHECK if the user is logged in and send to secret
router.use((req, res, next) => {
	console.log(req.session.currentUser);
	if (req.session.currentUser || req.session.passport) {
		next();
	} else {
		res.redirect("/login");
	}
});

// 1. Search artists and choose artist

router.get("/artist-search", (req, res, next) => {
	res.render("playlist/create-top");
});

router.get("/artist-search-action", (req, res, next) => {
	//  console.log(req.query.artname) // --> { artname: 'placebo' } if in the form I type "placebo" and submit the form
	artistname = req.query.artistname;
	spotifyApi
		.searchArtists(artistname)
		.then((data) => {
			//  console.log('The received data from the API: ', data.body);
			//  console.log('One of the items of the data: ', data.body.artists.items[0]);
			let artists = data.body.artists.items;
			//  console.log('sending data to artist-search results')
			res.render("playlist/artist-search-results", { artists });
			// console.log(artname)
			return artistname; // we need the artist name (artname) in the router.post (/add-playlist)
		})
		.catch((err) =>
			console.log("The error while searching artists occurred: ", err)
		);
});

// 2. GET songs search route -> after artist is found

router.get("/tracks/:id", (req, res) => {
	// console.log(req.params.id)
	let id = req.params.id;

	spotifyApi
		.getArtistAlbums(id)
		.then((data) => {
			// console.log('The received data from the API: ', data.body);
			// console.log('The received data from the API: ', data.body.images);
			// console.log('One of the items of the data: ', data.body.artists.items[0])});
			let items = data.body.items;
			console.log("DATA     ", data.body.items[0].artists[0].name);

			artist_name = data.body.items[0].artists[0].name;
			// console.log(items)
			//  items.forEach(element => console.log(element.id))
			let albumsIds = [];
			items.forEach((element) => albumsIds.push(element.id));
			// console.log(albumsIds)
			const allInfo = {};
			let allTracks = [];
			let allPreview_url = [];

			let counter = 1;
			albumsIds.forEach((element) =>
				spotifyApi.getAlbumTracks(element).then((data) => {
					// console.log('The received data from the API: ', data.body);
					let items = data.body.items;
					items.forEach((element) => allTracks.push(element.name));
					items.forEach((element) => allPreview_url.push(element.preview_url));

					//console.log(`This is allTracks logging from INSIDE the forEach`);
					//console.log('ALL TRA|CKS',allTracks);
					if (counter === albumsIds.length) {
						// pq o problema q tava a dar com artistas com mais de 1 album parecia estar relacionado com o res.render estar a ser chamado tantas vezes quantas o número de albums
						allTracks = new Set(allTracks); // remove os duplicados
						allInfo.name = allTracks;
						allInfo.preview = allPreview_url;
						//console.log(allInfo);
						let data = { allInfo, artist_name };
						console.log("MAYBE", data);
						res.render("playlist/all-tracks", { data });
					}
					//console.log(counter);
					//console.log(albumsIds.length);
					counter = counter + 1;
				})
			);
			//console.log(`This is allTracks logging from OUTSIDE the forEach`);
			//console.log(allTracks);
			//  res.render('all-tracks', { allInfo }  )
		})
		.catch((err) =>
			console.log("The error while searching albums occurred: ", err)
		);
});

// 3. POST chosen songs to Database

router.post("/add-playlist", (req, res, next) => {
	const songs = req.body.song;
	artistname = req.body.artist_name;

	let user = req.session.currentUser._id;
	const newPlaylist = new Playlist({ artistname, user });

	newPlaylist
		.save()
		.then((playlist) => {
			let newSongsId = [];

			for (let i = 0; i < songs.length; i++) {
				songName = songs[i];
				let newSong = new Song({ songName, artistname });

				newSong.save().then((result) => {
					newPlaylist
						.updateOne(
							({ artistname: "artistname" }, { $push: { songs: [result._id] } })
						)
						.then((playlist) => {
							console.log("Done");
						});
				});
			}
			res.redirect("/");
		})
		.catch((error) => {
			next(error);
		});
});

module.exports = router;
