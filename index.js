const log = require("./Logger");

require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
const session = require('express-session');

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());

  //////////////////////////////////
  // Session setup  
  //////////////////////////////////
  app.use(session({
    name: 'session-cookie',
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true, 
    cookie: {
      httpOnly: false,
      secure: (process.env.NODE_ENV == "DEPLOY"),
      sameSite: (process.env.NODE_ENV == "DEPLOY")? 'Strict':'Lax',
    
    }
  }));

  app.use(
    cors({
      credentials: true, // Access-Control-Allow-Credentials (cookies)
    })
  );

  app.set('trust proxy', 1);
////////////////////////////////////////////////////////////////////////



app.listen(3000,function(){
  console.log('Listening on', JSON.stringify(this.address(),null,2));
  console.log("index.js exists in:", __dirname ,"  ",__filename)
});

/////////////////////////////////////////////////////
// SERVING CLIENT HERE
/////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.static("put_client_dist_inside/dist"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/put_client_dist_inside/dist/index.html");
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

