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
// Security
//////////////////////////////////

// Rate limiter
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

if (process.env.NODE_ENV == "DEPLOY"){ // only for production
  app.use('/api/', limiter);
}

// HTTP Header
const helmet = require('helmet'); 
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], //turn off external styles !!
      imgSrc: ["'self'", "https:", "data:"], // imaes from external domains
      fontSrc: ["'self'"], // turn off external fonts !!
      objectSrc: ["'none'"],
      
    }
  })
);

// Mongo keys sanitizer
const mongoSanitize = require('express-mongo-sanitize');

app.use(
  mongoSanitize({
    onSanitize: ({ req, key }) => {
      console.warn(`This request[${key}] is sanitized`, req);
    },
  }),
);


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
// MONGOOSE
/////////////////////////////////////////////////////////////////////////////////////////////////////////

let {Init_Mongoose} = require("./server/mongo");
Init_Mongoose(app);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// SERVING CLIENT HERE
/////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.static("CLIENT_dist"));

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/CLIENT_dist/index.html");
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////
// ADMIN TOOLS
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const {User} = require('./server/mongo_schemas/userSchema.js');
const {Food} = require('./server/mongo_schemas/foodSchema.js');
const {Recipe} = require('./server/mongo_schemas/recipeSchema.js');
const { Comment } = require("./server/mongo_schemas/commentSchema");

adm = require("./AdminTools");

//adm.importFoodFromFile(Food,'baza.txt',"baza","ogólne");
 //adm.PrintAllExcept(Recipe,{} );
 //adm.AddLackingKeysToModel(Food,"salt");
//adm.FindAndReplaceAllDocs(Food,{author: ['test','baza']},'brand','podstawowa','ogólne');
//adm.RemoveAllExcept(Food,{author:['NIEZALOG','adam']});
//adm.RemoveAllExcept(Comment);

