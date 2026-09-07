const Job = require("../models/Job");

// Convert form-data values into proper arrays
const normalizeArray = (value) => {
    if (value === undefined || value === null || value === "") {
        return [];
    }

    // Already an array
    if (Array.isArray(value)) {
        // Handle ["[\"<div>text</div>\"]"] type data
        if (value.length === 1 && typeof value[0] === "string") {
            const singleValue = value[0].trim();

            if (
                (singleValue.startsWith("[") && singleValue.endsWith("]")) ||
                (singleValue.startsWith('"') && singleValue.endsWith('"'))
            ) {
                try {
                    const parsed = JSON.parse(singleValue);

                    if (Array.isArray(parsed)) {
                        return parsed;
                    }

                    if (typeof parsed === "string") {
                        return [parsed];
                    }
                } catch (error) {
                    // Keep original value if JSON parsing fails
                }
            }
        }

        return value
            .map((item) => {
                if (typeof item !== "string") return item;

                const trimmed = item.trim();

                // Handle JSON string inside array
                if (
                    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
                    (trimmed.startsWith('"') && trimmed.endsWith('"'))
                ) {
                    try {
                        const parsed = JSON.parse(trimmed);

                        if (Array.isArray(parsed)) {
                            return parsed;
                        }

                        return parsed;
                    } catch (error) {
                        return item;
                    }
                }

                return item;
            })
            .flat()
            .filter((item) => item !== "");
    }

    // Handle JSON string
    if (typeof value === "string") {
        const trimmed = value.trim();

        try {
            const parsed = JSON.parse(trimmed);

            if (Array.isArray(parsed)) {
                return parsed;
            }

            if (typeof parsed === "string") {
                return [parsed];
            }
        } catch (error) {
            // If it's not JSON, treat it as a single item
        }

        return [value];
    }

    return [];
};


// Convert number fields safely
const normalizeNumber = (value, defaultValue = undefined) => {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "null" ||
        value === "undefined"
    ) {
        return defaultValue;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : defaultValue;
};


// Normalize experience
const normalizeExperience = (experience) => {
    if (!experience) {
        return {
            min: 0,
        };
    }

    let parsedExperience = experience;

    if (typeof experience === "string") {
        try {
            parsedExperience = JSON.parse(experience);
        } catch (error) {
            parsedExperience = {};
        }
    }

    const result = {
        min: normalizeNumber(parsedExperience.min, 0),
    };

    const max = normalizeNumber(parsedExperience.max);

    if (max !== undefined) {
        result.max = max;
    }

    return result;
};


// Normalize salary
const normalizeSalary = (salary) => {
    if (!salary) {
        return undefined;
    }

    let parsedSalary = salary;

    if (typeof salary === "string") {
        try {
            parsedSalary = JSON.parse(salary);
        } catch (error) {
            parsedSalary = {};
        }
    }

    const result = {
        currency: parsedSalary.currency || "INR",
        isNegotiable:
            parsedSalary.isNegotiable === true ||
            parsedSalary.isNegotiable === "true",
    };

    const min = normalizeNumber(parsedSalary.min);
    const max = normalizeNumber(parsedSalary.max);

    if (min !== undefined) {
        result.min = min;
    }

    if (max !== undefined) {
        result.max = max;
    }

    return result;
};


// Prepare job data
const normalizeJobData = (body) => {
    const data = { ...body };

    // Arrays
    data.jobDescription = normalizeArray(data.jobDescription);
    data.qualifications = normalizeArray(data.qualifications);
    data.experienceDetails = normalizeArray(data.experienceDetails);
    data.benefits = normalizeArray(data.benefits);
    data.keywords = normalizeArray(data.keywords);

    // Objects
    data.experience = normalizeExperience(data.experience);
    data.salary = normalizeSalary(data.salary);

    // Number fields
    data.openings = normalizeNumber(data.openings, 1);

    // Remove empty optional values
    if (!data.applicationLink) {
        delete data.applicationLink;
    }

    if (!data.applicationEmail) {
        delete data.applicationEmail;
    }

    if (!data.lastDateToApply) {
        delete data.lastDateToApply;
    }

    return data;
};


// @route POST /api/jobs
// @desc Create a new job posting
exports.createJob = async (req, res) => {
    try {
        const data = normalizeJobData(req.body);

        // Image upload
        if (req.files?.image?.[0]) {
            data.image = req.files.image[0].path.replace(/\\/g, "/");
        }

        const job = await Job.create(data);

        res.status(201).json({
            success: true,
            data: job,
        });
    } catch (error) {
        console.error("Create Job Error:", error);

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// @route GET /api/jobs
// @desc List jobs
exports.getJobs = async (req, res) => {
    try {
        const {
            search,
            department,
            jobType,
            location,
            status = "Active",
            page = 1,
            limit = 10,
        } = req.query;

        const query = { status };

        if (search) {
            query.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    department: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        if (department) {
            query.department = department;
        }

        if (jobType) {
            query.jobType = jobType;
        }

        if (location) {
            query.location = {
                $regex: location,
                $options: "i",
            };
        }

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.max(Number(limit) || 10, 1);

        const skip = (pageNumber - 1) * limitNumber;

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            Job.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            count: jobs.length,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            data: jobs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// @route GET /api/jobs/:idOrSlug
// @desc Get single job
exports.getJobBySlugOrId = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("id", id)

        const query = /^[0-9a-fA-F]{24}$/.test(id)
            ? { _id: id }
            : { slug: id };

        const job = await Job.findOne(query);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        res.status(200).json({
            success: true,
            data: job,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// @route PUT /api/jobs/:id
// @desc Update a job posting
exports.updateJob = async (req, res) => {
    try {
        const data = normalizeJobData(req.body);

        // Image upload
        if (req.files?.image?.[0]) {
            data.image = req.files.image[0].path.replace(/\\/g, "/");
        }

        const job = await Job.findByIdAndUpdate(
            req.params.id,
            data,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        res.status(200).json({
            success: true,
            data: job,
        });
    } catch (error) {
        console.error("Update Job Error:", error);

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// @route DELETE /api/jobs/:id
// @desc Delete a job
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Job deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};