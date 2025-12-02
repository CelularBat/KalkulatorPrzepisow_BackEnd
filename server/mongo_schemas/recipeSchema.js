const { c_UnregisteredAccountName } = require("../config");
const log = require("../../Logger");

const mongoose = require("mongoose");

require('mongoose-type-url');
const {sanitizeShortText,sanitizeLongText} = require("./_sanitizers");
const {verifyImageList} = require("./_verifyImageURL")



const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    productsList: [{
        product: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Food', 
            required: true
        },
        portion : { type: Number, required: true, 
            min: [0.1, 'Portion must be greater than 0'] 
        }
    }],
    photos: [mongoose.SchemaTypes.Url],
    author: { type: String, default: c_UnregisteredAccountName },
    public: { type: Boolean, default: true },
    createdAt: { type: Date,required: true,default: Date.now },
});

recipeSchema.set('autoIndex', false);


async function sanitizeRecipeDoc(document, _this) {
    if (!document) return;
  
    if (document.name)
      document.name = sanitizeShortText(document.name, 100);
  
    if (document.description)
      document.description = sanitizeLongText(document.description, 2000);
  
    if (document.author)
      document.author = sanitizeShortText(document.author, 100);
  
    if (document.photos && Array.isArray(document.photos)) {
      document.photos = await verifyImageList(document.photos);
    }
  
    return document;
  }
  
  async function sanitizeRecipeDoc_save(next) {
    let document = this;
    await sanitizeRecipeDoc(document, this);
    next();
  }
  
  async function sanitizeRecipeDoc_update(next) {
    let document = this._update;
    log.debug(document);
    await sanitizeRecipeDoc(document, this);
    log.debug(document);
    next();
  }
  
  recipeSchema.pre('save', sanitizeRecipeDoc_save);
  recipeSchema.pre('updateOne', sanitizeRecipeDoc_update);
  recipeSchema.pre('findOneAndUpdate', sanitizeRecipeDoc_update);




// populate Food object inside productList when recipes list is called by API
recipeSchema.pre('find', function() {
    this.populate('productsList.product');
});

/* Flattens the productList.ingridient key inside the results
Probably not the best practice here. But I lost too many time on this.
    {   product: {name: '', brand:'' ...}
        portion: 10;
    } 

        into:

    {   name: '',
        brand: '',
        ...
        portion: 10
    }
*/
recipeSchema.post('find',function(res){
    const newRes = res.map( item => {
        //log.debug("before transformation",item);
        const newProductList = item.productsList.map ((ingridient) => { 
            if ( ingridient.product){
                return {
                    portion: ingridient.portion,
                    ...ingridient.product?.toObject() 
                }
            }
            else {  // secures the case if product is missing
                log.error("Product from recipe doesn't exist!");
                return {
                    portion: ingridient.portion,
                    name: 'DELETED PRODUCT'
                };
            }
            
        }) 
        const newItem = {...item._doc}
        delete newItem.productsList;
        newItem.productsList = [...newProductList];
        //log.debug("after transformation",newItem);
        return newItem;   
    })
    return mongoose.overwriteMiddlewareResult(newRes);
})


const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = { recipeSchema,Recipe }