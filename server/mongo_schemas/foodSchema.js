const {c_UnregisteredAccountName} = require("../config");
const log = require("../../Logger");
const mongoose = require("mongoose");
const { productPortionSchema } = require("./productPortionSchema");
require('mongoose-type-url');



const MAX_STRING_LEN = 30;
const MAX_NUMBER = 5000;

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
    link: mongoose.SchemaTypes.Url,

    _isDeleted: {type:Boolean, default:false} // flag for soft-deleting product if it is used in recipe
  });
  
foodSchema.index({name:1, brand:1},{unique:1}); // makes brand + name combination unique.


function _sanitizeFoodStr(str) {
  return str.slice(0, MAX_STRING_LEN).replace(/[^a-zA-Z0-9\s\-_+\(\)ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '');
}
  

function sanitizeFoodDoc(document,_this){
  if (document){
    log.debug("before:",document);
      _this.schema.eachPath(function(path,type){
          if (type instanceof mongoose.Schema.Types.String && (document[path]) ) {
            document[path] = _sanitizeFoodStr(document[path]);      
          } else if ((type instanceof mongoose.Schema.Types.Number && (document[path]) )) {
            document[path] = Math.min(Math.abs(document[path]),MAX_NUMBER);
          } 
      });
      log.debug("after:",document);
  }
}
function sanitizeFoodDoc_save(next){ 
    let document = this;
    sanitizeFoodDoc(document,this)
    next();
}

function sanitizeFoodDoc_update(next){ 
    let document = this._update;
    sanitizeFoodDoc(document,this)
    next();
}

foodSchema.pre('save',sanitizeFoodDoc_save);
foodSchema.pre('update', sanitizeFoodDoc_update);
foodSchema.pre('findOneAndUpdate', sanitizeFoodDoc_update);


const Food = mongoose.model("Food", foodSchema);
module.exports = {foodSchema,Food};