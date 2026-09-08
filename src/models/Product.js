const mongoose = require("mongoose");
const { Schema } = mongoose;

const fileSchema = new Schema(
    {
        file_name: {
            type: String,
            required: true,
        },
        file: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const productSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },



        short_description: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            default: "",
        },


        colors: {
            type: Schema.Types.ObjectId,
            ref: "Setting",
            required: true,
        },

        // was a single required ObjectId — changed to an optional array so a
        // product can recommend zero, one, or several other products, and the
        // very first product created isn't forced to reference one that
        // doesn't exist yet.
        grade: [
            {
                type: Schema.Types.ObjectId,
                ref: "Grade",
            },
        ],

        application_id: {
            type: Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },

        color_range: [
            {
                path: { type: String },
                filename: { type: String },
                file_type: { type: String },
            },
        ],
        image: {
            type: String
        },
        aboutuscontent: {
            type: String,
        },
        key_benefit: {
            type: String,
        },


        data_sheet: [fileSchema],

        safety_data_sheet: [fileSchema],

        seo_title: {
            type: String,
            default: "",
        },

        seo_description: {
            type: String,
            default: "",
        },

        seo_keywords: [
            {
                type: String,
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },

        sort_order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);