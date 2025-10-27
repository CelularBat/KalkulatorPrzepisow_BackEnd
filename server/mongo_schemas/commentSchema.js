const mongoose = require("mongoose");
const { c_UnregisteredAccountName } = require("../config");

const commentSchema = new mongoose.Schema({
    recipe:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe', 
        required: true
    },
    author: { 
        type: String, 
        default: c_UnregisteredAccountName 
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    text:{
        type: String,
        required: true,
    },
    responseTo: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment'
    },
    _isDeleted: {
        type:Boolean,
        default:false
    } 
  });


  const MAX_TEXT_LEN = 1000;

  function _sanitizeText(str) {
    return str 
      .slice(0, MAX_TEXT_LEN)
      .replace(/[^a-zA-Z0-9\s\.,!?:;"'()\-\–—ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '');
  }

  commentSchema.pre('save', function(next) {
    if (this.text) this.text = _sanitizeText(this.text);
    next();
  });


  const Comment = mongoose.model("Comment", commentSchema);
  module.exports = {commentSchema,Comment};