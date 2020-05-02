const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema(
  {
    artist: String,
    album: String,
    name: String,
    preview: String
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
