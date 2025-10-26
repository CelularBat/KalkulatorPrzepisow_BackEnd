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

// obrazy z dowolnej domeny
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "img-src *;");
  next();
});


//////////////////////////////////
// Security
//////////////////////////////////

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

const helmet = require('helmet');
app.use(helmet());

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
    maxAge: 1000 * 60 * 60 * 24 * 7,
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// SERVING CLIENT HERE
/////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.static("CLIENT_dist"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/CLIENT_dist/index.html");
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// MONGOOSE
/////////////////////////////////////////////////////////////////////////////////////////////////////////

let {Init_Mongoose} = require("./server/mongo");
Init_Mongoose(app);

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

