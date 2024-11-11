const {c_UnregisteredAccountName} = require("../config");
const log = require("../../Logger");
const mongoose = require("mongoose");
const { productPortionSchema } = require("./productPortionSchema");
require('mongoose-type-url');

const foodSchema = new mongoose.Schema({
    name: {type:String, required:true},
    brand: String,
    category: String,
    author: {type: String, default: c_UnregisteredAccountName},
    kj: {type:Number, required:true},
    kcal: {type:Number, required:true},
    fat: {type:Number, required:true},
    carb: {type:Number, required:true},
    sugar: {type:Number, required:false, default:null},
    protein: {type:Number, required:true},
    salt: {type:Number, required:false, default:null},
    fiber: {type:Number, required:false, default:null},
    public: {type:Boolean, default:true},
    link: mongoose.SchemaTypes.Url
  });
  
foodSchema.index({name:1, brand:1},{unique:1}); // makes brand + name combination unique.



function SanitizeFoodStr(str) {
  return str.slice(0, 30).replace(/[^a-zA-Z0-9\s\-_+\(\)ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '');
}
  
// TO DO: make one func instead of 2

function sanitizeFoodDoc_save(next){ 
    let document = this;
    if (document){
      log.debug("before:",document);
        
        this.schema.eachPath(function(path,type){
            if (type instanceof mongoose.Schema.Types.String && (document[path]) ) {
            document[path] = SanitizeFoodStr(document[path]);      
            } else if ((type instanceof mongoose.Schema.Types.Number && (document[path]) )) {
            document[path] = Math.min(Math.abs(document[path]),5000);
            } 
        });
        log.debug("after:",document);
    }
    next();
}

function sanitizeFoodDoc_update(next){ 
    let document = this._update;
    if (document){
        log.debug("before:",document);
        this.schema.eachPath(function(path,type){
        if (type instanceof mongoose.Schema.Types.String && (document[path]) ) {
          document[path] = SanitizeFoodStr(document[path]);      
        } else if ((type instanceof mongoose.Schema.Types.Number && (document[path]) )) {
          document[path] = Math.min(Math.abs(document[path]),5000);
        } 
      });
      log.debug("after",document);
    }
    next();
}

foodSchema.pre('save',sanitizeFoodDoc_save);
foodSchema.pre('update', sanitizeFoodDoc_update);
foodSchema.pre('findOneAndUpdate', sanitizeFoodDoc_update);


const Food = mongoose.model("Food", foodSchema);
module.exports = {foodSchema,Food};