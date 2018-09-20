const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});
mongoose.model('blogs', BlogSchema);
