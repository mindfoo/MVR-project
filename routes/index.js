const express = require("express");
const router = express.Router();
const Song = require("../models/song");

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

let artname; //  we need the artist name (artname) in the router.post (/add-playlist) so we are making it global.
// It is declared here and initialized in router.get(/artist-search)

// Our routes go here:
router.get("/", (req, res, next) => {
	res.render("index");
});

// 1. Search artists and choose artist

router.get("/artist-search", (req, res, next) => {
	//  console.log(req.query.artname) // --> { artname: 'placebo' } if in the form I type "placebo" and submit the form
	artname = req.query.artname;
	spotifyApi
		.searchArtists(req.query.artname)
		.then((data) => {
			//  console.log('The received data from the API: ', data.body);
			//  console.log('One of the items of the data: ', data.body.artists.items[0]);
			let artists = data.body.artists.items;
			//  console.log('sending data to artist-search results')
			res.render("playlist/artist-search-results", { artists });
			// console.log(artname)
			return artname; // we need the artist name (artname) in the router.post (/add-playlist)
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

					console.log(`This is allTracks logging from INSIDE the forEach`);
					console.log(allTracks);
					if (counter === albumsIds.length) {
						// pq o problema q tava a dar com artistas com mais de 1 album parecia estar relacionado com o res.render estar a ser chamado tantas vezes quantas o número de albums
						allTracks = new Set(allTracks); // remove os duplicados
						allInfo.name = allTracks;
						allInfo.preview = allPreview_url;
						res.render("playlist/all-tracks", { allInfo });
					}
					console.log(counter);
					console.log(albumsIds.length);
					counter = counter + 1;
				})
			);
			console.log(`This is allTracks logging from OUTSIDE the forEach`);
			console.log(allTracks);
			//  res.render('all-tracks', { allInfo }  )
		})
		.catch((err) =>
			console.log("The error while searching albums occurred: ", err)
		);
});

// 3. POST chosen songs to Database

router.post('/add-playlist', (req, res) => {
  console.log("I am on the add-playlist route")
  console.log(artname)
  const songs = req.body.song; 
  console.log(songs)


  let newSongsId = [];
  for (let i = 0; i < songs.length; i++) {
    songName = songs[i]
    artname = artname;
    let newSong = new Song({songName, artname});
    newSong.save()
    .then( () => {
      console.log(newSong._id) 
      newSongsId.push(newSong._id)   
      console.log(newSongsId) 
      console.log("A new song was saved in the DB")
      if ( i + 1 === songs.length) {
        res.redirect('/') //  --> Se não utilizar o if dá o erro "Cannot set headers after they are sent to the client" apesar de gravar na DB
     // deve ser o mesmo problema que acontecia em albumsId.forEach().
      }
    })
    .catch((error) => {
            console.log(error);
    }) 
  }

    let newPlaylist = new Playlist ({artistName, songs, user})
    newPlaylist.save()
    .then()

})


module.exports = router;
