const Address = require("../models/Address");


exports.createAddress = async (req, res) => {
    try {
        const userId = req.user?._id || null;

        if (req.body.is_default && userId) {
            await Address.updateMany(
                { user: userId },
                { $set: { is_default: false } }
            );
        }

        const address = await Address.create({
            ...req.body,
            user: userId
        });

        return res.status(201).json({
            success: true,
            message: "Address created successfully",
            data: address
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get All Addresses
 */
exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user?._id;

        const addresses = await Address.find({
            user: userId,
            is_active: true
        }).sort({
            is_default: -1,
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: addresses.length,
            data: addresses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get Single Address
 */
exports.getAddressById = async (req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            is_active: true
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: address
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update Address
 */
exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findById(id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        if (req.body.is_default && address.user) {
            await Address.updateMany(
                { user: address.user },
                { $set: { is_default: false } }
            );
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: updatedAddress
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete Address (Soft Delete)
 */
exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findByIdAndUpdate(
            id,
            {
                is_active: false
            },
            {
                new: true
            }
        );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Set Default Address
 */
exports.setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const address = await Address.findOne({
            _id: id,
            user: userId,
            is_active: true
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        await Address.updateMany(
            { user: userId },
            { $set: { is_default: false } }
        );

        address.is_default = true;
        await address.save();

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            data: address
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};