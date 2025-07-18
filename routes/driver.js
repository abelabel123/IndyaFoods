const router = require("express").Router();
const driverController = require("../controllers/driverController");
const {verifyTokenAndAuthorization, verifyToken}= require("../middleware/verifyToken")



// UPDATE DRIVER
router.post('/', verifyToken, driverController.registerDriver);
// DELETE DRIVER
router.delete("/:id", driverController.deleteDriver);

// UPDATE DRIVER
router.put("/:id", driverController.updateDriverDetails);

// GET DRIVER
router.get("/:id", driverController.getDriverDetails);

// TOGGLE DRIVER AVAILABILITY
router.patch("/availability/:id", driverController.setDriverAvailability);


module.exports = router;
