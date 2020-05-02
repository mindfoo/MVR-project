const mongoose = require('mongoose');

//Require Models
const Playlist = require('../models/playlist');
const User = require('../models/user');
const Song = require('../models/song');

const DB_TITLE = 'mvr-project';

mongoose.connect(`mongodb://localhost/${DB_TITLE}`, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const playlistData = [


]

