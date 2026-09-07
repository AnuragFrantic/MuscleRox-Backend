const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        // used in URLs, auto-generated from title in the pre-save hook below
        slug: {
            type: String,
            unique: true,
            trim: true,
            index: true,
        },

        company: {
            type: String,
            required: true,
            trim: true,
            default: "MUSCLEROX",
        },

        // shown on the card, e.g. "Sales Department"
        department: {
            type: String,
            required: true,
            trim: true,
        },

        // e.g. "New Delhi, India"
        location: {
            type: String,
            required: true,
            trim: true,
        },

        // shown as a tag in "Job Overview" on the detail page
        workMode: {
            type: String,
            enum: ["Remote", "Hybrid", "Onsite"],
            default: "Onsite",
        },

        // shown on the card ("Full Time") and as a tag on the detail page ("Part - Time")
        jobType: {
            type: String,
            enum: ["Full Time", "Part Time", "Contract", "Internship", "Freelance"],
            required: true,
        },

        // shown as a tag on the detail page, e.g. "Senior Level"
        seniorityLevel: {
            type: String,
            enum: ["Entry Level", "Mid Level", "Senior Level", "Lead", "Manager"],
            default: "Mid Level",
        },

        // shown on the card, e.g. "2 - 4 Years"
        experience: {
            min: {
                type: Number,
                default: 0,
            },
            max: {
                type: Number,
            },
        },

        // shown as a tag on the detail page, e.g. "Salary 20,000 INR - 25,000 INR"
        salary: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: "INR",
            },
            isNegotiable: {
                type: Boolean,
                default: false,
            },
        },

        openings: {
            type: Number,
            default: 1,
        },

        // short blurb shown on the "Current Openings" card
        shortDescription: {
            type: String,
            required: true,
            trim: true,
        },

        // "About The Company" section on the detail page
        aboutCompany: {
            type: String,
            trim: true,
        },

        // "Job Description" bullet points on the detail page
        jobDescription: [
            {
                type: String,
            },
        ],

        // "Qualifications" bullet points
        qualifications: [
            {
                type: String,
            },
        ],

        // "Experience" bullet points (distinct from the numeric experience.min/max above,
        // which is used for card display + filtering)
        experienceDetails: [
            {
                type: String,
            },
        ],

        // "Benefits" bullet points
        benefits: [
            {
                type: String,
            },
        ],
        image: {
            type: String,

        },
        image_bg_color: {
            type: String,
        },

        applicationEmail: {
            type: String,
            trim: true,
        },

        applicationLink: {
            type: String,
            trim: true,
        },

        lastDateToApply: {
            type: Date,
        },

        // banner: {
        //     type: String,
        // },

        // thumbnail: {
        //     type: String,
        // },

        metaTitle: {
            type: String,
        },

        metaDescription: {
            type: String,
        },

        keywords: [
            {
                type: String,
            },
        ],

        status: {
            type: String,
            enum: ["Active", "Closed", "Draft"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

// simple slugify without a third-party dependency
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

JobSchema.pre("save", function () {
    if (this.isModified("title") || !this.slug) {
        this.slug = slugify(this.title);
    }
});

// virtual: turns createdAt into "Posted 5 days ago" without storing it
JobSchema.virtual("postedAgo").get(function () {
    const diffMs = Date.now() - this.createdAt;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;

    const weeks = Math.floor(days / 7);
    if (weeks === 1) return "1 week ago";
    if (weeks < 4) return `${weeks} weeks ago`;

    const months = Math.floor(days / 30);
    return months <= 1 ? "1 month ago" : `${months} months ago`;
});

JobSchema.set("toJSON", { virtuals: true });
JobSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Job", JobSchema);