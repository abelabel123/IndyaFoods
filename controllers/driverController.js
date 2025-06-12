const Driver = require('../models/Driver')
const User = require('../models/User')
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

const DEFAULT_LATITUDE = 13.0827; 
const DEFAULT_LONGITUDE = 80.2707
module.exports = {
    registerDriver: async (req, res) => {
        const { vehicleType, vehicleNumber, latitude, longitude } = req.body;

        
        const validatedLatitude = latitude !== undefined ? latitude : DEFAULT_LATITUDE;
        const validatedLongitude = longitude !== undefined ? longitude : DEFAULT_LONGITUDE;

        const driverData = {
            driver: req.user.id, 
            vehicleType,
            vehicleNumber,
            currentLocation: {
                latitude: validatedLatitude,
                longitude: validatedLongitude,
            },
            verification: 'Verified', 
        };

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const driver = new Driver(driverData);
            await driver.save({ session });

            
            await User.findByIdAndUpdate(req.user.id, { userType: 'Driver', verified:'true' }, { session });

            await session.commitTransaction();
            session.endSession();

            res.status(201).json({ status: true, message: 'Driver registered successfully', data: driver });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            console.error('Error registering driver:', error);
            res.status(500).json({ status: false, message: 'Failed to register driver', error });
        }
    },

    getDriverDetails: async (req, res) => {
        const driverId = req.params.id;
    
        try {
            const driver = await Driver.find({driver: driverId}).populate('driver');
            if (driver) {
                res.status(200).json({ status: true, data: driver });
            } else {
                res.status(404).json({ status: false, message: 'Driver not found' });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    updateDriverDetails: async (req, res) => {
        const driverId  = req.params.id;
    
        try {
            const updatedDriver = await Driver.findByIdAndUpdate(driverId, req.body, { new: true });
            if (updatedDriver) {
                res.status(200).json({ status: true, message: 'Driver details updated successfully' });
            } else {
                res.status(404).json({ status: false, message: 'Driver not found' });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    deleteDriver: async (req, res) => {
        const driverId = req.params.id;
    
        try {
            await Driver.findByIdAndDelete(driverId);
            res.status(200).json({ status: true, message: 'Driver deleted successfully' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    setDriverAvailability: async (req, res) => {
        const driverId  = req.params.id;
    
        try {
            const driver = await Driver.findById(driverId);
            if (!driver) {
                res.status(404).json({ status: false, message: 'Driver not found' });
                return;
            }
    
            
            driver.isAvailable = !driver.isAvailable;
            await driver.save();
    
            res.status(200).json({ status: true, message: `Driver is now ${driver.isAvailable ? 'available' : 'unavailable'}`, data: driver });
        } catch (error) {
            res.status(500).json(error);
        }
    },
    
}