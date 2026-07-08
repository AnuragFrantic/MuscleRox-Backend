const mongoose = require("mongoose");
const { Schema } = mongoose;



const mediaSchema = new Schema(
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

        media_category: {
            type: Schema.Types.ObjectId,
            ref: "Setting",
            required: true,
        },



        image: {
            type: String,
            default: null,
        },

        images: [
            {
                path: { type: String },
                filename: { type: String },
                file_type: { type: String },
            },
        ],




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

module.exports = mongoose.model("Media", mediaSchema);