const router = require("express").Router();
const restaurantController = require("../controllers/restaurantController");
const { verifyTokenAndAuthorization} = require("../middleware/verifyToken");

router.get("/byId/:id", restaurantController.getRestaurant);


router.post("/",verifyTokenAndAuthorization,  restaurantController.addRestaurant);
router.get("/nearby",  restaurantController.getNearbyRestaurants);

router.get("/owner/profile",verifyTokenAndAuthorization,  restaurantController.getRestaurantByOwner);


router.patch("/:id", restaurantController.serviceAvailability);




router.get("/:code", restaurantController.getRandomRestaurants);









module.exports = router