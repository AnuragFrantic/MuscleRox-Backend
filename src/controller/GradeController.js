const GradeModel = require("../models/GradeModel");
const Setting = require("../models/Setting");






const makeSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};


// CREATE GRADE
exports.create_grade = async (req, res) => {
    try {
        const fields = ["title", "type"];

        const emptyFields = fields.filter(
            (field) => !req.body[field]
        );

        if (emptyFields.length > 0) {
            return res.json({
                success: 0,
                errors: "The following fields are required:",
                fields: emptyFields,
            });
        }

        const data = { ...req.body };

        // Generate slug
        data.slug = makeSlug(req.body.title);

        // Handle file
        if (req.file) {
            data.file = req.file.path;
        }

        // Convert parent into array
        if (req.body.parent) {
            let parent = req.body.parent;

            if (!Array.isArray(parent)) {
                try {
                    parent = JSON.parse(parent);
                } catch (error) {
                    parent = parent.split(",");
                }
            }

            data.parent = parent;
        } else {
            data.parent = [];
        }

        const resp = await GradeModel.create(data);

        return res.json({
            success: 1,
            message: "Created successfully",
            data: resp,
        });

    } catch (err) {
        return res.json({
            success: 0,
            message: err.message,
            data: req.body,
        });
    }
};


// GET GRADES
exports.get_grade = async (req, res) => {
    try {
        const {
            id,
            slug,
            keyword,
            type,
            title,
            parent,
            page = 1,
            perPage = 10,
        } = req.query;

        const fdata = {};

        // =========================
        // ACTIVE FILTER
        // =========================
        if (!req.user || req.user.role === "User") {
            fdata.isActive = true;
        }

        // =========================
        // ID
        // =========================
        if (id) {
            fdata._id = id;
        }

        // =========================
        // SLUG
        // =========================
        if (slug) {
            fdata.slug = slug;
        }

        // =========================
        // TYPE
        // =========================
        if (type) {
            fdata.type = {
                $in: type.split(",").filter(Boolean),
            };
        }

        // =========================
        // TITLE
        // =========================
        if (title) {
            fdata.title = {
                $regex: title,
                $options: "i",
            };
        }

        // =========================
        // KEYWORD
        // =========================
        if (keyword) {
            fdata.$or = [
                {
                    title: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    sub_title: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
            ];
        }

        // =========================
        // PARENT / SUB-CATEGORY
        // =========================
        if (parent) {
            const parentSlugs = parent
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

            // Find Setting records by slug
            const parentSettings = await Setting.find({
                slug: {
                    $in: parentSlugs,
                },
            }).select("_id");

            const parentIds = parentSettings.map(
                (item) => item._id
            );

            // If no parent found, return empty result
            if (parentIds.length === 0) {
                return res.json({
                    success: 1,
                    message: "No grades found",
                    data: [],
                    pagination: {
                        page: Number(page),
                        perPage: Number(perPage),
                        total: 0,
                        totalPages: 0,
                    },
                });
            }

            fdata.parent = {
                $in: parentIds,
            };
        }

        // =========================
        // PAGINATION
        // =========================
        const currentPage = Math.max(Number(page), 1);
        const limit = Math.max(Number(perPage), 1);
        const skip = (currentPage - 1) * limit;

        // =========================
        // QUERY
        // =========================
        const [resp, total] = await Promise.all([
            GradeModel.find(fdata)
                .populate({
                    path: "parent",
                })
                .sort({
                    position: 1,
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .lean(),

            GradeModel.countDocuments(fdata),
        ]);

        return res.json({
            success: 1,
            message: "Fetched successfully",
            data: resp,
            pagination: {
                page: currentPage,
                perPage: limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (err) {
        console.error("GET GRADE ERROR:", err);

        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};


// UPDATE GRADE
exports.update_grade = async (req, res) => {
    try {
        const data = { ...req.body };

        // Update slug if title is provided
        if (req.body.title) {
            data.slug = makeSlug(req.body.title);
        }

        // Handle file
        if (req.file) {
            data.file = req.file.path;
        }

        // Convert parent into array
        if (req.body.parent !== undefined) {
            let parent = req.body.parent;

            if (!Array.isArray(parent)) {
                try {
                    parent = JSON.parse(parent);
                } catch (error) {
                    parent = parent.split(",");
                }
            }

            data.parent = parent;
        }

        const resp = await GradeModel.findOneAndUpdate(
            {
                _id: req.params.id,
            },
            {
                $set: {
                    ...data,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!resp) {
            return res.json({
                success: 0,
                message: "Grade not found",
            });
        }

        return res.json({
            success: 1,
            message: "Updated successfully",
            data: resp,
        });

    } catch (err) {
        return res.json({
            success: 0,
            message: err.message,
        });
    }
};


// DELETE GRADE
exports.delete_grade = async (req, res) => {
    try {
        const resp = await GradeModel.deleteOne({
            _id: req.params.id,
        });

        return res.json({
            success: 1,
            message: "Deleted successfully",
            data: resp,
        });

    } catch (err) {
        return res.json({
            success: 0,
            message: err.message,
        });
    }
};


// UPDATE ACTIVATION
exports.update_activation = async (req, res) => {
    try {
        const { id } = req.params;

        const findGrade = await GradeModel.findById(id);

        if (!findGrade) {
            return res.status(404).json({
                success: 0,
                message: "Not found",
            });
        }

        findGrade.isActive = !findGrade.isActive;

        await findGrade.save();

        return res.json({
            success: 1,
            message: "Updated successfully",
            data: {
                id: findGrade._id,
                isActive: findGrade.isActive,
            },
        });

    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};

