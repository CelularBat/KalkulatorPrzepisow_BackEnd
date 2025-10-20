

var mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// SCHEMAS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

const {userSchema,User} = require('./mongo_schemas/userSchema.js');
const {foodSchema,Food} = require('./mongo_schemas/foodSchema.js');
const {recipeSchema,Recipe} = require('./mongo_schemas/recipeSchema.js');

const {productPortionSchema,Portion} = require('./mongo_schemas/productPortionSchema.js');

////////////////////////////////////////////////////////////////////////////////////////////////////////
// APIS
/////////////////////////////////////////////////////////////////////////////////////////////////////////
let { AccountManagerSetup  } = require("./mongo_APIs/AccountsAPI.js");
let {FoodAPI_Setup} = require("./mongo_APIs/FoodAPI");
let {RecipeAPI_Setup} = require("./mongo_APIs/RecipeAPI");
let {HelperAPI_Setup} = require("./mongo_APIs/HelperAPI");



function Init_Mongoose(app_express){
  AccountManagerSetup(app_express, User);
  FoodAPI_Setup(app_express,Food);
  RecipeAPI_Setup(app_express,Recipe);
  HelperAPI_Setup(app_express);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// EXPORT
/////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = { Init_Mongoose};
