const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema(
  {
    song_Id: String,
    song_Artist: String,
    song_Album: String,
    song_Name: String,
    song_Preview: String
  },
    { 
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    }
);

const Song = mongoose.model('Song', songSchema);
module.exports = Song;
