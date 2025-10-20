const mongoose = require("mongoose");
// Not implemented yet

const productPortionSchema = new mongoose.Schema({
    productId: {type: Number, required:true},
    weight: {type: Number, required:true}
});

const Portion = mongoose.model("Portion", productPortionSchema);
module.exports = {productPortionSchema};