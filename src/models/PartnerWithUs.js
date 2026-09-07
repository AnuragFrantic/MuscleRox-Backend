const mongoose = require("mongoose");
const { Schema } = mongoose;

const PartnerWithUs = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        company_name: {
            type: String,
            default: "",
        },

        company_website: {
            type: String,
            default: "",
        },

        country: {
            type: String,
            default: "",
        },

        city: {
            type: String,
            default: "",
        },









        phone: {
            type: String,
            default: "",
        },
        current_location: {
            type: String,
        },


        category: {
            type: Schema.Types.ObjectId,
            ref: "Setting",
            required: false,
        },
        subcategory: {
            type: Schema.Types.ObjectId,
            ref: "Setting",
            required: false,
        },





        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        message: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("PartnerWithUs", PartnerWithUs);