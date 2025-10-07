const { c_UnregisteredAccountName } = require("../config");
const log = require("../../Logger");
const { Food} = require("./foodSchema");
const mongoose = require("mongoose");

require('mongoose-type-url');



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
    public: { type: Boolean, default: true }
});

recipeSchema.set('autoIndex', false);


// https://www.zhenghao.io/posts/verify-image-url
async function verifyIfImg(url) {
    return fetch(url, { method: 'HEAD' })
        .then((res) => {
            const isImage = res.headers.get('Content-Type').startsWith('image');
            return isImage;
        })
        .catch((err) => {
            log.error(err);
            return false;
        });
}

// Check if img url points to real image
recipeSchema.pre('save', async function (next) {
    log.debug("adding recipe",this);
    let input_photo_list = this.photos;
    let filtered_photo_list = [];
    let promise_array = [];

    for (let idx in input_photo_list) {
        let promise = verifyIfImg(input_photo_list[idx])
        .then((resolved) => {
                if (resolved) {
                    filtered_photo_list.push(input_photo_list[idx]);
                    log.debug("image added:" ,input_photo_list[idx])
                }
                else {
                    log.warn(`${input_photo_list[idx]} is not an image!`);
                }
            
            }, 
            (rejected) => {
                log.error(rejected);
        })
        .catch((error) => {
            log.error(`Error verifying image URL: ${input_photo_list[idx]}`, error);
        });
        promise_array.push(promise); 

    }
    // wait till all promises in the loop got resolved
    await Promise.all(promise_array);
    this.photos = filtered_photo_list;
    next();
});

// populate Food object inside productList when recipes list is called by API
recipeSchema.pre('find', function() {
    this.populate('productsList.product');
});

//flatten the productList.product key inside the results
/* Probably not the best practice here. But I lost too many time on this.
    We created shallow copy of internal item._doc ,because otherwise we were unable to assign new object to productList

*/
recipeSchema.post('find',function(res){
    const newRes = res.map( item => {
        //console.log("before transformation",item);
        const newProductList = item.productsList.map ((product) => { 
            if ( product.product){
                return {
                    portion: product.portion,
                    ...product.product?.toObject() // secures the case if product is missing
                }
            }
            else { 
                log.error("Product from recipe doesn't exist!");
                return {
                    portion: product.portion,
                    name: 'DELETED PRODUCT'
                };
            }
            
        }) 
        const newItem = {...item._doc}
        delete newItem.productsList;
        newItem.productsList = [...newProductList];
        //console.log("after transformation",newItem);
        return newItem;   
    })
    return mongoose.overwriteMiddlewareResult(newRes);
})


const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = { recipeSchema,Recipe }