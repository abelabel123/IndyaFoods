// const Restaurant = require('../models/Restaurant');

// module.exports = {
//     addRestaurant: async(req, res) => {

//         const newRestaurant = new Restaurant(req.body)

//         try {
//             await  newRestaurant.save()
//             res.status(201).json({status: true, message: "Restaurant successfully created"})
//         } catch (error) {
//             res.status(500).json({status: false, message:"Error creating restaurant", error: error.message})
//         }
//     },

//     serviceAvaibility: async(req, res) => {
//         const restaurantId = req.params.id;

//         try {
//             const restaurant = await Restaurant.findById(restaurantId)

//             if(!restaurant){
//                 return res.status(404).json({status: false, message: "Restaurant not found"})
//             }

//             restaurant.isAvailable = !restaurant.isAvailable

//             await restaurant.save()
//             res.status(200).json({status: true, message: "Availability successfully toggled", isAvailable: restaurant.isAvailable} )
//         } catch (error) {
//             res.status(500).json({status: false, message:"Error toggling restaurant availability"}) 
//         }
//     },

//     deleteRestaurant: async(req, res) => {
//         const restaurantId = req.params.id;

//         try {
//             const restaurant = await Restaurant.findById(restaurantId)

//             if(!restaurant){
//                 return res.status(403).json({status: false, message: "Restaurant not found"})
//             }
            
//             await Restaurant.findByIdAndDelete(restaurantId)
//             res.status(200).json({status: true, message: "Restaurant successfully deleted"} )
//         } catch (error) {
//             res.status(500).json({status: false, message:"Error deleting restaurant"}) 
//         }
//     },

//     getRestaurant: async (req, res)=> {
//         const restaurantId = req.params.id

//         try {
//             const restaurant = await Restaurant.findById(restaurantId)

//             if(!restaurant){
//                 return res.status(404).json({status: false, message: "Restaurant not found"})
//             }

//             res.status(200).json(restaurant)
//         } catch (error) {
//             res.status(500).json({status: false, message:"Error retrieving the restaurant"})  
//         }
//     },

//     getRandomRestaurants: async (req, res) => {
//         try {
//             let randomRestaurant = [];

//             if(req.params.code){
//                 randomRestaurant = await Restaurant.aggregate([
//                     {$match: {code: req.params.code}},
//                     {$sample: {size: 5}},
//                     {$project: {__v: 0}}
//                 ]);
//             }

//             if(!randomRestaurant.length){
//                 randomRestaurant = await Restaurant.aggregate([
//                     {$sample: {size: 5}},
//                     {$project: {__v: 0}}
//                 ]);
//             }

//             if(randomRestaurant.length){
//                 res.status(200).json(randomRestaurant)
//             }

//         } catch (error) {
//             res.status(500).json({status: false, message:"Error finding restaurants "}) 
//         }
//     }
// }

const Restaurant =require("../models/Restaurant")
const User = require('../models/User')
module.exports ={
     addRestaurant: async (req, res) => {
        console.log(req.body);
        const owner = req.user.id;

        const existingRestaurant = await Restaurant.findOne({ owner: owner });
        if (existingRestaurant) {
            return res.status(400).json({ status: false, message: 'Restaurant with this code already exists', data: existingRestaurant });
        }

        const newRestaurant = new Restaurant(req.body);

    
        try {
            const data = await newRestaurant.save();
            await User.findByIdAndUpdate(
                owner,
                { userType: "Vendor" },
                { new: true, runValidators: true });
            res.status(201).json(data);
        } catch (error) {
            console.log(error.message);
            res.status(500).json(error.message);
        }
    },

    getNearbyRestaurants: async (req, res) => {
        const latitude = parseFloat(req.query.lat);
        const longitude = parseFloat(req.query.lng);
        const radius = 5000; 
        const limit = 5;
    
        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        };
    
        try {
            const restaurants = await Restaurant.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [longitude, latitude] },
                        distanceField: "distance",
                        maxDistance: radius, 
                        spherical: true,
                    }
                },
                {
                    $limit: limit 
                }
            ]);
    
            return res.status(200).json(restaurants);
        } catch (error) {
            console.error("Failed to retrieve food items:", error);
            return res.status(500).json({ message: "Server error", error });
        }
    },


     getRandomRestaurants: async (req, res) => {
        try {
            let randomRestaurants = [];
    
            
            if (req.params.code) {
                randomRestaurants = await Restaurant.aggregate([
                    { $match: { code: req.params.code } },
                    { $sample: { size: 5 } },
                    { $project: {  __v: 0 } }
                ]);
            }
            
            
            if (!randomRestaurants.length) {
                randomRestaurants = await Restaurant.aggregate([
                    { $sample: { size: 5 } },
                    { $project: {  __v: 0 } }
                ]);
            }
    
            
            if (randomRestaurants.length) {
               
                res.status(200).json(randomRestaurants);
            } else {
                res.status(404).json({ message: 'No restaurants found' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },

     serviceAvailability: async (req, res) => {
        const restaurantId = req.params; 
    
        try {
            
            const restaurant = await Restaurant.findById(restaurantId);
    
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }
    
            
            restaurant.isAvailable = !restaurant.isAvailable;
    
           
            await restaurant.save();
    
            res.status(200).json({ message: 'Availability toggled successfully', isAvailable: restaurant.isAvailable });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    deleteRestaurant: async (req, res) => {
        const id  = req.params;
    
        if (!id) {
            return res.status(400).json({ status: false, message: 'Restaurant ID is required for deletion.' });
        }
    
        try {
            await Restaurant.findByIdAndRemove(id);
    
            res.status(200).json({ status: true, message: 'Restaurant successfully deleted' });
        } catch (error) {
            console.error("Error deleting Restaurant:", error);
            res.status(500).json({ status: false, message: 'An error occurred while deleting the restaurant.' });
        }
    },
    getRestaurant: async (req, res) => {
        const id = req.params.id;
        console.log(id);

        try {
            const restaurant = await Restaurant.findById(id) 

            if (!restaurant) {
                return res.status(404).json({ status: false, message: 'restaurant item not found' });
            }

            res.status(200).json(restaurant);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getRestaurantByOwner: async (req, res) => {
       
        try {
            const restaurant = await Restaurant.findOne({owner: req.user.id}) 


            if (!restaurant) {
                return res.status(404).json({ status: false, message: 'restaurant item not found' });
            }

            res.status(200).json(restaurant);
        } catch (error) {
            res.status(500).json({status: false, message: error.message });
        }
    },
    
}