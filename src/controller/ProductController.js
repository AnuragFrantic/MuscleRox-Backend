
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const Product = require('../models/Product');
const ApplicationModel = require('../models/Application.model');
const Setting = require('../models/Setting');
const mongoose = require("mongoose");

const makeSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
    try {
        const {
            title,
            short_description,
            description,
            colors,              // Setting ref, single ObjectId (required in schema)
            grade, // Product ref, array of ObjectIds (optional)
            application_id,      // Application ref, single ObjectId (required in schema)
            aboutuscontent,
            key_benefit,
            seo_title,
            seo_description,
            seo_keywords,
            sort_order,
        } = req.body;

        // multiple gallery images -> array of { path, filename, file_type }
        const uploadedImages = req.files?.color_range || [];

        const color_range = uploadedImages.map((f) => ({
            path: f.path.replace(/\\/g, "/"),
            filename: f.originalname,
            file_type: f.mimetype,
        }));

        const data_sheet =
            req.files?.data_sheet?.map((file) => ({
                file_name: file.originalname,
                file: file.path.replace(/\\/g, "/"),
            })) || [];

        const safety_data_sheet =
            req.files?.safety_data_sheet?.map((file) => ({
                file_name: file.originalname,
                file: file.path.replace(/\\/g, "/"),
            })) || [];

        // schema's "image" is a single main image, separate from the color_range gallery
        const image = req.files?.image?.[0]
            ? req.files.image[0].path.replace(/\\/g, "/")
            : undefined;

        // grade can arrive as a real array (JSON body) or a
        // comma-separated string (multipart form field) — normalize both
        const normalizedRecommended =
            typeof grade === "string"
                ? grade.split(",").map((item) => item.trim()).filter(Boolean)
                : grade || [];

        const product = await Product.create({
            title,
            slug: makeSlug(title),
            short_description,
            description,
            colors,
            grade: normalizedRecommended,
            application_id,
            image,
            aboutuscontent,
            key_benefit,
            color_range,
            data_sheet,
            safety_data_sheet,
            seo_title,
            seo_description,
            seo_keywords:
                typeof seo_keywords === "string"
                    ? seo_keywords.split(",").map((item) => item.trim()).filter(Boolean)
                    : seo_keywords || [],
            sort_order,
        });

        return res.status(201).json({
            success: 1,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: 0,
                message: "Product not found",
            });
        }

        const updateData = {
            ...req.body,
        };

        if (req.body.title) {
            updateData.slug = makeSlug(req.body.title);
        }

        if (typeof req.body.seo_keywords === "string") {
            updateData.seo_keywords = req.body.seo_keywords
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        }

        if (typeof req.body.grade === "string") {
            updateData.grade = req.body.grade
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        }

        // color_range (gallery) gets appended, not replaced — schema field is
        // "color_range", not "images" (that field doesn't exist on this model)
        const uploadedImages = req.files?.color_range || [];
        if (uploadedImages.length) {
            const newImages = uploadedImages.map((f) => ({
                path: f.path.replace(/\\/g, "/"),
                filename: f.originalname,
                file_type: f.mimetype,
            }));

            product.color_range = Array.isArray(product.color_range)
                ? product.color_range.concat(newImages)
                : newImages;

            await product.save();
        }

        // "image" is the single main image — replaced, not appended
        if (req.files?.image?.[0]) {
            updateData.image = req.files.image[0].path.replace(/\\/g, "/");
        }

        if (req.files?.data_sheet?.length) {
            updateData.data_sheet = req.files.data_sheet.map((file) => ({
                file_name: file.originalname,
                file: file.path.replace(/\\/g, "/"),
            }));
        }

        if (req.files?.safety_data_sheet?.length) {
            updateData.safety_data_sheet = req.files.safety_data_sheet.map((file) => ({
                file_name: file.originalname,
                file: file.path.replace(/\\/g, "/"),
            }));
        }

        // color_range is already handled and saved above — don't let a stale
        // value from req.body overwrite it in the branches below
        delete updateData.color_range;

        let updatedProduct;
        if (uploadedImages.length) {
            Object.assign(product, updateData);
            updatedProduct = await product.save();
        } else {
            updatedProduct = await Product.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );
        }

        return res.json({
            success: 1,
            message: "Product updated successfully",
            data: updatedProduct,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
    try {
        const filter = {};
        const mongoose = require("mongoose"); // if not already imported at top

        // schema has no category/subcategory fields — products link to a
        // single application via application_id instead
        if (req.query.application_id) {
            const value = req.query.application_id;

            if (mongoose.Types.ObjectId.isValid(value)) {
                // looks like a real ObjectId — use it directly
                filter.application_id = value;
            } else {
                // treat it as a slug, e.g. ?application_id=water-based
                const application = await ApplicationModel.findOne({
                    slug: makeSlug(value),
                }).select("_id");

                if (!application) {
                    return res.json({
                        success: 1,
                        count: 0,
                        data: [],
                    });
                }

                filter.application_id = application._id;
            }
        }

        if (req.query.applicationSlug) {
            const application = await ApplicationModel.findOne({
                slug: makeSlug(req.query.applicationSlug),
            }).select("_id");

            if (!application) {
                return res.json({
                    success: 1,
                    count: 0,
                    data: [],
                });
            }

            filter.application_id = application._id;
        }

        if (req.query.colors) {
            const colorSetting = await Setting.findOne({
                title: req.query.colors,
            }).select("_id");

            if (!colorSetting) {
                return res.json({
                    success: 1,
                    count: 0,
                    data: [],
                });
            }

            filter.colors = colorSetting._id;
        }

        if (req.query.slug) {
            filter.slug = req.query.slug;
        }

        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive;
        }

        if (req.query.search) {
            filter.title = {
                $regex: req.query.search,
                $options: "i",
            };
        }

        const products = await Product.find(filter)
            .populate("colors", "title slug")
            .populate("application_id", "title slug")
            .populate("grade", "title slug image")
            .sort({ sort_order: 1, createdAt: -1 });

        return res.json({
            success: 1,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};
// GET SINGLE PRODUCT





exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        let filter;

        if (mongoose.Types.ObjectId.isValid(id)) {
            filter = {
                $or: [
                    { _id: id },
                    { slug: id },
                ],
            };
        } else {
            filter = {
                slug: id,
            };
        }

        const product = await Product.findOne(filter)
            .populate("colors", "title slug")
            .populate({
                path: "application_id",
                select: "title slug parent_id",
                populate: {
                    path: "parent_id",
                    select: "title slug",
                },
            })
            .populate(
                "grade",
                "title slug image"
            );

        if (!product) {
            return res.status(404).json({
                success: 0,
                message: "Product not found",
            });
        }

        return res.json({
            success: 1,
            data: product,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};









// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: 0,
                message: "Product not found",
            });
        }

        return res.json({
            success: 1,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// DELETE single gallery image from product.color_range by subdoc _id and remove file from disk
exports.deleteProductImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: 0, message: 'Product not found' });
        }

        // schema field is "color_range", not "images" — that field doesn't
        // exist on this model, so the old code would throw here
        const imgSub = product.color_range.id(imageId);
        if (!imgSub) {
            return res.status(404).json({ success: 0, message: 'Image not found on this product' });
        }

        const filePath = imgSub.path;

        product.color_range.pull(imageId);

        await product.save();

        // attempt to delete file from disk (ignore errors)
        try {
            const abs = path.resolve(filePath);
            await fsp.unlink(abs).catch(() => { });
        } catch (_) { }

        return res.json({ success: 1, message: 'Image removed', data: product });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: 0, message: error.message });
    }
};

// GET RELATED PRODUCTS
exports.getRelatedProducts = async (req, res) => {
    try {
        const { application_id, productId } = req.query;

        if (!application_id) {
            return res.status(400).json({
                success: 0,
                message: "application_id is required",
            });
        }

        const filter = {
            application_id,
            isActive: true,
        };

        if (productId) {
            filter._id = { $ne: productId };
        }

        const products = await Product.find(filter)
            .populate("colors", "title")
            .populate("application_id", "title")
            .sort({ sort_order: 1, createdAt: -1 });

        return res.json({
            success: 1,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

/*
 * NOTE: `colors` and `application_id` are still `required: true` single
 * ObjectIds on the schema — product creation will fail with a Mongoose
 * validation error if the admin form doesn't send both. Worth confirming
 * that's actually intended before shipping the create form.
 */



// const deleteProduct = async (req, res) => {
//     try {
//         const result = await Product.deleteMany({});

//         return res.json({
//             success: 1,
//             message: "Categories and sub-categories deleted successfully",
//             deletedCount: result.deletedCount
//         });

//     } catch (err) {
//         return res.status(500).json({
//             success: 0,
//             message: err.message
//         });
//     }
// };

// deleteProduct()