const router = require('express').Router();
const foodController = require('../controllers/foodController')
const { verifyVendor } = require('../middleware/verifyToken')

router.post('/', verifyVendor, foodController.addFood)

router.post('/tag/:id', verifyVendor, foodController.addFoodTag)

router.post('/type/:id', verifyVendor, foodController.addFoodType)

router.get('/:id', foodController.getFoodById)

router.get('/:category/:code', foodController.getRandomByCategoryAndCode)

router.delete('/:id', verifyVendor, foodController.deleteFoodById)

router.patch('/:id', verifyVendor, foodController.foodAvailability)

router.get("/restaurant/:restaurantId", foodController.getFoodsByRestaurant)





module.exports = router;