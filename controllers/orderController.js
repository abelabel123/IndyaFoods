const Order = require("../models/Order")
const User = require("../models/User")
const Driver = require("../models/Driver");
const Restaurant = require("../models/Restaurant");
module.exports = {
    placeOrder: async (req, res) => {

        try {
            
            const orderItems = req.body.orderItems.map(orderItem => ({...orderItem,
                additives: orderItem.addittives.map(additive => ({
                    id: additive.id,
                    title: additive.title,
                    price: additive.price
                }))
            }));
    
            // Construct the order object with the modified orderItems
            const orderData = {
                ...req.body,
                orderItems
            };
    
            // Create a new Order instance with the constructed orderData
            const order = new Order(orderData);
    
            // Save the order
            await order.save();
            console.log("my order ",order);
            // Send response
            res.status(201).json({ status: true, message: 'Order placed successfully', data: order });
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },
    

    getOrderDetails: async (req, res) => {
        const orderId  = req.params.id;
    
        try {
            const order = await Order.findById(orderId)
                .populate({
                    path: 'userId',
                    select: 'name email'  // Fetch only the name and email of the user
                })
                .populate({
                    path: 'deliveryAddress',
                    select: 'addressLine1 city state postalCode latitude longitude'  // Fetch specific address fields
                })
                .populate({
                    path: 'restaurantId',
                    select: 'name location'  // Fetch the name and location of the restaurant
                })
                .populate({
                    path: 'driverId',
                    select: 'name phone'  // Fetch only the name and phone of the driver
                });
    
            if (order) {
                res.status(200).json({ status: true, data: order });
            } else {
                res.status(404).json({ status: false, message: 'Order not found' });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    deleteOrder: async (req, res) => {
        const { orderId } = req.params;
    
        try {
            await Order.findByIdAndDelete(orderId);
            res.status(200).json({ status: true, message: 'Order deleted successfully' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getUserOrders: async (req, res) => {
        const userId = req.user.id;
        try {
            const orders = await Order.find({ userId }).populate('restaurantId').populate('driverId');
            res.status(200).json({ status: true, data: orders });
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },

    rateOrder: async (req, res) => {
        const orderId  = req.params.id;
        const { rating, feedback } = req.body;
    
        try {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { rating, feedback }, { new: true });
            if (updatedOrder) {
                res.status(200).json({ status: true, message: 'Rating and feedback added successfully', data: updatedOrder });
            } else {
                res.status(404).json({ status: false, message: 'Order not found' });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    updateOrderStatus: async (req, res) => {
        const  orderId = req.params.id;
        const {orderStatus}  = req.body;
    
        try {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus }, { new: true });
            if (updatedOrder) {
                res.status(200).json({ status: true, message: 'Order status updated successfully', data: updatedOrder });
            } else {
                res.status(404).json({ status: false, message: 'Order not found' });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    updatePaymentStatus: async (req, res) => {
        const orderId  = req.params.id;
        const { paymentStatus } = req.body;
    
        try {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { paymentStatus }, { new: true });
            if (updatedOrder) {
                res.status(200).json({ status: true, message: 'Payment status updated successfully', data: updatedOrder });
            } else {
                res.status(404).json({ status: false, message: 'Order not found' });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getRestaurantOrdersList: async (req, res) => {
        let status
        if (req.query.status === 'placed') {
            status = "Placed"
        } else if (req.query.status === 'preparing') {
            status = "Preparing"
        } else if (req.query.status === 'ready') {
            status = "Ready"
        } else if (req.query.status === 'out_for_delivery') {
            status = "Out_for_Delivery"
        } else if (req.query.status === 'delivered') {
            status = "Delivered"
        } else if (req.query.status === 'manual') {
            status = "Manual"
        } else if (req.query.status === 'cancelled') {
            status = "Cancelled"
        }
        console.log(req.query.status, req.params.id);
        try {  
            const parcels = await Order.find({
                orderStatus: status, restaurantId: req.params.id, 
                $or:[{paymentStatus:'Completed'}, {paymentStatus:'Pending'}]
            }).select('userId deliveryAddress orderItems deliveryFee restaurantId orderStatus restaurantCoords recipientCoords paymentStatus')
                .populate({
                    path: 'userId',
                    select: 'phone profile' 
                }).populate({
                    path: 'restaurantId',
                    select: 'title imageUrl logoUrl time' 
                })
                .populate({
                    path: 'orderItems.foodId',
                    select: 'title imageUrl time' 
                }).populate({
                    path: 'deliveryAddress',
                    select: 'addressLine1 latitude longitude' 
                })

            res.status(200).json(parcels);
        } catch (error) {
            res.status(500).json({ status: false, message: 'Error retrieving parcels', error: error.message });
        }
    },

    processOrder: async (req, res) => {
        const orderId = req.params.id;
        const status = req.params.status;
        console.log(" ", orderId, " ", status)
        try {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true }).select('userId deliveryAddress orderItems deliveryFee restaurantId restaurantCoords recipientCoords orderStatus')
                .populate({
                    path: 'userId',
                    select: 'phone profile' // Replace with actual field names for suid
                })
                .populate({
                    path: 'restaurantId',
                    select: 'title coords imageUrl logoUrl time' // Replace with actual field names for courier
                })
                .populate({
                    path: 'orderItems.foodId',
                    select: 'title imageUrl time' // Replace with actual field names for courier
                })
                .populate({
                    path: 'deliveryAddress',
                    select: 'addressLine1 city district' // Replace with actual field names for courier
                });

            const user = await User.findById(updatedOrder.userId._id, { fcm: 1 })

            // if (user) {
            //     if (updatedOrder) {

            //         const data = {
            //             orderId: updatedOrder._id.toString(),
            //             messageType: 'order'
            //         };

            //         if (status === 'Preparing') {
            //             if (user.fcm || user.fcm !== null || user.fcm !== '') {
            //                 sendNotification(user.fcm, "👩‍🍳 Order Accepted and Preparing", data, `Your order is being prepared and will be ready soon`)
            //             }
            //         } else if (status === 'Ready') {
            //             if (user.fcm || user.fcm !== null || user.fcm !== '') {
            //                 sendNotificationToTopic(data);
            //                 sendNotification(user.fcm, "🚚 Order Awaits Pick Up", data, `Your order prepared and is waiting to be picked up`)

            //             }
            //         } else if (status === 'Out_for_Delivery' || status === 'Manual') {
            //             if (user.fcm || user.fcm !== null || user.fcm !== '') {
            //                 sendNotification(user.fcm, "🚚 Order Picked Up and Out for Delivery", data, `Your order has been picked up and now getting delivered.`)
            //             }
            //         } else if (status === 'Delivered') {

            //             await Restaurant.findByIdAndUpdate(updatedOrder.restaurantId._id, {
            //                 $inc: { earnings: updatedOrder.orderTotal }
            //             }, { new: true });

            //             if (user.fcm || user.fcm !== null || user.fcm !== '') {
            //                 sendNotification(user.fcm, "🎊 Food Delivered 🎉", data, `Thank you for ordering from us! Your order has been successfully delivered.`)
            //             }
            //         } else if (status === 'Cancelled') {
            //             if (user.fcm || user.fcm !== null || user.fcm !== '') {
            //                 sendNotification(user.fcm, `💔 Order Cancelled`, data, `Your order has been cancelled. Contact the restaurant for more information`)
            //             }
            //         }


            //         res.status(200).json(updatedOrder);
            //     } else {
            //         res.status(404).json({ status: false, message: 'Order not found' });
            //     }
            // }
            res.status(200).json(updatedOrder);

        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getNearbyOrders: async (req, res) => {
        try {
            console.log(req.params.status);
            const parcels = await Order.find({
                orderStatus: req.params.status, paymentStatus: 'Completed'
            }).select('userId deliveryAddress orderItems deliveryFee restaurantId restaurantCoords recipientCoords orderStatus')
                .populate({
                    path: 'userId',
                    select: 'phone profile' // Replace with actual field names for suid
                })
                .populate({
                    path: 'restaurantId',
                    select: 'title coords imageUrl logoUrl time' // Replace with actual field names for courier
                })
                .populate({
                    path: 'orderItems.foodId',
                    select: 'title imageUrl time' // Replace with actual field names for courier
                })
                .populate({
                    path: 'deliveryAddress',
                    select: 'addressLine1 city district latitude longitude' // Replace with actual field names for courier
                })
                console.log(parcels);
            res.status(200).json(parcels);
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: false, message: 'Error retrieving parcels', error: error.message });
        }
    },
    //pick orders
    addDriver: async (req, res) => {
        const orderId = req.params.id;
        const driver = req.params.driver;
        const status = 'Out_for_Delivery';
    
        try {
            console.log(`Assigning order ${orderId} to driver ${driver}`);
    
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: 'Out_for_Delivery', driverId: driver }, { new: true })
                .select('userId deliveryAddress orderItems deliveryFee restaurantId restaurantCoords recipientCoords orderStatus')
                .populate({
                    path: 'userId',
                    select: 'phone profile fcm' // Replace with actual field names for suid
                })
                .populate({
                    path: 'restaurantId',
                    select: 'title coords imageUrl logoUrl time' // Replace with actual field names for courier
                })
                .populate({
                    path: 'orderItems.foodId',
                    select: 'title imageUrl time' // Replace with actual field names for courier
                })
                .populate({
                    path: 'deliveryAddress',
                    select: 'addressLine1 city district' // Replace with actual field names for courier
                });
    
            const user = await User.findById(updatedOrder.userId._id, { fcm: 1 });
    
            if (updatedOrder) {
                // const data = {
                //     orderId: updatedOrder._id.toString(),
                //     messageType: 'order'
                // };
                // const db = admin.database();
    
                // if (user.fcm || user.fcm !== null || user.fcm !== '') {
                //     sendNotification(user.fcm, "🚚 Order Picked Up and Out for Delivery", data, `Your order has been picked up and now getting delivered.`);
                // }
    
                // updateUser(updatedOrder, db, status);
                res.status(200).json(updatedOrder);
            } else {
                res.status(404).json({ status: false, message: 'Order not found' });
            }
        } catch (error) {
            console.error("Error updating order:", error);
            res.status(500).json({ status: false, message: error.message });
        }
    },
    //get picked orders
    getPickedOrders: async (req, res) => {

        let status
        if (req.params.status === 'Out_for_Delivery') {
            status = "Out_for_Delivery"
        } else if (req.params.status === 'Delivered') {
            status = "Delivered"
        } else if (req.params.status === 'Manual') {
            status = "Manual"
        } else {
            status = "Cancelled"
        }
        try {
            const parcels = await Order.find({
                orderStatus: status, driverId: req.params.driver
            }).select('userId deliveryAddress orderItems deliveryFee restaurantId restaurantCoords recipientCoords orderStatus')
                .populate({
                    path: 'userId',
                    select: 'phone profile' // Replace with actual field names for suid
                })
                .populate({
                    path: 'restaurantId',
                    select: 'title coords imageUrl logoUrl time' // Replace with actual field names for courier
                })
                .populate({
                    path: 'orderItems.foodId',
                    select: 'title imageUrl time' // Replace with actual field names for courier
                })
                .populate({
                    path: 'deliveryAddress',
                    select: 'addressLine1' // Replace with actual field names for courier
                })

            res.status(200).json(parcels);
        } catch (error) {
            res.status(500).json({ status: false, message: 'Error retrieving parcels', error: error.message });
        }
    },
     markAsDelivered : async (req, res) => {
        const orderId = req.params.id;
        const status = 'Delivered';
        const userId = req.user.id;
    
        try {
           // console.log(`Received request to mark order ${orderId} as delivered by user ${userId}`);
    
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: 'Delivered' }, { new: true })
                .select('userId orderTotal deliveryAddress orderItems deliveryFee restaurantId restaurantCoords recipientCoords orderStatus')
                .populate({
                    path: 'userId',
                    select: 'phone profile fcm' // Replace with actual field names for suid
                })
                .populate({
                    path: 'restaurantId',
                    select: 'title coords imageUrl logoUrl time' // Replace with actual field names for courier
                })
                .populate({
                    path: 'orderItems.foodId',
                    select: 'title imageUrl time' // Replace with actual field names for courier
                })
                .populate({
                    path: 'deliveryAddress',
                    select: 'addressLine1' // Replace with actual field names for courier
                });
    
           // console.log(`Updated order: ${JSON.stringify(updatedOrder)}`);
    
            if (updatedOrder) {
                const restaurantUpdateResult = await Restaurant.findByIdAndUpdate(updatedOrder.restaurantId._id, {
                    $inc: { earnings: updatedOrder.orderTotal }
                }, { new: true });
    
              //  console.log(`Updated restaurant earnings: ${JSON.stringify(restaurantUpdateResult)}`);
    
                const driver = await Driver.findOne({ driver: userId });
              //  console.log(`Found driver: ${JSON.stringify(driver)}`);
    
                if (driver) {
                    driver.totalDeliveries += 1;
                    driver.totalEarnings += updatedOrder.deliveryFee;
                    await driver.save();
                  //  console.log(`Updated driver: ${JSON.stringify(driver)}`);
                }
    
                // Assuming sending notification and updating database
                // Uncomment and add actual functions if needed
                /*
                const db = admin.database();
                updateRestaurant(updatedOrder, db, status);
                updateUser(updatedOrder, db, status);
    
                const user = await User.findById(updatedOrder.userId._id, { fcm: 1 });
                console.log(`Found user: ${JSON.stringify(user)}`);
    
                if (user && user.fcm) {
                    sendNotification(user.fcm, "🎊 Food Delivered 🎉", data, `Thank you for ordering from us! Your order has been successfully delivered.`);
                    console.log(`Notification sent to user: ${user._id}`);
                }
                */
    
                res.status(200).json(updatedOrder);
            } else {
                console.log('Order not found');
                res.status(404).json({ status: false, message: 'Order not found' });
            }
        } catch (error) {
            console.error(`Error in marking order as delivered: ${error.message}`);
            res.status(500).json({ status: false, message: error.message });
        }
    }
    
}