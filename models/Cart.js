const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Food'},
    additives: {type: []},
    instructions: {type: String, default: ''},
    quantity: {type: Number, default: 1},
    totalPrice: {type: Number, required: true}
}, {timestamps: true});

module.exports = mongoose.model('Cart', cartSchema)