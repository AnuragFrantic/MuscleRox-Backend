const Media = require("../models/Media");

const makeSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

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

        const uploadedFiles = req.files?.images || req.files?.image || [];
        const images = uploadedFiles.map((f) => ({
            path: f.path.replace(/\\/g, "/"),
            filename: f.originalname,
            file_type: f.mimetype,
        }));
        const image = images.length ? images[0].path : null;

        const media = await Media.create({
            title,
            slug: makeSlug(title),
            short_description,
            description,
            media_category,
            image,
            images,
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

        const uploaded = req.files?.images || req.files?.image || [];
        if (uploaded?.length) {
            const newImages = uploaded.map((f) => ({
                path: f.path.replace(/\\/g, "/"),
                filename: f.originalname,
                file_type: f.mimetype,
            }));

            // append new images to existing media.images
            media.images = Array.isArray(media.images) ? media.images.concat(newImages) : newImages;
            // ensure primary image is set
            media.image = media.images.length ? media.images[0].path : null;

            await media.save();
        }

        if (typeof req.body.seo_keywords === "string") {
            updateData.seo_keywords = req.body.seo_keywords
                .split(",")
                .map((item) => item.trim());
        }

        // If we already saved after image upload, refresh the media, otherwise apply other updates
        let updatedMedia;
        if (uploaded?.length) {
            // merge other fields
            Object.assign(media, updateData);
            updatedMedia = await media.save();
        } else {
            updatedMedia = await Media.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );
        }

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

// DELETE single image from media.images by image _id and remove file from disk
exports.deleteMediaImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        const media = await Media.findById(id);
        if (!media) return res.status(404).json({ success: 0, message: 'Media not found' });

        const imgSub = media.images.id(imageId);
        if (!imgSub) return res.status(404).json({ success: 0, message: 'Image not found on this media' });

        const filePath = imgSub.path;

        // remove subdocument (Mongoose 7+: subdoc.remove() no longer exists)
        media.images.pull(imageId);

        // update primary image
        media.image = media.images.length ? media.images[0].path : null;

        await media.save();

        // attempt to delete file from disk (ignore errors)
        try {
            const abs = path.resolve(filePath);
            await fsp.unlink(abs).catch(() => { });
        } catch (_) { }

        return res.json({ success: 1, message: 'Image removed', data: media });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: 0, message: error.message });
    }
};