const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    driver: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    vehicleType: {type: String, required: true, enum: ['Bike', 'Scooter', 'Car']},
    vehicleNumber: {type: String, required: true},
    currentLocation: {
        latitude: {type: Number, required: true},
        longitude: {type: Number, required: true},
        latitudeDelta: {type: Number, required: true, default: 0.0122},
        longitudeDelta: {type: Number, required: true, default: 0.0221},
    },
    isAvailable: {type: Boolean, required: true},
    rating: {type: Number, required: true},
    totalDeliveries: {type: Number, default: 0},
    profileImage: {type: String, defalut: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg"}

},{timestamps: true})


module.exports = mongoose.model('Driver', driverSchema)