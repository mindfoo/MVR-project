const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    artistname: String,
    songs: [{type: Schema.Types.ObjectId, ref: 'Song'}],
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    id: String  // SPOTIFY ID
  },
    { 
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    }
);

const Playlist = mongoose.model('Playlist', playlistSchema);
module.exports = Playlist;
