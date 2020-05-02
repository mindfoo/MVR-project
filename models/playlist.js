const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    artistName: String,
    createdBy: [{type: Schema.Types.ObjectId, ref: 'User'}],
    info: [
      {
        pictureUrl: String,
        songs: [{type: Schema.Types.ObjectId, ref: 'Song'}]
      }
    ]
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
