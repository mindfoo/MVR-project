const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema(
  {
    Id: String,
    Artist: String,
    Album: String,
    Name: String,
    Preview: String
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
