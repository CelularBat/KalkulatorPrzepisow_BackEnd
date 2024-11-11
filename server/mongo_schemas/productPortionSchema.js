const mongoose = require("mongoose");

const productPortionSchema = new mongoose.Schema({
    productId: {type: Number, required:true},
    weight: {type: Number, required:true}
});

module.exports = {productPortionSchema};