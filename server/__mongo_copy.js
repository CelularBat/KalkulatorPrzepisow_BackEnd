const {c_UnregisteredAccountName} = require('./config');

var mongoose = require("mongoose");
require('mongoose-type-url');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
// SCHEMAS
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});



const foodSchema = new mongoose.Schema({
  name: {type:String, required:true},
  brand: String,
  category: String,
  author: {type: String,default: c_UnregisteredAccountName},
  kj: {type:Number, required:true},
  kcal: {type:Number, required:true},
  fat: {type:Number, required:true},
  carb: {type:Number, required:true},
  sugar: {type:Number, required:false, default:null},
  protein: {type:Number, required:true},
  salt: {type:Number, required:false, efault:null},
  fiber: {type:Number, required:false, efault:null},
  public: {type:Boolean, default:true},
  link: mongoose.SchemaTypes.Url
});

foodSchema.index({name:1, brand:1},{unique:1}); // makes brand + name combination unique.


const productPortionSchema = new mongoose.Schema({
      productId: {type: Number, required:true},
      weight: {type: Number, required:true}
});

const recipeSchema = new mongoose.Schema({
  name: {type:String, required:true},
  description: {type:String, required:true},
  productsList: [ productPortionSchema ],
  photos: [mongoose.SchemaTypes.Url],
  author: {type: String, default: c_UnregisteredAccountName},
  public: {type:Boolean, default:true}
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// FOOD
///////
function SanitizeFoodStr(str) {
  return str.slice(0,30).replace(/[^\s\d\w\-_+\(\)]/,'');
}

foodSchema.pre('save',function(next){
  let document = this;
  
  this.schema.eachPath(function(path,type){
      if (type instanceof mongoose.Schema.Types.String && (document[path]) ) {
        document[path] = SanitizeFoodStr(document[path]);      
      } else if ((type instanceof mongoose.Schema.Types.Number && (document[path]) )) {
        document[path] = Math.min(Math.abs(document[path]),5000);
      } 
    });
  
  next();
});

// RECIPE
/////////

// https://www.zhenghao.io/posts/verify-image-url
async function verifyIfImg(url) {
  return fetch(url, {method: 'HEAD'}).then( (res) => {
    return res.headers.get('Content-Type').startsWith('image');
  });
}

// Check if img url points to real image
recipeSchema.pre('save',async function(next){
   let input_photo_list = this[photos];
   let filtered_photo_list = [];
   let promise_array = [];
   for (let idx in input_photo_list){
      let promiseResult = verifyIfImg(input_photo_list[idx])
      .then( (res)=>{
        if (res) {
            filtered_photo_list.push(input_photo_list[idx]);
        }
        else {
          console.log("recipeSchema.pre :: " + input_photo_list[idx] + " is not a valid img");
        }
        promise_array.push(promiseResult); // because we dont want rejected promises in array
      }
      ,(rej)=>{
        console.log("recipeSchema.pre :: url error: " + rej);      
      }
      );
      
   }
   // wait till all promises in the loop got resolved
   await Promise.all(promise_array);
   this[photos] = filtered_photo_list;
   console.log(this[photos])
   next();
}); 

////////////////////////////////////////////////////////////////////////////////////////////////////////
// EXPORT
/////////////////////////////////////////////////////////////////////////////////////////////////////////


const User = mongoose.model("User", userSchema);
const Food = mongoose.model("Food", foodSchema);
const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = { mongoose, Food, User, Recipe, userSchema ,foodSchema, recipeSchema};
