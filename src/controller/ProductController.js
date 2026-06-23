const Product = require("../models/Product");

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
            url,
            short_description,
            description,
            category,
            subcategory,
            seo_title,
            seo_description,
            seo_keywords,
            sort_order,
        } = req.body;

        const image = req.files?.image?.[0]
            ? req.files.image[0].path.replace(/\\/g, "/")
            : null;

        const data_sheet =
            req.files?.data_sheet?.map((file) => ({
                file_name: file.originalname,
                file: file.path.replace(/\\/g, "/"),
            })) || [];



        const product = await Product.create({
            title,
            slug: makeSlug(title),

            short_description,
            description,
            category,
            subcategory,
            image,
            data_sheet,

            seo_title,
            seo_description,
            seo_keywords:
                typeof seo_keywords === "string"
                    ? seo_keywords.split(",").map((item) => item.trim())
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

        if (req.files?.image?.length) {
            updateData.image = req.files.image[0].filename;
        }

        if (req.files?.data_sheet?.length) {
            updateData.data_sheet = req.files.data_sheet.map((file) => ({
                file_name: file.originalname,
                file: file.filename,
            }));
        }



        if (typeof req.body.seo_keywords === "string") {
            updateData.seo_keywords = req.body.seo_keywords
                .split(",")
                .map((item) => item.trim());
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

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

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.subcategory) {
            filter.subcategory = req.query.subcategory;
        }

        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive;
        }

        const products = await Product.find(filter)
            .populate("category", "title")
            .populate("subcategory", "title")
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

        const product = await Product.findById(id)
            .populate("category", "title")
            .populate("subcategory", "title");

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