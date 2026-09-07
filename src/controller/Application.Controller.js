const ApplicationModel = require("../models/Application.model");
const GradeModel = require("../models/GradeModel");
const Setting = require("../models/Setting");



// =========================
// MAKE SLUG
// =========================
const makeSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};


// =========================
// CONVERT TO ARRAY
// =========================
const convertToArray = (value) => {
    if (value === undefined || value === null || value === "") {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
            return parsed;
        }

        return [parsed];
    } catch (error) {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }
};


// =========================
// CREATE APPLICATION
// =========================
exports.create_application = async (req, res) => {
    try {
        const body = req.body || {};

        const fields = ["title", "type"];

        const emptyFields = fields.filter(
            (field) => !body[field]
        );

        if (emptyFields.length > 0) {
            return res.status(400).json({
                success: 0,
                message: "The following fields are required",
                fields: emptyFields,
            });
        }

        console.log("REQ.BODY:", body);
        console.log("REQ.FILES:", req.files);


        const data = {
            ...body,
            color: body.color || null,

            slug: body.slug
                ? body.slug
                : makeSlug(body.title),

            grand_parent_id: convertToArray(
                body.grand_parent_id
            ),

            parent_id: convertToArray(
                body.parent_id
            ),

            grade: convertToArray(
                body.grade
            ),

        };


        // =========================
        // FILE
        // =========================
        if (req.files?.file?.[0]) {
            data.file = req.files.file[0].path;
        }


        // =========================
        // ICON
        // =========================
        if (req.files?.icon?.[0]) {
            data.icon = req.files.icon[0].path;
        }


        console.log("FINAL DATA:", data);


        const resp =
            await ApplicationModel.create(data);


        return res.status(201).json({
            success: 1,
            message: "Application created successfully",
            data: resp,
        });

    } catch (err) {
        console.error(
            "CREATE APPLICATION ERROR:",
            err
        );

        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};


// =========================
// GET APPLICATIONS
// =========================

exports.get_application = async (req, res) => {
    try {
        const {
            id,
            slug,
            keyword,
            type,
            title,
            color,
            grand_parent_id,
            parent_id,
            grade,

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
                $in: type
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
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
                {
                    short_description: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
            ];
        }

        // =========================
        // GRAND PARENT
        // =========================
        if (grand_parent_id) {
            const grandParentSlugs = convertToArray(grand_parent_id);

            const grandParents = await ApplicationModel.find({
                slug: {
                    $in: grandParentSlugs,
                },
            })
                .select("_id")
                .lean();

            const grandParentIds = grandParents.map(
                (item) => item._id
            );

            console.log("GRAND PARENT SLUGS:", grandParentSlugs);
            console.log("GRAND PARENT IDS:", grandParentIds);

            fdata.grand_parent_id = {
                $in: grandParentIds,
            };
        }

        // =========================
        // PARENT
        // =========================
        if (parent_id) {
            const parentSlugs = convertToArray(parent_id);

            const parents = await ApplicationModel.find({
                slug: {
                    $in: parentSlugs,
                },
            })
                .select("_id")
                .lean();

            const parentIds = parents.map(
                (item) => item._id
            );

            console.log("PARENT SLUGS:", parentSlugs);
            console.log("PARENT IDS:", parentIds);

            fdata.parent_id = {
                $in: parentIds,
            };
        }

        // =========================
        // GRADE
        // =========================
        if (grade) {
            const gradeSlugs = convertToArray(grade);

            const grades = await GradeModel.find({
                slug: {
                    $in: gradeSlugs,
                },
            })
                .select("_id")
                .lean();

            const gradeIds = grades.map(
                (item) => item._id
            );

            console.log("GRADE SLUGS:", gradeSlugs);
            console.log("GRADE IDS:", gradeIds);

            fdata.grade = {
                $in: gradeIds,
            };
        }

        // =========================
        // COLOR
        // =========================
        if (color) {
            const colorSlugs = convertToArray(color);

            const colors = await Setting.find({
                slug: {
                    $in: colorSlugs,
                },
            })
                .select("_id")
                .lean();

            const colorIds = colors.map(
                (item) => item._id
            );

            console.log("COLOR SLUGS:", colorSlugs);
            console.log("COLOR IDS:", colorIds);

            fdata.color = {
                $in: colorIds,
            };
        }

        // =========================
        // PAGINATION
        // =========================
        const currentPage = Math.max(Number(page), 1);
        const limit = Math.max(Number(perPage), 1);
        const skip = (currentPage - 1) * limit;

        console.log("FINAL FILTER:", fdata);

        // =========================
        // FETCH
        // =========================
        const [resp, total] = await Promise.all([
            ApplicationModel.find(fdata)
                .populate("grand_parent_id")
                .populate("parent_id")
                .populate({
                    path: "grade",
                    select: "title slug parent",
                    populate: {
                        path: "parent",
                        select: "title slug",
                    },
                })
                .populate("color")
                .sort({
                    position: 1,
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .lean(),

            ApplicationModel.countDocuments(fdata),
        ]);

        return res.json({
            success: 1,
            message: "Applications fetched successfully",
            data: resp,
            pagination: {
                page: currentPage,
                perPage: limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (err) {
        console.error("GET APPLICATION ERROR:", err);

        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};




// =========================
// UPDATE APPLICATION
// =========================
exports.update_application = async (req, res) => {
    try {
        const body = req.body || {};

        const data = {
            ...body,
        };


        // =========================
        // UPDATE SLUG
        // =========================
        if (body.title) {
            data.slug = makeSlug(body.title);
        }


        // =========================
        // GRAND PARENT
        // =========================
        if (body.grand_parent_id !== undefined) {
            data.grand_parent_id = convertToArray(
                body.grand_parent_id
            );
        }


        if (body.color != undefined) {
            data.color = body.color;
        }


        // =========================
        // PARENT
        // =========================
        if (body.parent_id !== undefined) {
            data.parent_id = convertToArray(
                body.parent_id
            );
        }


        // =========================
        // GRADE
        // =========================
        if (body.grade !== undefined) {
            data.grade = convertToArray(
                body.grade
            );
        }


        // =========================
        // FILE
        // =========================
        if (req.files?.file?.[0]) {
            data.file = req.files.file[0].path;
        }


        // =========================
        // ICON
        // =========================
        if (req.files?.icon?.[0]) {
            data.icon = req.files.icon[0].path;
        }


        console.log("UPDATE BODY:", body);
        console.log("UPDATE FILES:", req.files);
        console.log("UPDATE DATA:", data);


        // =========================
        // UPDATE
        // =========================
        const resp =
            await ApplicationModel.findOneAndUpdate(
                {
                    _id: req.params.id,
                },
                {
                    $set: data,
                },
                {
                    new: true,
                    runValidators: true,
                }
            )
                .populate("grand_parent_id")
                .populate("parent_id")
                .populate("grade");


        // =========================
        // NOT FOUND
        // =========================
        if (!resp) {
            return res.status(404).json({
                success: 0,
                message: "Application not found",
            });
        }


        // =========================
        // RESPONSE
        // =========================
        return res.json({
            success: 1,
            message: "Application updated successfully",
            data: resp,
        });

    } catch (err) {
        console.error(
            "UPDATE APPLICATION ERROR:",
            err
        );

        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};


// =========================
// DELETE APPLICATION
// =========================
exports.delete_application = async (
    req,
    res
) => {
    try {
        const resp =
            await ApplicationModel.deleteOne({
                _id: req.params.id,
            });


        if (resp.deletedCount === 0) {
            return res.status(404).json({
                success: 0,
                message: "Application not found",
            });
        }


        return res.json({
            success: 1,
            message: "Application deleted successfully",
            data: resp,
        });

    } catch (err) {
        console.error(
            "DELETE APPLICATION ERROR:",
            err
        );

        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};


// =========================
// UPDATE ACTIVATION
// =========================
exports.update_activation = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const application =
            await ApplicationModel.findById(id);


        if (!application) {
            return res.status(404).json({
                success: 0,
                message: "Application not found",
            });
        }


        application.isActive =
            !application.isActive;


        await application.save();


        return res.json({
            success: 1,
            message: "Application status updated successfully",
            data: {
                id: application._id,
                isActive:
                    application.isActive,
            },
        });

    } catch (err) {
        console.error(
            "UPDATE APPLICATION ACTIVATION ERROR:",
            err
        );

        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};