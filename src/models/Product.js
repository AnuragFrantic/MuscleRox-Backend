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

        category: {
            type: Schema.Types.ObjectId,
            ref: "Setting",
            required: true,
        },
        colors: {
            type: Schema.Types.ObjectId,
            ref: "Setting",
            required: true,
        },

        subcategory: {
            type: Schema.Types.ObjectId,
            ref: "Setting",
            required: true,
        },

        images: [
            {
                path: { type: String },
                filename: { type: String },
                file_type: { type: String },
            },
        ],



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