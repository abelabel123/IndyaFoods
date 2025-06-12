const router = require("express").Router();
const ordersController = require("../controllers/orderController");
const {verifyTokenAndAuthorization,verifyVendor,verifyDriver, verifyAdmin}= require("../middleware/verifyToken")

router.get("/userOrders",verifyTokenAndAuthorization,  ordersController.getUserOrders)
router.get("/orderslist/:id", ordersController.getRestaurantOrdersList)

router.post("/",verifyTokenAndAuthorization, ordersController.placeOrder)
router.get("/:id", ordersController.getOrderDetails)
router.delete("/:id", ordersController.deleteOrder)
router.post("/rate/:id", ordersController.rateOrder)
router.post("/status/:id", ordersController.updateOrderStatus)
router.post("/payment-status/:id", ordersController.updatePaymentStatus)
router.put("/process/:id/:status", verifyVendor, ordersController.processOrder)
router.get("/delivery/:status",  ordersController.getNearbyOrders)
router.put("/picked-orders/:id/:driver", verifyDriver, ordersController.addDriver)
router.get("/picked/:status/:driver",verifyDriver, ordersController.getPickedOrders)
router.put("/delivered/:id", verifyDriver, ordersController.markAsDelivered)

module.exports = router;