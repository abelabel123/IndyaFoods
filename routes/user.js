const router = require("express").Router();
const userController = require("../controllers/userController");
const {verifyTokenAndAuthorization, verifyAdmin}= require("../middleware/verifyToken")

router.post("/sendNotification", userController.sendPushNotification);

// UPADATE USER
router.put("/",verifyTokenAndAuthorization, userController.updateUser);

// DELETE USER
router.get("/verify/:otp",verifyTokenAndAuthorization, userController.verifyAccount);

router.delete("/" , verifyTokenAndAuthorization, userController.deleteUser);

// GET USER

router.get("/",verifyTokenAndAuthorization, userController.getUser);

// Add Skills

router.get("/verify_phone/:phone",verifyTokenAndAuthorization, userController.verifyPhone);

router.put("/updateToken/:token",verifyTokenAndAuthorization, userController.updateFcm);



module.exports = router