// const User = require('../models/User')


// module.exports = {
//     getUser: async (req, res) => {
//         const userId = req.user.id
//         try {
//             const user = await User.findById({ _id: userId }, { password: 0, __v: 0, createdAt: 0, updatedAt: 0 })
//             res.status(200).json(user)
//         } catch (error) {
//             res.status(500).json({ message: 'error retrieving user', error: error.message })
//         }
        

//     },

//     deleteUser: async (req, res) => {
//         const userId = req.user.id
//         try {
//             await User.findByIdAndDelete(userId)
//             res.status(200).json({ status: true, message: "User deleted successfully" })
//         } catch (error) {
//             res.status(500).json({ message: 'error deleting user' })
//         }
//     },

//     updateUser: async (req, res) => {
//         const userId = req.user.id

//         try {
//             await User.findByIdAndUpdate(userId, {
//                 $set: req.body
//             }, { new: true })
//             res.status(200).json({ status: true, message: "User updated successfully" })
//         } catch (error) {
//             res.status(500).json({ message: 'error updating user' })
//         }
//     }
// }

const User = require("../models/User");
const admin = require('firebase-admin')
module.exports = {
  updateUser: async (req, res) => {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET
      ).toString();
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      const { password, __v, createdAt, ...others } = updatedUser._doc;

      res.status(200).json({ ...others });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.user.id);
      res.status(200).json("Successfully Deleted");
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const { password, __v, createdAt, ...userdata } = user._doc;
      res.status(200).json(userdata);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const allUser = await User.find();

      res.status(200).json(allUser);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  verifyAccount: async (req, res) => {
    const providedOtp = req.params.otp;
    console.log(providedOtp);
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      // Check if user exists and OTP matches
      if (user.otp === providedOtp) {
        await User.findByIdAndUpdate(
          req.user.id,
          { verified: true, otp: "none" },
          { new: true }
        );
        const user = await User.findById(req.user.id);
        const { password, __v, otp, createdAt, ...others } = user._doc;
        return res.status(200).json({ ...others });
      } else {
        return res
          .status(400)
          .json({ status: false, message: "OTP verification failed" });
      }
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  verifyPhone: async (req, res) => {
    const phone = req.params.phone;
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      user.phoneVerification = true;
      user.phone = phone; // Optionally reset the OTP
      await user.save();

      const { password, __v, otp, createdAt, ...others } = user._doc;
      return res.status(200).json({ ...others });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  updateFcm: async (req, res) => {
    const token = req.params.token;

    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      user.fcm = token;

      if (user.userType == "Driver") {
        await admin.messaging().subscribeToTopic(user.fcm, "delivery");
      }

      await user.save();
      return res
        .status(200)
        .json({ status: true, message: "FCM token updated successfully" });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  sendPushNotification: async (req, res) => {
    const body = req.body;
    console.log('sendPushNotification data', req.body);
    
    const message = {
      notification: {
        title: body.title,
        body: body.messageBody,
      },
      data: body.data,
      token: body.deviceToken,
    };

    try {
      await admin.messaging().send(message).then(response => {
        console.info('Successfully sent message:', response);
      })
      .catch(error => {
        console.info('Error sending message:', error);
      });;
      console.log("Push notification sent successfully", message
    );
    } catch (error) {
      console.log("Error:", "Error sending push notification:", error);
    }
  },
};
