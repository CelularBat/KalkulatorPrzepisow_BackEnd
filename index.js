const log = require("./Logger");



const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
require("dotenv").config();

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());

app.listen(3000,function(){
  console.log('Listening on', JSON.stringify(this.address(),null,2));
});

let ejs = require("ejs");
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



/////////////////////////////////////////////////////////////////////////////////////////////////////////
// ROUTES
/////////////////////////////////////////////////////////////////////////////////////////////////////////


app.use(express.static("public/styles"));
app.use(express.static("public/scripts"));
app.use(express.static("public/resources"));
app.get("/", (req, res) => {
  res.render(__dirname + "/views/main");
});

app.get("/addproduct", (req, res) => {
  res.render(__dirname + "/views/AddProduct");
});
app.get("/addrecipe", (req, res) => {
  res.render(__dirname + "/views/AddRecipe");
});

app.get("/addrecipe2", (req, res) => {
  res.render(__dirname + "/views/AddRecipe2");
});

app.get("/test", (req, res) => {
  res.sendFile(__dirname + "/views/test.html");
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(__dirname + "/resources/favicon.ico");
});

/////////////////////////////////////////////////////
// MONGOOSE CONFIG
/////////////////////////////////////////////////////////////////////////////////////////////////////////

let {mongoose, Food, User,Recipe} = require("./server/mongo");
const {c_UnregisteredAccountName} = require('./server/config');
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// ACCOUNT MANAGEMENT 
/////////////////////////////////////////////////////////////////////////////////////////////////////////

let {session , AccountManagerSetup  } = require("./server/accounts");
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

