const mongoose = require("mongoose");
const ColorsRange = require("../models/ColorsRange");
const Setting = require("../models/Setting");

const create_colors_range = async (req, res) => {
    try {
        const { settingId } = req.body;
        if (!settingId || !mongoose.Types.ObjectId.isValid(settingId)) {
            return res.status(400).json({ success: 0, message: "A valid settingId is required" });
        }

        const setting = await Setting.findById(settingId).select("_id");
        if (!setting) {
            return res.status(404).json({ success: 0, message: "Setting not found" });
        }

        const images = (req.files || []).map(file => file.path);
        if (images.length === 0) {
            return res.status(400).json({ success: 0, message: "At least one image is required" });
        }

        const data = await ColorsRange.create({ settingId: setting._id, images });
        return res.status(201).json({
            success: 1,
            message: "Colors range created successfully",
            data
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

const get_colors_ranges = async (req, res) => {
    try {
        const data = await ColorsRange.find()
            .populate("settingId")
            .sort({ createdAt: -1 });
        return res.json({ success: 1, message: "Colors ranges fetched successfully", data });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

const get_colors_range = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: 0, message: "Invalid colors range id" });
        }

        const data = await ColorsRange.findById(req.params.id).populate("settingId");
        if (!data) {
            return res.status(404).json({ success: 0, message: "Colors range not found" });
        }
        return res.json({ success: 1, message: "Colors range fetched successfully", data });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

const get_colors_ranges_by_setting_slug = async (req, res) => {
    try {
        const setting = await Setting.findOne({ slug: req.params.slug }).select("_id");
        if (!setting) {
            return res.status(404).json({ success: 0, message: "Setting not found" });
        }

        const data = await ColorsRange.find({ settingId: setting._id })
            .populate("settingId")
            .sort({ createdAt: -1 });
        return res.json({ success: 1, message: "Colors ranges fetched successfully", data });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

const update_colors_range = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: 0, message: "Invalid colors range id" });
        }

        const data = {};
        if (req.body.settingId !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(req.body.settingId)) {
                return res.status(400).json({ success: 0, message: "A valid settingId is required" });
            }

            const setting = await Setting.findById(req.body.settingId).select("_id");
            if (!setting) {
                return res.status(404).json({ success: 0, message: "Setting not found" });
            }
            data.settingId = setting._id;
        }

        if (req.files?.length) {
            data.images = req.files.map(file => file.path);
        }

        const updated = await ColorsRange.findByIdAndUpdate(
            req.params.id,
            { $set: data },
            { new: true, runValidators: true }
        ).populate("settingId");
        if (!updated) {
            return res.status(404).json({ success: 0, message: "Colors range not found" });
        }
        return res.json({ success: 1, message: "Colors range updated successfully", data: updated });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

const delete_colors_range = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: 0, message: "Invalid colors range id" });
        }

        const data = await ColorsRange.findByIdAndDelete(req.params.id);
        if (!data) {
            return res.status(404).json({ success: 0, message: "Colors range not found" });
        }
        return res.json({ success: 1, message: "Colors range deleted successfully", data });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

module.exports = {
    create_colors_range,
    get_colors_ranges,
    get_colors_range,
    get_colors_ranges_by_setting_slug,
    update_colors_range,
    delete_colors_range
};
