const express = require("express");
const router = express.Router();
const Song = require("../models/song");
const Playlist = require("../models/playlist");

// Require Spotify
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
});

spotifyApi
	.clientCredentialsGrant()
	.then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
	.catch((error) =>
		console.log("Something went wrong when retrieving an access token", error)
	);


// Starting routes
let artistname; 
// We need the artist name (artname) in the router.post (/add-playlist) so we are making it global.
// It is declared here and initialized in router.get(/artist-search)

// GET home page 
router.get("/", (req, res, next) => {
	//const currentUser = req.session.currentUser;
	//res.render("index", { currentUser });
	// Getting username from basic auth
	// Getting username from passport
	if (req.session.passport) {
		let currentUser = req.session.passport.user;

		//console.log('FIRST IF', req.session.passport);

		Playlist.find({ user: req.session.passport.user._id}) 
		.then(allPlaylistsForThisUser => {
			res.render('index',  { currentUser, playlist: allPlaylistsForThisUser } );  
		}).catch((error) => {
			next(error);
		});
	}
	else if (req.session.currentUser) {
		let currentUser = req.session.currentUser;
		//console.log('SECOND ELSE', currentUser);

		Playlist.find({ user: currentUser._id}) 
		.then(allPlaylistsForThisUser => {
			res.render('index',  { currentUser, playlist: allPlaylistsForThisUser } );  
		}).catch((error) => {
			next(error);
		});
	}
	else {
		//console.log('FINALLL')
		res.render('index');
	}

});

// CHECK if the user is logged in and send to secret
router.use((req, res, next) => {
	//console.log(req.session.currentUser);
	if (req.session.currentUser || req.session.passport) {
		next();
	} else {
		res.redirect("/login");
	}
});

// GET Search for artists
router.get("/artist-search", (req, res) => {
	res.render("playlist/artist-search");
});

// GET results for artists search
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
			res.render("playlist/artist-search-results", { artists, artistname })
			return artistname; // we need the artist name (artistname) in the router.post (/add-playlist)
		})
		.catch((err) =>
			console.log("The error while searching artist occurred: ", err)
		);
});

// GET list of songs from spoti after getting albums
let id  // this is the SPOTIFY ARTIST ID. We are going to need to save it in the DB for updating a playlist purposes
router.get("/tracks/:id", (req, res) => {
	// console.log(req.params.id)
	id = req.params.id;

	spotifyApi
		.getArtistAlbums(id)
		.then((data) => {
			// console.log('The received data from the API: ', data.body);
			// console.log('The received data from the API: ', data.body.images);
			// console.log('One of the items of the data: ', data.body.artists.items[0])});
			let items = data.body.items;
			//console.log("DATA     ", data.body.items[0].artists[0].name);
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
					//console.log("THESE ARE THE SPOTI IDs for each SONG")
					// items.forEach((element)=> console.log(element.id))  // ID SPOTI SONGs AQUUUUUUUIIIIIIIIII
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
						//console.log("MAYBE", data);
						console.log(artist_name)
						res.render("playlist/all-tracks", { data , artist_name });
					}
					//console.log(counter);
					//console.log(albumsIds.length);
					counter = counter + 1;
				})
			);
			//console.log(`This is allTracks logging from OUTSIDE the forEach`);
			//console.log(allTracks);
			//res.render('all-tracks', { allInfo }  )
		})
		.catch((err) =>
			console.log("The error while searching albums occurred: ", err)
		);
});

// POST chosen songs to Database and add playlist
router.post("/add-playlist", (req, res, next) => {
	const songs = req.body.song;
	console.log(songs)

// Check if the user picked up 3 and only 3 songs
	if (songs.length !== 3) {
		console.log("So trés")
		// res.redirect("/")
		res.render("playlist/all-tracks", {
			errorMessage: "Your playlist was not created, choose 3 songs",
		})
		return
	}


	artistname = req.body.artist_name;

	let user = req.session.currentUser._id;
	const newPlaylist = new Playlist({ artistname, user, id });

	newPlaylist
		.save()
		.then((playlist) => {
			let newSongsId = [];

			for (let i = 0; i < songs.length; i++) {
				songName = songs[i];
				let newSong = new Song({ songName, artistname });

				Song.findOne({ songName: songName })
				.then((result) => {
					console.log(result)
					if (result !== null) {
					newPlaylist
						.updateOne(
							({ artistname: "artistname" }, { $push: { songs: [result._id] } })
						)
						.then((playlist) => {
							console.log("Done");
						});
			
					} else {
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
				
				})
			}
			res.redirect("/");
		})
	});


let playlistId;
// GET Vista individual de playlist
router.get('/playlist/:playlistId', (req, res, next) => {
	playlistId = req.params.playlistId;
	//console.log('ENTRAAAAA',playlistId)

	Playlist.findById(playlistId)
		.populate('songs')
		.then(playlistIndividual => {
			//console.log('XIXA', playlistIndividual)
			res.render('playlist/playlist-detail', { playlistIndividual})
	})
	.catch((error) => {
		next(error);
	});
});

let id_toedit
// GET list of songs from spoti AGAIN to EDIT the playlist
router.get("/playlist-edit/:id", (req, res) => {
	// console.log(req.params.id)
	id_toedit = req.params.id;

	spotifyApi
		.getArtistAlbums(id_toedit)
		.then((data) => {
			// console.log('The received data from the API: ', data.body);
			// console.log('The received data from the API: ', data.body.images);
			// console.log('One of the items of the data: ', data.body.artists.items[0])});
			let items = data.body.items;
			//console.log("DATA     ", data.body.items[0].artists[0].name);
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
						//console.log("MAYBE", data);
						console.log(artist_name)
						res.render("playlist/all-tracks-edit", { data , artist_name });
					}
					//console.log(counter);
					//console.log(albumsIds.length);
					counter = counter + 1;
				})
			);
			//console.log(`This is allTracks logging from OUTSIDE the forEach`);
			//console.log(allTracks);
			//res.render('all-tracks', { allInfo }  )
		})
		.catch((err) =>
			console.log("The error while searching albums occurred: ", err)
		);
});



//  POST new set of chosen songs 
//   >>>>>>>>>>>>>>>>>>>>>>>>>>>>>   VIA DELETE and CREATE a NEW playlist
 router.post("/playlist-edit", (req, res, next) => {
	const songs = req.body.song;
	artistname = req.body.artist_name;
	console.log("THIS IS THE playlist-edit ROUTE")
    console.log(songs)
    console.log(artistname)
	console.log(playlistId)

	// Check if the user picked up 3 and only 3 songs
	if (songs.length !== 3) {
		console.log("So trés")
		// res.redirect("/")
		res.render("playlist/all-tracks-edit", {
			errorMessage: "Your playlist was not created, choose 3 songs",
		})
		return
	}

    // REMOVE THE OLD PLAYLIST
	Playlist.findByIdAndDelete(playlistId)
	.then((result) => {
        console.log("Old Playlist removed. The SPOTIFY id of the artist is:")
        console.log(result.id)
        // return result.id
	})
	
	


	// CREATE A NEW PLAYLIST
	let user = req.session.currentUser._id;
	let id = id_toedit 
	const newPlaylist = new Playlist({ artistname, user, id }); 

	newPlaylist
		.save()
		.then((playlist) => {
			let newSongsId = [];

			for (let i = 0; i < songs.length; i++) {
				songName = songs[i];
				let newSong = new Song({ songName, artistname });

				Song.findOne({ songName: songName })
				.then((result) => {
					console.log(result)
					if (result !== null) {
					newPlaylist
						.updateOne(
							({ artistname: "artistname" }, { $push: { songs: [result._id] } })
						)
						.then((playlist) => {
							console.log("Done");
						});
			
					} else {
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
				
				})
			}

			res.redirect("/");
		})
		.catch((error) => {
			next(error);
		});
});


module.exports = router;


