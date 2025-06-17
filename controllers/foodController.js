const Food = require('../models/Foods')

module.exports = {
    addFood: async (req, res) => {
        const newFood = new Food(req.body)

        try {
            await newFood.save();

            res.status(200).json({ status: true, message: "Food item added successfully" })
        } catch (error) {
            res.status(500).json({ status: false, message: error.message })
        }
    },

    getFoodById: async (req, res) => {
        const foodId = req.params.id;

        try {
            const food = await Food.findById(foodId)

            if (!food) {
                return res.status(404).json({ status: false, message: "Food not found" })
            }

            res.status(200).json(food)
        } catch (error) {
            res.status(500).json({ status: false, message: "failed to get a food items" })
        }
    },
    getFoodNearby: async (req, res) => {
            const latitude = parseFloat(req.query.lat);
            const longitude = parseFloat(req.query.lng);
            const radius = 5000; // Radius in meters
            const limit = 5;
    
            if (!latitude || !longitude) {
                return res.status(400).json({ status: false, message: 'Latitude and longitude are required' });
            }
        
            try {
                const food = await Food.aggregate([
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
        
                return res.status(200).json(food);
            } catch (error) {
                console.error("Failed to retrieve food items:", error);
                return res.status(500).json({ message: "Server error", error });
            }
        },

   getFoodsByRestaurant: async (req, res) => {
           const restaurantId = req.params.restaurantId;
   
           try {
               const foods = await Food.find({ restaurant: restaurantId });
   
               if (!foods || foods.length === 0) {
                   return res.status(404).json({ status: false, message: 'No food items found for this restaurant' });
               }
   
               res.status(200).json(foods);
           } catch (error) {
               res.status(500).json(error);
           }
       },

       getFoodListByRestaurant: async (req, res) => {
            
                const restaurantId = req.params.restaurantId;
       
               try {
                   const foods = await Food.find({ restaurant: restaurantId });
       
                   if (!foods || foods.length === 0) {
                       return res.status(404).json({ status: false, message: 'No food items found for this restaurant' });
                   }
       
                   res.status(200).json(foods);
               } catch (error) {
                   res.status(500).json(error);
               }
             },



    deleteFoodById: async (req, res) => {
        const foodId = req.params.id;

        try {
            const food = await Food.findById(foodId);

            if (!food) {
                return res.status(404).json({ status: false, message: "Food item not found" })
            }

            await Food.findByIdAndDelete(foodId)
            res.status(200).json({ status: true, message: "Food item deleted sucessfully" })
        } catch (error) {
            res.status(500).json({ status: false, message: error.message })
        }
    },

    foodAvailability: async (req, res) => {
        const foodId = req.params.id;

        try {
            const food = await Food.findById(foodId);

            if (!food) {
                return res.status(404).json({ status: false, message: "Food item not found" })
            }

            food.isAvailable = !food.isAvailable;

            await food.save();

            res.status(200).json({ status: true, message: "Food availability successfully toggled" })
        } catch (error) {
            res.status(500).json({ status: false, message: error.message })
        }
    },


    updateFoodById: async (req, res) => {
        const foodId = req.params.id;

        try {
            const updatedFood = await Food.findByIdAndUpdate(
                foodId,
                req.body,
                { new: true, runValidators: true });

            if (!updatedFood) {
                return res.status(404).json({ status: false, message: "Food item not updated" })
            }

            res.status(200).json({ status: true, message: "Food item successfully updated" })
        } catch (error) {
            res.stat(500).json({ status: false, message: error.message })
        }
    },

    addFoodTag: async (req, res) => {
        const foodId = req.params.id;
        const { tag } = req.body

        try {
            const food = await Food.findById(foodId)

            if (!food) {
                return res.status(404).json({ status: false, message: "Food item not found" })
            }

            if (food.foodTags.includes(tag)) {
                return res.status(400).json({ status: false, message: "Tag already exist" })
            }

            food.foodTags.push(tag)
            await food.save();
            res.status(200).json({ status: true, message: "Food tag successfully added" })
        } catch (error) {
            res.status(500).json({ status: false, message: error.message })
        }
    },


    getRandomFoodsByCode: async (req, res) => { 
        try {
            const randomFoodItem = await Food.aggregate([
                {$match: {code: req.params.code}},
                {$sample: {size: 5}},
                {$project: {_id: 0}}
            ]);

            res.status(200).json(randomFoodItem)
        } catch (error) {
          res.status(500).json({status: false, message: error.message})  
        }
    },

    addFoodType: async (req, res) => {
        const foodId = req.params.id;
        const foodType = req.body.foodType;

        try {
            const food = await Food.findById(foodId)

            if(!food) {
                return res.status(404).json({status: false, message: error.message})
            }

            if(food.foodType.includes(foodType)){
                return res.status(400).json({ status: false, message: "Food type already exist" })
            }

            food.foodType.push(foodType);

            await food.save();
            res.status(200).json({status: true, message: "Type addded successfully"})
        } catch (error) {
            res.status(500).json({status: false, message: error.message});
        }
     },

    getRandomByCategoryAndCode: async (req, res) => { 
        const {category, code} = req.params;

        try {
            let foods = await Food.aggregate([
                {$match: {category: category, code: code}},
                {$sample: {size: 10}}
            ]);

            if(!foods || foods.length === 0){
                foods = await Food.aggregate([
                    {$match: { code: code}},
                    {$sample: {size: 10}}
                ]); 
            }else{
                foods = await Food.aggregate([
                    {$sample: {size: 10}}
                ]);
            }

            res.status(200).json(foods)
        } catch (error) {
           res.status(500).json({status: false, message: error.message}) 
        }
    },
}