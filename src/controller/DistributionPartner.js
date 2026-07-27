const mongoose = require("mongoose");
const DistributionPartner = require("../models/DistributionPartner"); // adjust path as needed

/**
 * Helper: standard error responder
 */
const handleError = (res, err, defaultStatus = 500) => {
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    if (err.name === "CastError") {
        return res.status(400).json({ success: false, message: `Invalid value for field '${err.path}'` });
    }
    if (err.code === 11000) {
        return res.status(409).json({ success: false, message: "Duplicate value", keyValue: err.keyValue });
    }
    console.error(err);
    return res.status(defaultStatus).json({ success: false, message: "Something went wrong" });
};

/**
 * @desc    Create a new distribution partner application
 * @route   POST /api/distribution-partners
 * @access  Public
 */
exports.createDistributionPartner = async (req, res) => {
    try {
        const partner = await DistributionPartner.create(req.body);
        return res.status(201).json({ success: true, data: partner });
    } catch (err) {
        return handleError(res, err);
    }
};

/**
 * @desc    Get all distribution partners (with pagination, filtering, search)
 * @route   GET /api/distribution-partners
 * @query   page, limit, status, search, sort
 * @access  Private (admin)
 */
exports.getAllDistributionPartners = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.industry) {
            filter.industries_served = req.query.industry;
        }

        if (req.query.search) {
            const regex = new RegExp(req.query.search, "i");
            filter.$or = [
                { organization_name: regex },
                { city: regex },
                { state: regex },
                { country: regex },
                { email: regex },
            ];
        }

        const sortField = req.query.sort || "-createdAt";

        const [partners, total] = await Promise.all([
            DistributionPartner.find(filter).sort(sortField).skip(skip).limit(limit),
            DistributionPartner.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: partners,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        return handleError(res, err);
    }
};

/**
 * @desc    Get a single distribution partner by ID
 * @route   GET /api/distribution-partners/:id
 * @access  Private (admin)
 */
exports.getDistributionPartnerById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid partner ID" });
        }

        const partner = await DistributionPartner.findById(id);

        if (!partner) {
            return res.status(404).json({ success: false, message: "Distribution partner not found" });
        }

        return res.status(200).json({ success: true, data: partner });
    } catch (err) {
        return handleError(res, err);
    }
};

/**
 * @desc    Update a distribution partner (full/partial update of application data)
 * @route   PUT /api/distribution-partners/:id
 * @access  Private (admin) or Public (if allowing applicant edits before review)
 */
exports.updateDistributionPartner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid partner ID" });
        }

        const partner = await DistributionPartner.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true, context: "query" }
        );

        if (!partner) {
            return res.status(404).json({ success: false, message: "Distribution partner not found" });
        }

        return res.status(200).json({ success: true, data: partner });
    } catch (err) {
        return handleError(res, err);
    }
};

/**
 * @desc    Update only the status of a distribution partner application
 * @route   PATCH /api/distribution-partners/:id/status
 * @access  Private (admin)
 */
exports.updateDistributionPartnerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid partner ID" });
        }

        const allowedStatuses = ["new", "reviewed", "contacted", "rejected", "approved"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${allowedStatuses.join(", ")}`,
            });
        }

        const partner = await DistributionPartner.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true, runValidators: true }
        );

        if (!partner) {
            return res.status(404).json({ success: false, message: "Distribution partner not found" });
        }

        return res.status(200).json({ success: true, data: partner });
    } catch (err) {
        return handleError(res, err);
    }
};




/**
 * @desc    Delete a distribution partner
 * @route   DELETE /api/distribution-partners/:id
 * @access  Private (admin)
 */



exports.deleteDistributionPartner = async (req, res) => {
    try {
        const { id } = req.params;

        const distributor = await DistributionPartner.findByIdAndDelete(id);

        if (!distributor) {
            return res.status(404).json({
                success: 0,
                message: "distributor not found",
            });
        }

        return res.status(200).json({
            success: 1,
            message: "distributor deleted successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};