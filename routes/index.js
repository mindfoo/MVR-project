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


// /* 0. GET home page */
// router.get("/", (req, res, next) => {
// 	const currentUser = req.session.currentUser;
// 	res.render("index", {currentUser});
// });

// router.use((req, res, next) => {
// 	if (req.session.currentUser) {
// 		next(); // --------------------
// 	} else {
// 		// |
// 		res.redirect("/login"); // |
// 	} // |
// });       

// // 1. GET artist search route

// router.get("/create-top", (req, res, next) => {
// 	res.render("playlist/create-top");
// });

// router.get("/create-top", (req, res, next) => {
// 	// console.log(artist.artistName);
// 	// req.query = {artist :'SEARCH'}
// 	const artistName = req.query.artist;

// 	spotifyApi
// 		.searchArtists(artistName)
// 		.then((data) => {
// 			const result = data.body.artists.items;
// 			console.log("The received data from the API: ", artistName);

// 			res.render("playlist/create-top", { result, artistName });
// 		})
// 		.catch((err) =>
// 			console.log("The error while searching artists occurred: ", err)
// 		);
// });


// Our routes go here:
app.get('/', (req, res, next) => {
  res.render('index');
});


app.get('/artist-search', (req, res, next) => {
//  console.log(req.query.artname) // --> { artname: 'placebo' } if in the form I type "placebo" and submit the form
  spotifyApi
.searchArtists(req.query.artname)
.then(data => {
//  console.log('The received data from the API: ', data.body);
//  console.log('One of the items of the data: ', data.body.artists.items[0]);
  let artists = data.body.artists.items
//  console.log('sending data to artist-search results')
  res.render('artist-search-results',{ artists }  )     

})
.catch(err => console.log('The error while searching artists occurred: ', err));
})


//  app.get('/albums/:id', (req, res, next) => {
//             console.log(req.params.id)
//             let id = req.params.id;
//             spotifyApi
//             .getArtistAlbums(id)
//               .then(data => {
//               console.log('The received data from the API: ', data.body);
//               // console.log('The received data from the API: ', data.body.images);
//               // console.log('One of the items of the data: ', data.body.artists.items[0])});
//               let items = data.body.items;
//               console.log(items)
//                res.render('albums', { items } )
//             })
//            .catch(err => console.log('The error while searching albums occurred: ', err))
//           })



app.get('/tracks/:id', (req, res) => {
// console.log(req.params.id)
let id = req.params.id;

spotifyApi
.getArtistAlbums(id)
  .then(data => {
  // console.log('The received data from the API: ', data.body);
  // console.log('The received data from the API: ', data.body.images);
  // console.log('One of the items of the data: ', data.body.artists.items[0])});
  let items = data.body.items;
  // console.log(items)
 //  items.forEach(element => console.log(element.id))
  let albumsIds = [];
  items.forEach(element => albumsIds.push(element.id))
  // console.log(albumsIds)
  const allInfo = {}
  let allTracks = [];
  let allPreview_url = [];
 
  let counter = 1
  albumsIds.forEach(element => spotifyApi.getAlbumTracks(element)
      .then(data => {
        // console.log('The received data from the API: ', data.body);
        let items = data.body.items;
        items.forEach(element => allTracks.push(element.name))
        items.forEach(element => allPreview_url.push(element.preview_url))
      
          // allInfo.name = allTracks;
          // allInfo.preview = allPreview_url;
          console.log(`This is allTracks logging from INSIDE the forEach`)
          console.log(allTracks)
          if (counter === albumsIds.length) {  // pq o problema q tava a dar com artistas com mais de 1 album parecia estar relacionado com o res.render estar a ser chamado tantas vezes quantas o número de albums
            allTracks = new Set (allTracks) // remove os duplicados
            allInfo.name = allTracks;
            allInfo.preview = allPreview_url;
            res.render('all-tracks', { allInfo }  ) 
          // return allTracks
          }
          console.log(counter)
          console.log(albumsIds.length)
          counter = counter + 1
      })   
  )
  console.log(`This is allTracks logging from OUTSIDE the forEach`)
  console.log(allTracks)
 //  res.render('all-tracks', { allInfo }  )
})
.catch(err => console.log('The error while searching albums occurred: ', err))
})







// 2. GET songs search route -> after artist is found

// 3. POST chosen songs to Database

module.exports = router;
