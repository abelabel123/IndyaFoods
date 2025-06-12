const Address = require('../models/Address')


module.exports = {
    createAddress: async (req, res) => {

        const address = new Address({
            userId: req.user.id,
            addressLine1: req.body.addressLine1,
            city: req.body.city,
            state: req.body.state,
            district: req.body.district,
            postalCode: req.body.postalCode,
            country: req.body.country,
            deliveryInstructions: req.body.deliveryInstructions,
            default: req.body.default
        })

        try {
            if (req.body.default) {
                await Address.updateMany({ userId: req.user.id }, { default: false })
            }

            await address.save()
            res.status(201).json({ status: true, message: 'Address added successfully' })
        } catch (error) {
            res.status(500).json({ status: false, message: error.message })
        }
    },
    
    deleteAddress: async (req, res) => {
        const addressId = req.params.id;

        try {
            const address = await Address.findById(addressId)

            if (!address) {
                return res.status(404).json({ status: false, message: "Address not found" })
            }

            await Address.findByIdAndDelete(addressId)
            res.status(200).json({ status: true, message: 'Address deleted successfully' })
        } catch (error) {
            res.status(500).json({ status: false, message: error.message })

        }
    },

    getDefaultAddress: async (req, res) => {
        const userId = req.user.id;

        try {
            const defaultAddress = await Address.findOne({ userId, default: true })

            res.status(200).json(defaultAddress)
        } catch (error) {
            res.status(500).json({ status: false, message: error.message })
        }
    },

    getUserAddresses: async (req, res) => {
        const userId = req.user.id;

        try {
            const address = await Address.find({ userId })

            res.status(200).json(address)
        } catch (error) {
            res.status(500).json({ status: false, message: error.message })
        }
    },

    updateAddress: async (req, res) => {
        const addressId = req.params.id;
        const address = new Address({
            userId: req.user.id,
            addressLine1: req.body.addressLine1,
            city: req.body.city,
            state: req.body.state,
            district: req.body.district,
            postalCode: req.body.postalCode,
            country: req.body.country,
            deliveryInstructions: req.body.deliveryInstructions,
            default: req.body.default
        })

        try {
            if (req.body.default) {
                await Address.updateMany({ userId: req.user.id }, { default: false })
            }

            await Address.findByIdAndUpdate(addressId, address, { new: true })

            res.status(201).json({ status: true, message: 'Address updated successfully' })
        } catch (error) {
            res.status(500).json({ status: false, message: error.message })
        }
    },

    setDefaultAddress: async (req, res) => {
        const addressId = req.body.addressId;
        const userId = req.user.id;

        try {
            await Address.updateMany({userId}, {default: false})

            const updatedAddress = await Address.findByIdAndUpdate(addressId, {default: true}, {new: true})

            if(updatedAddress){
                res.status(200).json({ status: true, message: 'Address updated successfully' }) 
            }else{
                res.status(404).json({ status: false, message: 'Address not found' })
            }
        } catch (error) {
            
        }
     },
}