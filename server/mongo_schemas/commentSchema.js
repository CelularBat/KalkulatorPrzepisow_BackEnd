const mongoose = require("mongoose");
const { c_UnregisteredAccountName } = require("../config");
const {sanitizeLongText} = require("./_sanitizers")

const commentSchema = new mongoose.Schema({
    recipeId:{
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


  commentSchema.pre('save', function(next) {
    if (this.text) this.text = sanitizeLongText(this.text , MAX_TEXT_LEN);
    next();
  });


  const Comment = mongoose.model("Comment", commentSchema);
  module.exports = {commentSchema,Comment};