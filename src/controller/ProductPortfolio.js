const ProductPortfolio = require("../models/ProductPortflio");

// Create Product Portfolio
exports.createProductPortfolio = async (req, res) => {
    try {
        const data = { ...req.body };

        // File upload
        if (req.files?.file?.[0]) {
            data.file = req.files.file[0].path.replace(/\\/g, "/");
        }

        const portfolio = await ProductPortfolio.create(data);

        return res.status(201).json({
            success: true,
            message: "Product portfolio created successfully",
            data: portfolio,
        });
    } catch (error) {
        console.error("Create Product Portfolio Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// Get All Product Portfolios
exports.getProductPortfolios = async (req, res) => {
    try {
        const {
            search,
            category,
            subcategory,
            type,
            isActive,
            page = 1,
            limit = 10,
        } = req.query;

        const query = {};

        // Search by title / sub_title
        if (search) {
            query.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    sub_title: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        if (category) {
            query.category = category;
        }

        if (subcategory) {
            query.subcategory = subcategory;
        }

        if (type) {
            query.type = type;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.max(Number(limit) || 10, 1);

        const skip = (pageNumber - 1) * limitNumber;

        const [portfolios, total] = await Promise.all([
            ProductPortfolio.find(query)
                .populate("category", "title name")
                .populate("subcategory", "title name")
                .sort({ position: 1, createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            ProductPortfolio.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            count: portfolios.length,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            data: portfolios,
        });
    } catch (error) {
        console.error("Get Product Portfolios Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get Product Portfolio By ID
exports.getProductPortfolioById = async (req, res) => {
    try {
        const portfolio = await ProductPortfolio.findById(req.params.id)
            .populate("category", "title name")
            .populate("subcategory", "title name");

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: "Product portfolio not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: portfolio,
        });
    } catch (error) {
        console.error("Get Product Portfolio Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Update Product Portfolio
exports.updateProductPortfolio = async (req, res) => {
    try {
        const data = { ...req.body };

        // Update file only if a new file is uploaded
        if (req.files?.file?.[0]) {
            data.file = req.files.file[0].path.replace(/\\/g, "/");
        }

        const portfolio = await ProductPortfolio.findByIdAndUpdate(
            req.params.id,
            data,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: "Product portfolio not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product portfolio updated successfully",
            data: portfolio,
        });
    } catch (error) {
        console.error("Update Product Portfolio Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// Delete Product Portfolio
exports.deleteProductPortfolio = async (req, res) => {
    try {
        const portfolio = await ProductPortfolio.findByIdAndDelete(
            req.params.id
        );

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: "Product portfolio not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product portfolio deleted successfully",
        });
    } catch (error) {
        console.error("Delete Product Portfolio Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};