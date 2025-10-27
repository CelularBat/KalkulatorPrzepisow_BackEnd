

var mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// SCHEMAS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

const {User} = require('./mongo_schemas/userSchema.js');
const {Food} = require('./mongo_schemas/foodSchema.js');
const {Recipe} = require('./mongo_schemas/recipeSchema.js');
const { Comment } = require("./mongo_schemas/commentSchema");

const {Portion} = require('./mongo_schemas/productPortionSchema.js');

////////////////////////////////////////////////////////////////////////////////////////////////////////
// APIS
/////////////////////////////////////////////////////////////////////////////////////////////////////////
let { AccountManagerSetup  } = require("./mongo_APIs/AccountsAPI.js");
let {FoodAPI_Setup} = require("./mongo_APIs/FoodAPI");
let {RecipeAPI_Setup} = require("./mongo_APIs/RecipeAPI");
let {HelperAPI_Setup} = require("./mongo_APIs/HelperAPI");
let {CommentAPI_Setup} = require("./mongo_APIs/CommentAPI");



function Init_Mongoose(app_express){
  AccountManagerSetup(app_express, User);
  FoodAPI_Setup(app_express,Food);
  RecipeAPI_Setup(app_express,Recipe);
  HelperAPI_Setup(app_express);
  CommentAPI_Setup(app_express,Comment);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// EXPORT
/////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = { Init_Mongoose};
