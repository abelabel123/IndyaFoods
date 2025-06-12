const mongoose= require('mongoose');

const orderItemSchema = new mongoose.Schema({
    foodId: {type: mongoose.Schema.Types.ObjectId, ref: "Food"},
    quantity: {type: Number, required: true},
    price: {type: Number, required: true},
    additives: {type: Array},
    instructions: {type: String, default: ''}
});


const orderSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    orderItems: [orderItemSchema],
    orderTotal: {type: Number, required: true},
    deliveryFee: {type: Number, required: true},
    grandTotal: {type: Number, required: true},
    deliveryAddress:{type: mongoose.Schema.Types.ObjectId, ref: "Address"},
    paymentMethod: {type: String},
    paymentStatus: {type: String, default: "Pending", enum: ["Pending", "Completed", "Failed"]},
    orderStatus: {type: String, default: "Placed", enum: ["Placed", "Preparing", "Out for Delivery", "Delivery"]},
    orderDate: {type: Date, default: Date.now},
    restaurantId: {type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true},
    driverId: {type: mongoose.Schema.Types.ObjectId, ref: "Driver"},
    rating: {type: Number, min: 1, max: 5},
    feedBack: {type: String},
    promoCode: {type: String},
    discountAmount: {type: Number},
    notes:  {type: String}
    
}, {timestamps: false});

module.exports = mongoose.model('Order', orderSchema)