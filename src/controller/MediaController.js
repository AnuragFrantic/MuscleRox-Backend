const Media = require("../models/Media");

const makeSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

// CREATE MEDIA
exports.createMedia = async (req, res) => {
    try {
        const {
            title,
            short_description,
            description,
            media_category,
            seo_title,
            seo_description,
            seo_keywords,
            isActive,
            sort_order,
        } = req.body;

        const image = req.files?.image?.[0]
            ? req.files.image[0].path.replace(/\\/g, "/")
            : null;

        const media = await Media.create({
            title,
            slug: makeSlug(title),
            short_description,
            description,
            media_category,
            image,
            seo_title,
            seo_description,
            seo_keywords:
                typeof seo_keywords === "string"
                    ? seo_keywords.split(",").map((item) => item.trim())
                    : seo_keywords || [],
            isActive,
            sort_order,
        });

        return res.status(201).json({
            success: 1,
            message: "Media created successfully",
            data: media,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// UPDATE MEDIA
exports.updateMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await Media.findById(id);

        if (!media) {
            return res.status(404).json({
                success: 0,
                message: "Media not found",
            });
        }

        const updateData = {
            ...req.body,
        };

        if (req.body.title) {
            updateData.slug = makeSlug(req.body.title);
        }

        if (req.files?.image?.length) {
            updateData.image = req.files.image[0].path.replace(/\\/g, "/");
        }

        if (typeof req.body.seo_keywords === "string") {
            updateData.seo_keywords = req.body.seo_keywords
                .split(",")
                .map((item) => item.trim());
        }

        const updatedMedia = await Media.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        return res.json({
            success: 1,
            message: "Media updated successfully",
            data: updatedMedia,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// GET ALL MEDIA
exports.getMedia = async (req, res) => {
    try {
        const filter = {};

        if (req.query.media_category) {
            filter.media_category = req.query.media_category;
        }

        if (req.query.slug) {
            filter.slug = req.query.slug;
        }

        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive;
        }

        const media = await Media.find(filter)
            .populate("media_category", "title")
            .sort({ sort_order: 1, createdAt: -1 });

        return res.json({
            success: 1,
            count: media.length,
            data: media,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// GET SINGLE MEDIA
exports.getSingleMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await Media.findById(id)
            .populate("media_category", "title");

        if (!media) {
            return res.status(404).json({
                success: 0,
                message: "Media not found",
            });
        }

        return res.json({
            success: 1,
            data: media,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// DELETE MEDIA
exports.deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await Media.findByIdAndDelete(id);

        if (!media) {
            return res.status(404).json({
                success: 0,
                message: "Media not found",
            });
        }

        return res.json({
            success: 1,
            message: "Media deleted successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};