const log = require("./Logger");

require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());




app.listen(3000,function(){
  console.log('Listening on', JSON.stringify(this.address(),null,2));
});

/////////////////////////////////////////////////////
// MONGOOSE CONFIG
/////////////////////////////////////////////////////////////////////////////////////////////////////////

let {mongoose, Food, User,Recipe} = require("./server/mongo");
const {c_UnregisteredAccountName} = require('./server/config');
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// ACCOUNT MANAGEMENT 
/////////////////////////////////////////////////////////////////////////////////////////////////////////

let { AccountManagerSetup  } = require("./server/AccountsAPI");
AccountManagerSetup(app, User);

////////////////////////////////////////////////////////////////////////////////////////////////////////
// FOOD API
/////////////////////////////////////////////////////////////////////////////////////////////////////////
let {FoodAPI_Setup} = require("./server/FoodAPI");
FoodAPI_Setup(app,Food);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// RECIPE API
/////////////////////////////////////////////////////////////////////////////////////////////////////////
let {RecipeAPI_Setup} = require("./server/RecipeAPI");
RecipeAPI_Setup(app,Recipe);
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// ADMIN TOOLS
/////////////////////////////////////////////////////////////////////////////////////////////////////////
adm = require("./AdminTools");
//adm.importFoodFromFile(Food,'baza.txt',"baza","ogólne");
 //adm.PrintAllExcept(Recipe,{} );
 //adm.AddLackingKeysToModel(Food,"salt");
//adm.FindAndReplaceAllDocs(Food,{author: ['test','baza']},'brand','podstawowa','ogólne');
//adm.RemoveAllExcept(Food,{author:['NIEZALOG','adam']});
//adm.RemoveAllExcept(Recipe);

